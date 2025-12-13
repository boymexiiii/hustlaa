const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const pool = require('../db/pool');

const router = express.Router();

// Admin middleware - check if user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    // Check if user has admin role (you can add an is_admin column to users table)
    // For now, we'll check if email matches admin email from env
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
    
    if (!adminEmails.includes(req.user.email)) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get dashboard statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE user_type = 'customer') as total_customers,
        (SELECT COUNT(*) FROM users WHERE user_type = 'artisan') as total_artisans,
        (SELECT COUNT(*) FROM artisan_profiles WHERE verification_status = 'verified') as verified_artisans,
        (SELECT COUNT(*) FROM artisan_profiles WHERE verification_status = 'pending') as pending_verifications,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
        (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status = 'completed') as total_revenue
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users with pagination
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, user_type } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, email, first_name, last_name, phone, user_type, created_at FROM users';
    const params = [];
    
    if (user_type) {
      query += ' WHERE user_type = $1';
      params.push(user_type);
      query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(parseInt(limit), parseInt(offset));
    } else {
      query += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
      params.push(parseInt(limit), parseInt(offset));
    }

    const result = await pool.query(query, params);
    
    const countResult = await pool.query(
      user_type ? 'SELECT COUNT(*) FROM users WHERE user_type = $1' : 'SELECT COUNT(*) FROM users',
      user_type ? [user_type] : []
    );

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending artisan verifications
router.get('/verifications/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ap.id as artisan_id,
        ap.verification_status,
        ap.bio,
        ap.skills,
        ap.hourly_rate,
        ap.created_at,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.profile_image_url,
        al.state,
        al.city,
        al.address
      FROM artisan_profiles ap
      JOIN users u ON ap.user_id = u.id
      LEFT JOIN artisan_locations al ON ap.id = al.artisan_id
      WHERE ap.verification_status = 'pending'
      ORDER BY ap.created_at ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify or reject artisan
router.post('/verifications/:artisanId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { artisanId } = req.params;
    const { status, notes } = req.body; // status: 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(`
      UPDATE artisan_profiles 
      SET verification_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, artisanId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan not found' });
    }

    // TODO: Send email notification to artisan about verification status

    res.json({
      success: true,
      message: `Artisan ${status} successfully`,
      artisan: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all bookings with filters
router.get('/bookings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.*,
        cu.first_name as customer_first_name,
        cu.last_name as customer_last_name,
        cu.email as customer_email,
        au.first_name as artisan_first_name,
        au.last_name as artisan_last_name,
        s.name as service_name
      FROM bookings b
      JOIN users cu ON b.customer_id = cu.id
      JOIN artisan_profiles ap ON b.artisan_id = ap.id
      JOIN users au ON ap.user_id = au.id
      JOIN services s ON b.service_id = s.id
    `;

    const params = [];
    if (status) {
      query += ' WHERE b.status = $1';
      params.push(status);
      query += ` ORDER BY b.created_at DESC LIMIT $2 OFFSET $3`;
      params.push(parseInt(limit), parseInt(offset));
    } else {
      query += ` ORDER BY b.created_at DESC LIMIT $1 OFFSET $2`;
      params.push(parseInt(limit), parseInt(offset));
    }

    const result = await pool.query(query, params);

    res.json({
      bookings: result.rows,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (soft delete or hard delete)
router.delete('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Hard delete - use with caution
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get platform analytics
router.get('/analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

    const analytics = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) FILTER (WHERE user_type = 'customer') as new_customers,
        COUNT(*) FILTER (WHERE user_type = 'artisan') as new_artisans
      FROM users
      WHERE created_at >= NOW() - INTERVAL '${parseInt(period)} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    const bookingAnalytics = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_bookings,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) as revenue
      FROM bookings
      WHERE created_at >= NOW() - INTERVAL '${parseInt(period)} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      user_analytics: analytics.rows,
      booking_analytics: bookingAnalytics.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
