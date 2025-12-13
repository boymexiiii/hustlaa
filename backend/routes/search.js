const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const pool = require('../db/pool');

const router = express.Router();

// Advanced search for artisans with filters
router.get('/artisans', async (req, res) => {
  try {
    const {
      state, city, skill, min_rating, max_price, min_price,
      availability, page = 1, limit = 20, sort = 'rating'
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.profile_image_url,
        ap.id as artisan_id, ap.bio, ap.rating, ap.total_reviews, 
        ap.skills, ap.hourly_rate, ap.availability_status, ap.verification_status,
        al.state, al.city, al.address,
        COUNT(DISTINCT s.id) as service_count
      FROM users u
      JOIN artisan_profiles ap ON u.id = ap.user_id
      LEFT JOIN artisan_locations al ON ap.id = al.artisan_id
      LEFT JOIN services s ON ap.id = s.artisan_id
      WHERE u.user_type = 'artisan' AND ap.verification_status = 'verified'
    `;

    const params = [];
    let paramCount = 0;

    if (state) {
      paramCount++;
      query += ` AND al.state = $${paramCount}`;
      params.push(state);
    }

    if (city) {
      paramCount++;
      query += ` AND al.city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
    }

    if (skill) {
      paramCount++;
      query += ` AND $${paramCount} = ANY(ap.skills)`;
      params.push(skill);
    }

    if (min_rating) {
      paramCount++;
      query += ` AND ap.rating >= $${paramCount}`;
      params.push(parseFloat(min_rating));
    }

    if (min_price) {
      paramCount++;
      query += ` AND ap.hourly_rate >= $${paramCount}`;
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      paramCount++;
      query += ` AND ap.hourly_rate <= $${paramCount}`;
      params.push(parseFloat(max_price));
    }

    if (availability) {
      paramCount++;
      query += ` AND ap.availability_status = $${paramCount}`;
      params.push(availability);
    }

    // Group by and order
    query += ` GROUP BY u.id, ap.id, al.id`;

    // Sorting
    if (sort === 'rating') {
      query += ` ORDER BY ap.rating DESC, ap.total_reviews DESC`;
    } else if (sort === 'price_low') {
      query += ` ORDER BY ap.hourly_rate ASC`;
    } else if (sort === 'price_high') {
      query += ` ORDER BY ap.hourly_rate DESC`;
    } else if (sort === 'newest') {
      query += ` ORDER BY u.created_at DESC`;
    } else {
      query += ` ORDER BY ap.rating DESC`;
    }

    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT ap.id) as total
      FROM users u
      JOIN artisan_profiles ap ON u.id = ap.user_id
      LEFT JOIN artisan_locations al ON ap.id = al.artisan_id
      WHERE u.user_type = 'artisan' AND ap.verification_status = 'verified'
    `;

    const countParams = [];
    let countParamCount = 0;

    if (state) {
      countParamCount++;
      countQuery += ` AND al.state = $${countParamCount}`;
      countParams.push(state);
    }
    if (city) {
      countParamCount++;
      countQuery += ` AND al.city ILIKE $${countParamCount}`;
      countParams.push(`%${city}%`);
    }
    if (skill) {
      countParamCount++;
      countQuery += ` AND $${countParamCount} = ANY(ap.skills)`;
      countParams.push(skill);
    }
    if (min_rating) {
      countParamCount++;
      countQuery += ` AND ap.rating >= $${countParamCount}`;
      countParams.push(parseFloat(min_rating));
    }
    if (min_price) {
      countParamCount++;
      countQuery += ` AND ap.hourly_rate >= $${countParamCount}`;
      countParams.push(parseFloat(min_price));
    }
    if (max_price) {
      countParamCount++;
      countQuery += ` AND ap.hourly_rate <= $${countParamCount}`;
      countParams.push(parseFloat(max_price));
    }
    if (availability) {
      countParamCount++;
      countQuery += ` AND ap.availability_status = $${countParamCount}`;
      countParams.push(availability);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      artisans: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save search
router.post('/saved', authMiddleware, async (req, res) => {
  try {
    const { name, search_query, filters } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Search name is required' });
    }

    const result = await pool.query(
      `INSERT INTO saved_searches (user_id, name, search_query, filters)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, name, search_query, JSON.stringify(filters)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get saved searches
router.get('/saved', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete saved search
router.delete('/saved/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM saved_searches WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    res.json({ success: true, message: 'Saved search deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get search history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await pool.query(
      `SELECT * FROM search_history 
       WHERE user_id = $1 
       ORDER BY searched_at DESC 
       LIMIT $2`,
      [req.user.id, parseInt(limit)]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to search history
router.post('/history', authMiddleware, async (req, res) => {
  try {
    const { search_query, filters, results_count } = req.body;

    const result = await pool.query(
      `INSERT INTO search_history (user_id, search_query, filters, results_count)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, search_query, JSON.stringify(filters), results_count]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get service categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM service_categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
