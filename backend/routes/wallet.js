const express = require('express');
const { Pool } = require('pg');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Get wallet balance and summary
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, balance, total_earned, total_spent 
       FROM wallets 
       WHERE user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get wallet transactions
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const offset = (page - 1) * limit;

    // Get wallet ID
    const walletResult = await pool.query(
      'SELECT id FROM wallets WHERE user_id = $1',
      [req.user.id]
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const walletId = walletResult.rows[0].id;

    let query = `
      SELECT * FROM wallet_transactions
      WHERE wallet_id = $1
    `;

    const params = [walletId];
    let paramCount = 1;

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add funds to wallet (top-up)
router.post('/topup', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get wallet
      const walletResult = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
        [req.user.id]
      );

      if (walletResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Wallet not found' });
      }

      const wallet = walletResult.rows[0];
      const newBalance = parseFloat(wallet.balance) + parseFloat(amount);

      // Update wallet balance
      await client.query(
        `UPDATE wallets 
         SET balance = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [newBalance, wallet.id]
      );

      // Record transaction
      const txResult = await client.query(
        `INSERT INTO wallet_transactions 
         (wallet_id, type, amount, description, status, balance_before, balance_after)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          wallet.id,
          'deposit',
          amount,
          'Wallet top-up',
          'completed',
          wallet.balance,
          newBalance,
        ]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Funds added successfully',
        transaction: txResult.rows[0],
        newBalance,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Withdraw funds from wallet
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const { amount, bank_account } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get wallet
      const walletResult = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
        [req.user.id]
      );

      if (walletResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Wallet not found' });
      }

      const wallet = walletResult.rows[0];

      if (parseFloat(wallet.balance) < parseFloat(amount)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      const newBalance = parseFloat(wallet.balance) - parseFloat(amount);

      // Update wallet balance
      await client.query(
        `UPDATE wallets 
         SET balance = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [newBalance, wallet.id]
      );

      // Record transaction
      const txResult = await client.query(
        `INSERT INTO wallet_transactions 
         (wallet_id, type, amount, description, status, balance_before, balance_after)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          wallet.id,
          'withdrawal',
          amount,
          `Withdrawal to bank account`,
          'pending',
          wallet.balance,
          newBalance,
        ]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Withdrawal request submitted',
        transaction: txResult.rows[0],
        newBalance,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Pay from wallet for booking
router.post('/pay-booking', authMiddleware, async (req, res) => {
  try {
    const { booking_id, amount } = req.body;

    if (!booking_id || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid booking or amount' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verify booking belongs to user
      const bookingResult = await client.query(
        'SELECT * FROM bookings WHERE id = $1 AND customer_id = $2',
        [booking_id, req.user.id]
      );

      if (bookingResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Get wallet
      const walletResult = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
        [req.user.id]
      );

      if (walletResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Wallet not found' });
      }

      const wallet = walletResult.rows[0];

      if (parseFloat(wallet.balance) < parseFloat(amount)) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }

      const newBalance = parseFloat(wallet.balance) - parseFloat(amount);

      // Update wallet balance
      await client.query(
        `UPDATE wallets 
         SET balance = $1, total_spent = total_spent + $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [newBalance, amount, wallet.id]
      );

      // Record transaction
      const txResult = await client.query(
        `INSERT INTO wallet_transactions 
         (wallet_id, type, amount, description, reference_id, reference_type, status, balance_before, balance_after)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          wallet.id,
          'payment',
          amount,
          `Payment for booking #${booking_id}`,
          booking_id,
          'booking',
          'completed',
          wallet.balance,
          newBalance,
        ]
      );

      // Update booking status to confirmed
      await client.query(
        `UPDATE bookings SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [booking_id]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Payment successful',
        transaction: txResult.rows[0],
        newBalance,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Initialize wallet for new user
async function initializeWallet(userId) {
  try {
    await pool.query(
      `INSERT INTO wallets (user_id, balance, total_earned, total_spent)
       VALUES ($1, 0.00, 0.00, 0.00)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );
  } catch (error) {
    console.error('Error initializing wallet:', error);
  }
}

module.exports = { router, initializeWallet };
