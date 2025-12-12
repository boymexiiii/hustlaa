const express = require('express');
const { Pool } = require('pg');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getArtisanProfileIdForUser(userId) {
  const r = await pool.query('SELECT id FROM artisan_profiles WHERE user_id = $1', [userId]);
  return r.rows[0]?.id || null;
}

async function assertBookingAccess({ bookingId, user }) {
  const bookingRes = await pool.query('SELECT id, customer_id, artisan_id FROM bookings WHERE id = $1', [bookingId]);
  const booking = bookingRes.rows[0];
  if (!booking) return { ok: false, reason: 'Booking not found' };

  if (booking.customer_id === user.id) return { ok: true, booking };

  const artisanId = await getArtisanProfileIdForUser(user.id);
  if (artisanId && booking.artisan_id === artisanId) return { ok: true, booking };

  return { ok: false, reason: 'Not authorized' };
}

// Get messages for a booking
router.get('/:bookingId', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const access = await assertBookingAccess({ bookingId, user: req.user });
    if (!access.ok) return res.status(access.reason === 'Booking not found' ? 404 : 403).json({ error: access.reason });

    const result = await pool.query(
      `SELECT id, booking_id, sender_user_id, receiver_user_id, body, created_at
       FROM messages
       WHERE booking_id = $1
       ORDER BY created_at ASC`,
      [bookingId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router, assertBookingAccess };
