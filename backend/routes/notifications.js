const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const pool = require('../db/pool');

const router = express.Router();

// Get user notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT * FROM notifications
      WHERE user_id = $1
    `;
    const params = [req.user.id];

    if (unread_only === 'true') {
      query += ` AND is_read = FALSE`;
    }

    query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get unread count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [req.user.id]
    );

    res.json({
      notifications: result.rows,
      unread_count: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = FALSE`,
      [req.user.id]
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get notification preferences
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notification_preferences WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Create default preferences
      const defaultResult = await pool.query(
        `INSERT INTO notification_preferences (user_id)
         VALUES ($1)
         RETURNING *`,
        [req.user.id]
      );
      return res.json(defaultResult.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update notification preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const {
      email_bookings, email_payments, email_reviews, email_messages,
      push_bookings, push_payments, push_reviews, push_messages,
      in_app_bookings, in_app_payments, in_app_reviews, in_app_messages
    } = req.body;

    const result = await pool.query(
      `UPDATE notification_preferences 
       SET email_bookings = COALESCE($1, email_bookings),
           email_payments = COALESCE($2, email_payments),
           email_reviews = COALESCE($3, email_reviews),
           email_messages = COALESCE($4, email_messages),
           push_bookings = COALESCE($5, push_bookings),
           push_payments = COALESCE($6, push_payments),
           push_reviews = COALESCE($7, push_reviews),
           push_messages = COALESCE($8, push_messages),
           in_app_bookings = COALESCE($9, in_app_bookings),
           in_app_payments = COALESCE($10, in_app_payments),
           in_app_reviews = COALESCE($11, in_app_reviews),
           in_app_messages = COALESCE($12, in_app_messages),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $13
       RETURNING *`,
      [
        email_bookings, email_payments, email_reviews, email_messages,
        push_bookings, push_payments, push_reviews, push_messages,
        in_app_bookings, in_app_payments, in_app_reviews, in_app_messages,
        req.user.id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Subscribe to push notifications
router.post('/push/subscribe', authMiddleware, async (req, res) => {
  try {
    const { endpoint, auth, p256dh } = req.body;

    if (!endpoint || !auth || !p256dh) {
      return res.status(400).json({ error: 'Missing subscription details' });
    }

    const result = await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, auth_key, p256dh_key)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (endpoint) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.id, endpoint, auth, p256dh]
    );

    res.json({ success: true, subscription: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unsubscribe from push notifications
router.post('/push/unsubscribe', authMiddleware, async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint required' });
    }

    await pool.query(
      'DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2',
      [endpoint, req.user.id]
    );

    res.json({ success: true, message: 'Unsubscribed from push notifications' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to create notification
async function createNotification(userId, type, title, message, referenceId = null, referenceType = null) {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, reference_id, reference_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, type, title, message, referenceId, referenceType]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

module.exports = { router, createNotification };
