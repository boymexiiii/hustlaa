const express = require('express');
const { authMiddleware, artisanMiddleware, customerMiddleware } = require('../middleware/auth');
const { createNotification } = require('./notifications');
const pool = require('../db/pool');

const router = express.Router();

async function getBookingPartyUserIds(bookingId) {
  const r = await pool.query(
    `SELECT b.id,
             b.customer_id,
             s.name AS service_name,
             au.id AS artisan_user_id
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN artisan_profiles ap ON b.artisan_id = ap.id
      JOIN users au ON ap.user_id = au.id
      WHERE b.id = $1`,
    [bookingId]
  );
  return r.rows[0] || null;
}

// Create recurring booking
router.post('/recurring', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const { artisan_id, service_id, booking_date, booking_time, location_address, latitude, longitude, recurrence_pattern, recurrence_end_date, notes } = req.body;

    if (!['weekly', 'biweekly', 'monthly'].includes(recurrence_pattern)) {
      return res.status(400).json({ error: 'Invalid recurrence pattern' });
    }

    // Get service price
    const serviceResult = await pool.query('SELECT * FROM services WHERE id = $1 AND artisan_id = $2', [service_id, artisan_id]);
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const service = serviceResult.rows[0];

    // Create parent booking
    const parentResult = await pool.query(`
      INSERT INTO bookings (customer_id, artisan_id, service_id, booking_date, booking_time, 
                           location_address, latitude, longitude, total_amount, notes, is_recurring)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
      RETURNING *
    `, [req.user.id, artisan_id, service_id, booking_date, booking_time, 
        location_address, latitude, longitude, service.price, notes]);

    const parentBooking = parentResult.rows[0];

    // Update with recurrence details
    await pool.query(
      `UPDATE bookings 
       SET recurrence_pattern = $1, recurrence_end_date = $2
       WHERE id = $3`,
      [recurrence_pattern, recurrence_end_date, parentBooking.id]
    );

    res.status(201).json({ ...parentBooking, recurrence_pattern, recurrence_end_date });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update estimated arrival time
router.patch('/:id/eta', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { estimated_arrival_time } = req.body;

    if (!estimated_arrival_time) {
      return res.status(400).json({ error: 'Estimated arrival time is required' });
    }

    const result = await pool.query(
      `UPDATE bookings 
       SET estimated_arrival_time = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [estimated_arrival_time, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const parties = await getBookingPartyUserIds(id);
    if (parties) {
      await createNotification(
        parties.customer_id,
        'booking',
        'ETA updated',
        `The artisan updated ETA for ${parties.service_name}.`,
        parties.id,
        'booking'
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark arrival
router.patch('/:id/arrived', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE bookings 
       SET actual_arrival_time = CURRENT_TIMESTAMP, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Add timeline event
    await pool.query(
      `INSERT INTO booking_timeline (booking_id, event_type, description, created_by)
       VALUES ($1, $2, $3, $4)`,
      [id, 'started', 'Artisan arrived at location', req.user.id]
    );

    const parties = await getBookingPartyUserIds(id);
    if (parties) {
      await createNotification(
        parties.customer_id,
        'booking',
        'Artisan arrived',
        `The artisan has arrived for ${parties.service_name}.`,
        parties.id,
        'booking'
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload completion photos
router.post('/:id/completion-photos', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { photo_urls } = req.body;

    if (!Array.isArray(photo_urls) || photo_urls.length === 0) {
      return res.status(400).json({ error: 'At least one photo URL is required' });
    }

    // Verify booking exists and user is authorized
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND (customer_id = $2 OR artisan_id IN (SELECT id FROM artisan_profiles WHERE user_id = $2))',
      [id, req.user.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or not authorized' });
    }

    // Insert photos
    const photos = [];
    for (const photoUrl of photo_urls) {
      const result = await pool.query(
        `INSERT INTO booking_completion_photos (booking_id, photo_url, uploaded_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [id, photoUrl, req.user.id]
      );
      photos.push(result.rows[0]);
    }

    const parties = await getBookingPartyUserIds(id);
    if (parties) {
      const receiverId = req.user.id === parties.customer_id ? parties.artisan_user_id : parties.customer_id;
      await createNotification(
        receiverId,
        'booking',
        'Completion photos added',
        `New completion photos were added for ${parties.service_name}.`,
        parties.id,
        'booking'
      );
    }

    res.status(201).json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete booking with notes
router.patch('/:id/complete', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { completion_notes } = req.body;

    const result = await pool.query(
      `UPDATE bookings 
       SET status = 'completed', completion_notes = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [completion_notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Add timeline event
    await pool.query(
      `INSERT INTO booking_timeline (booking_id, event_type, description, created_by)
       VALUES ($1, $2, $3, $4)`,
      [id, 'completed', 'Booking completed', req.user.id]
    );

    const parties = await getBookingPartyUserIds(id);
    if (parties) {
      await createNotification(
        parties.customer_id,
        'booking',
        'Booking completed',
        `Your booking for ${parties.service_name} has been marked as completed.`,
        parties.id,
        'booking'
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get booking timeline
router.get('/:id/timeline', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT bt.*, u.first_name, u.last_name, u.profile_image_url
       FROM booking_timeline bt
       LEFT JOIN users u ON bt.created_by = u.id
       WHERE bt.booking_id = $1
       ORDER BY bt.created_at ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get upcoming recurring bookings
router.get('/recurring/upcoming', authMiddleware, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await pool.query(`
      SELECT b.*, s.name as service_name, u.first_name, u.last_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.customer_id = u.id
      WHERE b.is_recurring = TRUE
      AND (b.customer_id = $1 OR b.artisan_id IN (SELECT id FROM artisan_profiles WHERE user_id = $1))
      AND b.booking_date >= CURRENT_DATE
      AND b.booking_date <= CURRENT_DATE + INTERVAL '${parseInt(days)} days'
      ORDER BY b.booking_date ASC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
