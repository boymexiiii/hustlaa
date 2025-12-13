const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/artisans', require('../routes/artisans'));
app.use('/api/bookings', require('../routes/bookings'));
app.use('/api/payments', require('../routes/payments'));
app.use('/api/jobs', require('../routes/jobs'));
app.use('/api/search', require('../routes/search'));
app.use('/api/users', require('../routes/users'));
app.use('/api/upload', require('../routes/upload'));
app.use('/api/admin', require('../routes/admin'));
app.use('/api/messages', require('../routes/messages').router);
app.use('/api/wallet', require('../routes/wallet').router);
app.use('/api/notifications', require('../routes/notifications').router);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

module.exports = app;
