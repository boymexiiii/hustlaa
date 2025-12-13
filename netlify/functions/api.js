const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('../../backend/routes/auth'));
app.use('/api/artisans', require('../../backend/routes/artisans'));
app.use('/api/bookings', require('../../backend/routes/bookings'));
app.use('/api/payments', require('../../backend/routes/payments'));
app.use('/api/jobs', require('../../backend/routes/jobs'));
app.use('/api/search', require('../../backend/routes/search'));
app.use('/api/users', require('../../backend/routes/users'));
app.use('/api/upload', require('../../backend/routes/upload'));
app.use('/api/admin', require('../../backend/routes/admin'));
app.use('/api/messages', require('../../backend/routes/messages').router);
app.use('/api/wallet', require('../../backend/routes/wallet').router);
app.use('/api/notifications', require('../../backend/routes/notifications').router);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

exports.handler = serverless(app);
