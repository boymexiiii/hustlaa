const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { Pool } = require('pg');
const { authMiddleware, customerMiddleware } = require('../middleware/auth');
const { sendEmail, bookingEmailTemplate } = require('../utils/mailer');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

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

// Initialize payment for booking with Paystack
router.post('/initialize', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const { booking_id } = req.body;

    // Get booking with customer details
    const bookingResult = await pool.query(`
      SELECT b.*, u.email, u.first_name, u.last_name, u.phone
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      WHERE b.id = $1 AND b.customer_id = $2
    `, [booking_id, req.user.id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Check if payment already exists and is completed
    const existingPayment = await pool.query(
      'SELECT * FROM payments WHERE booking_id = $1 AND status = $2',
      [booking_id, 'completed']
    );

    if (existingPayment.rows.length > 0) {
      return res.status(400).json({ error: 'Payment already completed for this booking' });
    }

    // Initialize Paystack payment
    const paystackResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: booking.email,
        amount: Math.round(booking.total_amount * 100), // Convert to kobo
        metadata: {
          booking_id: booking.id,
          customer_id: booking.customer_id,
          artisan_id: booking.artisan_id,
          customer_name: `${booking.first_name} ${booking.last_name}`,
          customer_phone: booking.phone
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!paystackResponse.data.status) {
      return res.status(400).json({ error: 'Failed to initialize payment' });
    }

    // Create payment record
    const paymentResult = await pool.query(`
      INSERT INTO payments (booking_id, amount, payment_method, transaction_id, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *
    `, [booking_id, booking.total_amount, 'paystack', paystackResponse.data.data.reference]);

    res.json({
      success: true,
      payment: paymentResult.rows[0],
      authorization_url: paystackResponse.data.data.authorization_url,
      access_code: paystackResponse.data.data.access_code,
      reference: paystackResponse.data.data.reference
    });
  } catch (error) {
    console.error('Payment initialization error:', error.message);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

// Verify Paystack payment
router.post('/verify/:reference', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify with Paystack
    const verifyResponse = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (!verifyResponse.data.status || verifyResponse.data.data.status !== 'success') {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const paymentData = verifyResponse.data.data;

    // Update payment record
    const paymentResult = await pool.query(`
      UPDATE payments 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE transaction_id = $1
      RETURNING *
    `, [reference]);

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    const payment = paymentResult.rows[0];

    // Update booking status to confirmed
    await pool.query(`
      UPDATE bookings SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [payment.booking_id]);

    // Email notifications (if SMTP configured)
    await sendBookingEmailToParties({
      bookingId: payment.booking_id,
      title: 'Payment received — booking confirmed',
      intro: 'We have received your payment and your booking has been confirmed.',
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: payment,
      paystack_data: paymentData
    });
  } catch (error) {
    console.error('Payment verification error:', error.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Paystack webhook (automated confirmations)
// Configure this URL in your Paystack dashboard webhooks:
//   http(s)://<your-domain>/api/payments/webhook/paystack
router.post('/webhook/paystack', async (req, res) => {
  try {
    const signature = req.header('x-paystack-signature');
    if (!signature) return res.status(400).send('Missing signature');

    const rawBody = req.body; // Buffer (see server.js express.raw mounting)
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
    if (hash !== signature) return res.status(401).send('Invalid signature');

    const event = JSON.parse(rawBody.toString('utf8'));
    if (event?.event !== 'charge.success') return res.status(200).send('ignored');

    const data = event.data;
    const reference = data?.reference;
    const bookingId = data?.metadata?.booking_id;
    if (!reference || !bookingId) return res.status(200).send('no-op');

    // Mark payment completed idempotently
    await pool.query(
      `UPDATE payments
       SET status = 'completed', updated_at = CURRENT_TIMESTAMP
       WHERE transaction_id = $1 AND status <> 'completed'`,
      [reference]
    );

    // Confirm booking idempotently
    await pool.query(
      `UPDATE bookings
       SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'pending'`,
      [bookingId]
    );

    // Email notifications (if SMTP configured)
    await sendBookingEmailToParties({
      bookingId,
      title: 'Payment received — booking confirmed',
      intro: 'We have received your payment and your booking has been confirmed.',
    });

    return res.status(200).send('ok');
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return res.status(500).send('error');
  }
});

// Verify payment (webhook or callback)
router.post('/verify', async (req, res) => {
  try {
    const { payment_id, transaction_id, status } = req.body;

    const result = await pool.query(`
      UPDATE payments 
      SET transaction_id = $1, status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [transaction_id, status, payment_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // If payment successful, update booking status
    if (status === 'completed') {
      await pool.query(`
        UPDATE bookings SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [result.rows[0].booking_id]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payment history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT p.*, b.booking_date, b.booking_time, s.name as service_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      WHERE b.customer_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), parseInt(offset)]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payment by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT p.*, b.customer_id, b.booking_date, b.booking_time, s.name as service_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = result.rows[0];

    if (payment.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
