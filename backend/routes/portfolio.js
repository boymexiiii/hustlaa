const express = require('express');
const { authMiddleware, artisanMiddleware } = require('../middleware/auth');
const pool = require('../db/pool');

const router = express.Router();

// Get portfolio items for an artisan
router.get('/artisan/:artisanId', async (req, res) => {
  try {
    const { artisanId } = req.params;
    const { category, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM portfolio_items WHERE artisan_id = $1';
    const params = [artisanId];
    let paramCount = 1;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM portfolio_items WHERE artisan_id = $1';
    const countParams = [artisanId];
    if (category) {
      countQuery += ' AND category = $2';
      countParams.push(category);
    }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      items: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single portfolio item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM portfolio_items WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create portfolio item (artisan only)
router.post('/', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { title, description, image_url, category, before_image_url } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({ error: 'Title and image URL are required' });
    }

    // Get artisan profile
    const profileResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const artisanId = profileResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO portfolio_items (artisan_id, title, description, image_url, category, before_image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [artisanId, title, description, image_url, category, before_image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update portfolio item (artisan only)
router.put('/:id', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image_url, category, before_image_url } = req.body;

    // Get artisan profile
    const profileResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const artisanId = profileResult.rows[0].id;

    const result = await pool.query(
      `UPDATE portfolio_items 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           category = COALESCE($4, category),
           before_image_url = COALESCE($5, before_image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND artisan_id = $7
       RETURNING *`,
      [title, description, image_url, category, before_image_url, id, artisanId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete portfolio item (artisan only)
router.delete('/:id', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get artisan profile
    const profileResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const artisanId = profileResult.rows[0].id;

    const result = await pool.query(
      'DELETE FROM portfolio_items WHERE id = $1 AND artisan_id = $2 RETURNING id',
      [id, artisanId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    res.json({ success: true, message: 'Portfolio item deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get certifications for an artisan
router.get('/certifications/:artisanId', async (req, res) => {
  try {
    const { artisanId } = req.params;

    const result = await pool.query(
      `SELECT * FROM certifications 
       WHERE artisan_id = $1 
       ORDER BY issue_date DESC`,
      [artisanId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add certification (artisan only)
router.post('/certifications', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { title, issuer, issue_date, expiry_date, credential_url, certificate_image_url } = req.body;

    if (!title || !issuer || !issue_date) {
      return res.status(400).json({ error: 'Title, issuer, and issue date are required' });
    }

    // Get artisan profile
    const profileResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const artisanId = profileResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO certifications (artisan_id, title, issuer, issue_date, expiry_date, credential_url, certificate_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [artisanId, title, issuer, issue_date, expiry_date, credential_url, certificate_image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update certification (artisan only)
router.put('/certifications/:id', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, issuer, issue_date, expiry_date, credential_url, certificate_image_url } = req.body;

    // Get artisan profile
    const profileResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const artisanId = profileResult.rows[0].id;

    const result = await pool.query(
      `UPDATE certifications 
       SET title = COALESCE($1, title),
           issuer = COALESCE($2, issuer),
           issue_date = COALESCE($3, issue_date),
           expiry_date = COALESCE($4, expiry_date),
           credential_url = COALESCE($5, credential_url),
           certificate_image_url = COALESCE($6, certificate_image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND artisan_id = $8
       RETURNING *`,
      [title, issuer, issue_date, expiry_date, credential_url, certificate_image_url, id, artisanId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete certification (artisan only)
router.delete('/certifications/:id', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get artisan profile
    const profileResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const artisanId = profileResult.rows[0].id;

    const result = await pool.query(
      'DELETE FROM certifications WHERE id = $1 AND artisan_id = $2 RETURNING id',
      [id, artisanId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    res.json({ success: true, message: 'Certification deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
