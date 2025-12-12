const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());

// Paystack webhook requires raw request body for signature verification
app.use('/payments/webhook/paystack', express.raw({ type: 'application/json' }));

app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/auth', require('../routes/auth'));
app.use('/artisans', require('../routes/artisans'));
app.use('/bookings', require('../routes/bookings'));
app.use('/payments', require('../routes/payments'));
app.use('/users', require('../routes/users'));
app.use('/upload', require('../routes/upload'));
app.use('/admin', require('../routes/admin'));
app.use('/messages', require('../routes/messages').router);
app.use('/wallet', require('../routes/wallet').router);
app.use('/notifications', require('../routes/notifications').router);
app.use('/reviews', require('../routes/reviews'));
app.use('/portfolio', require('../routes/portfolio'));
app.use('/bookings-enhanced', require('../routes/booking-enhancements'));
app.use('/search', require('../routes/search'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
