const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Pool } = require('pg');
const { sendEmail } = require('../utils/mailer');
const { authMiddleware } = require('../middleware/auth');
const { initializeWallet } = require('./wallet');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, user_type } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, user_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, user_type`,
      [email, hashedPassword, first_name, last_name, phone, user_type]
    );

    const user = result.rows[0];

    // If artisan, create artisan profile
    if (user_type === 'artisan') {
      await pool.query(
        'INSERT INTO artisan_profiles (user_id) VALUES ($1)',
        [user.id]
      );
    }

    // Initialize wallet for user
    await initializeWallet(user.id);

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.password;
    res.json({ user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, profile_image_url, user_type FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot password - send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await pool.query('SELECT id, first_name FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      // Don't reveal if email exists for security
      return res.status(200).json({ message: 'If email exists, reset link has been sent' });
    }

    const user = result.rows[0];

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token hash in database
    await pool.query(
      `UPDATE users 
       SET reset_token = $1, reset_token_expiry = $2
       WHERE id = $3`,
      [resetTokenHash, resetTokenExpiry, user.id]
    );

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password/${resetToken}`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111">
        <h2>Password Reset Request</h2>
        <p>Hello ${user.first_name || 'there'},</p>
        <p>We received a request to reset your password. Click the link below to proceed:</p>
        <div style="margin:20px 0">
          <a href="${resetUrl}" style="background:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
            Reset Password
          </a>
        </div>
        <p style="color:#666;font-size:12px">This link will expire in 1 hour.</p>
        <p style="color:#666;font-size:12px">If you didn't request this, please ignore this email.</p>
        <p>Thanks,<br/>Hustlaa</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });

    res.status(200).json({ message: 'If email exists, reset link has been sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password - verify token and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const result = await pool.query(
      `SELECT id FROM users 
       WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const userId = result.rows[0].id;

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear reset token
    await pool.query(
      `UPDATE users 
       SET password = $1, reset_token = NULL, reset_token_expiry = NULL
       WHERE id = $2`,
      [hashedPassword, userId]
    );

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
