const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
try {
  app.use('/auth', require('../../backend/routes/auth'));
  app.use('/artisans', require('../../backend/routes/artisans'));
  app.use('/bookings', require('../../backend/routes/bookings'));
  app.use('/payments', require('../../backend/routes/payments'));
  app.use('/jobs', require('../../backend/routes/jobs'));
  app.use('/search', require('../../backend/routes/search'));
  app.use('/users', require('../../backend/routes/users'));
  app.use('/upload', require('../../backend/routes/upload'));
  app.use('/admin', require('../../backend/routes/admin'));
  app.use('/messages', require('../../backend/routes/messages').router);
  app.use('/wallet', require('../../backend/routes/wallet').router);
  app.use('/notifications', require('../../backend/routes/notifications').router);
} catch (error) {
  console.error('Error loading routes:', error);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Hustlaa API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

exports.handler = serverless(app);
