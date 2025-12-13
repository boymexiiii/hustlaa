const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

dotenv.config();

const { createNotification } = require('./routes/notifications');

const app = express();
const pool = require('./db/pool');

app.use(cors());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const path = req.originalUrl || req.url;
    console.log(`[api] ${req.method} ${path} ${res.statusCode} ${ms}ms`);
  });
  next();
});

// Paystack webhook requires raw request body for signature verification
app.use('/api/payments/webhook/paystack', express.raw({ type: 'application/json' }));

app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/artisans', require('./routes/artisans'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/search', require('./routes/search'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/messages', require('./routes/messages').router);
app.use('/api/wallet', require('./routes/wallet').router);
app.use('/api/notifications', require('./routes/notifications').router);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling
app.use((err, req, res, next) => {
  const path = req.originalUrl || req.url;
  console.error(`[api] error ${req.method} ${path}`, err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    return next();
  } catch (e) {
    return next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.on('join_booking', async ({ bookingId }) => {
    try {
      const { assertBookingAccess } = require('./routes/messages');
      const access = await assertBookingAccess({ bookingId, user: socket.user });
      if (!access.ok) {
        socket.emit('error_message', { error: access.reason });
        return;
      }
      socket.join(`booking:${bookingId}`);
    } catch (e) {
      socket.emit('error_message', { error: 'Failed to join chat' });
    }
  });

  socket.on('send_message', async ({ bookingId, body }) => {
    try {
      const text = String(body || '').trim();
      if (!text) return;

      const { assertBookingAccess } = require('./routes/messages');
      const access = await assertBookingAccess({ bookingId, user: socket.user });
      if (!access.ok) {
        socket.emit('error_message', { error: access.reason });
        return;
      }

      const booking = access.booking;

      // Determine receiver_user_id
      let receiverUserId;
      if (socket.user.id === booking.customer_id) {
        const r = await pool.query(
          'SELECT u.id FROM artisan_profiles ap JOIN users u ON ap.user_id = u.id WHERE ap.id = $1',
          [booking.artisan_id]
        );
        receiverUserId = r.rows[0]?.id;
      } else {
        receiverUserId = booking.customer_id;
      }

      if (!receiverUserId) {
        socket.emit('error_message', { error: 'Receiver not found' });
        return;
      }

      const insert = await pool.query(
        `INSERT INTO messages (booking_id, sender_user_id, receiver_user_id, body)
         VALUES ($1, $2, $3, $4)
         RETURNING id, booking_id, sender_user_id, receiver_user_id, body, created_at`,
        [bookingId, socket.user.id, receiverUserId, text]
      );

      await createNotification(
        receiverUserId,
        'message',
        'New message',
        'You have a new message in your booking chat.',
        bookingId,
        'booking'
      );

      io.to(`booking:${bookingId}`).emit('message', insert.rows[0]);
    } catch (e) {
      socket.emit('error_message', { error: 'Failed to send message' });
    }
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});

// Export for Vercel serverless
module.exports = app;

// Also export for local development
module.exports.app = app;
module.exports.pool = pool;
module.exports.io = io;
