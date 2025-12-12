const express = require('express');
const { Pool } = require('pg');
const { authMiddleware, artisanMiddleware, customerMiddleware } = require('../middleware/auth');
const { sendEmail, bookingEmailTemplate } = require('../utils/mailer');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function sendBookingEmailToParties({ bookingId, title, intro }) {
  const r = await pool.query(
    `SELECT b.id, b.booking_date, b.booking_time, b.location_address, b.total_amount,
            s.name as service_name,
            cu.email as customer_email, cu.first_name as customer_first_name,
            au.email as artisan_email, au.first_name as artisan_first_name
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     JOIN users cu ON b.customer_id = cu.id
     JOIN artisan_profiles ap ON b.artisan_id = ap.id
     JOIN users au ON ap.user_id = au.id
     WHERE b.id = $1`,
    [bookingId]
  );

  const booking = r.rows[0];
  if (!booking) return;

  const htmlCustomer = bookingEmailTemplate({
    title,
    intro,
    booking,
    recipientName: booking.customer_first_name,
  });

  const htmlArtisan = bookingEmailTemplate({
    title,
    intro,
    booking,
    recipientName: booking.artisan_first_name,
  });

  await Promise.all([
    sendEmail({ to: booking.customer_email, subject: title, html: htmlCustomer }),
    sendEmail({ to: booking.artisan_email, subject: title, html: htmlArtisan }),
  ]);
}

// Create booking (customer only)
router.post('/', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const { artisan_id, service_id, booking_date, booking_time, location_address, latitude, longitude, notes } = req.body;

    // Get service price
    const serviceResult = await pool.query('SELECT * FROM services WHERE id = $1 AND artisan_id = $2', [service_id, artisan_id]);
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const service = serviceResult.rows[0];

    // Check artisan availability
    const artisanResult = await pool.query(
      'SELECT availability_status FROM artisan_profiles WHERE id = $1',
      [artisan_id]
    );

    if (artisanResult.rows.length === 0 || artisanResult.rows[0].availability_status !== 'available') {
      return res.status(400).json({ error: 'Artisan is not available' });
    }

    // Create booking
    const result = await pool.query(`
      INSERT INTO bookings (customer_id, artisan_id, service_id, booking_date, booking_time, 
                           location_address, latitude, longitude, total_amount, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [req.user.id, artisan_id, service_id, booking_date, booking_time, 
        location_address, latitude, longitude, service.price, notes]);

    // Email: booking request created
    await sendBookingEmailToParties({
      bookingId: result.rows[0].id,
      title: 'New booking request',
      intro: 'A new booking request has been created. Please review and proceed.',
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer bookings
router.get('/customer', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, s.name as service_name, s.description as service_description,
             u.first_name as artisan_first_name, u.last_name as artisan_last_name,
             u.profile_image_url as artisan_image, ap.rating as artisan_rating
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN artisan_profiles ap ON b.artisan_id = ap.id
      JOIN users u ON ap.user_id = u.id
      WHERE b.customer_id = $1
    `;

    const params = [req.user.id];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get artisan bookings
router.get('/artisan', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get artisan profile id
    const profileResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const artisanId = profileResult.rows[0].id;

    let query = `
      SELECT b.*, s.name as service_name, s.description as service_description,
             u.first_name as customer_first_name, u.last_name as customer_last_name,
             u.phone as customer_phone, u.profile_image_url as customer_image
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.customer_id = u.id
      WHERE b.artisan_id = $1
    `;

    const params = [artisanId];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY b.booking_date ASC, b.booking_time ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update booking status (artisan)
router.patch('/:id/status', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get artisan profile id
    const profileResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    const result = await pool.query(`
      UPDATE bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND artisan_id = $3
      RETURNING *
    `, [status, id, profileResult.rows[0].id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Email: status updated
    const statusIntroMap = {
      confirmed: 'Your booking has been confirmed.',
      in_progress: 'Your booking is now in progress.',
      completed: 'Your booking has been marked as completed.',
      cancelled: 'Your booking has been cancelled.',
    };
    await sendBookingEmailToParties({
      bookingId: result.rows[0].id,
      title: `Booking update: ${status.replace('_', ' ')}`,
      intro: statusIntroMap[status] || 'Your booking status has been updated.',
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel booking (customer)
router.patch('/:id/cancel', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE bookings 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND customer_id = $2 AND status IN ('pending', 'confirmed')
      RETURNING *
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add review after booking completion
router.post('/:id/review', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check booking exists and is completed
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND customer_id = $2 AND status = $3',
      [id, req.user.id, 'completed']
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Completed booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Check if review already exists
    const existingReview = await pool.query(
      'SELECT * FROM reviews WHERE booking_id = $1',
      [id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'Review already exists for this booking' });
    }

    // Create review
    const reviewResult = await pool.query(`
      INSERT INTO reviews (booking_id, customer_id, artisan_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, req.user.id, booking.artisan_id, rating, comment]);

    // Update artisan rating
    await pool.query(`
      UPDATE artisan_profiles 
      SET rating = (SELECT AVG(rating) FROM reviews WHERE artisan_id = $1),
          total_reviews = (SELECT COUNT(*) FROM reviews WHERE artisan_id = $1)
      WHERE id = $1
    `, [booking.artisan_id]);

    res.status(201).json(reviewResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single booking
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT b.*, s.name as service_name, s.description as service_description,
             cu.first_name as customer_first_name, cu.last_name as customer_last_name,
             cu.phone as customer_phone,
             au.first_name as artisan_first_name, au.last_name as artisan_last_name,
             au.phone as artisan_phone, ap.rating as artisan_rating
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users cu ON b.customer_id = cu.id
      JOIN artisan_profiles ap ON b.artisan_id = ap.id
      JOIN users au ON ap.user_id = au.id
      WHERE b.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];

    // Check if user is authorized to view this booking
    const profileResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );
    const artisanId = profileResult.rows[0]?.id;

    if (booking.customer_id !== req.user.id && booking.artisan_id !== artisanId) {
      return res.status(403).json({ error: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
