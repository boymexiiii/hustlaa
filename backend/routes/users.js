const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { first_name, last_name, phone, profile_image_url } = req.body;

    const result = await pool.query(`
      UPDATE users 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone = COALESCE($3, phone),
          profile_image_url = COALESCE($4, profile_image_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, email, first_name, last_name, phone, profile_image_url, user_type
    `, [first_name, last_name, phone, profile_image_url, req.user.id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Get current user
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    // Verify current password
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user dashboard stats
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    if (req.user.user_type === 'customer') {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) as total_spent
        FROM bookings WHERE customer_id = $1
      `, [req.user.id]);

      res.json(stats.rows[0]);
    } else {
      // Artisan dashboard
      const profileResult = await pool.query(
        'SELECT id, rating, total_reviews FROM artisan_profiles WHERE user_id = $1',
        [req.user.id]
      );

      if (profileResult.rows.length === 0) {
        return res.status(404).json({ error: 'Artisan profile not found' });
      }

      const artisanId = profileResult.rows[0].id;

      const stats = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_bookings,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_bookings,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) as total_earned
        FROM bookings WHERE artisan_id = $1
      `, [artisanId]);

      res.json({
        ...stats.rows[0],
        rating: profileResult.rows[0].rating,
        total_reviews: profileResult.rows[0].total_reviews
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
