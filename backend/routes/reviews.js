const express = require('express');
const { authMiddleware, artisanMiddleware, customerMiddleware } = require('../middleware/auth');
const { createNotification } = require('./notifications');
const pool = require('../db/pool');

const router = express.Router();

// Get reviews for an artisan
router.get('/artisan/:artisanId', async (req, res) => {
  try {
    const { artisanId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const offset = (page - 1) * limit;

    let orderBy = 'r.created_at DESC';
    if (sort === 'helpful') {
      orderBy = '(r.helpful_count - r.unhelpful_count) DESC';
    } else if (sort === 'rating_high') {
      orderBy = 'r.rating DESC';
    } else if (sort === 'rating_low') {
      orderBy = 'r.rating ASC';
    }

    const result = await pool.query(`
      SELECT 
        r.id, r.booking_id, r.customer_id, r.artisan_id, r.rating, r.comment, 
        r.photo_url, r.helpful_count, r.unhelpful_count, r.created_at,
        u.first_name, u.last_name, u.profile_image_url,
        rr.id as response_id, rr.response_text, rr.created_at as response_created_at
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      LEFT JOIN review_responses rr ON r.id = rr.review_id
      WHERE r.artisan_id = $1
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
    `, [artisanId, parseInt(limit), parseInt(offset)]);

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM reviews WHERE artisan_id = $1',
      [artisanId]
    );

    res.json({
      reviews: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get review by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        r.id, r.booking_id, r.customer_id, r.artisan_id, r.rating, r.comment, 
        r.photo_url, r.helpful_count, r.unhelpful_count, r.created_at,
        u.first_name, u.last_name, u.profile_image_url,
        rr.id as response_id, rr.response_text, rr.created_at as response_created_at
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      LEFT JOIN review_responses rr ON r.id = rr.review_id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Vote on review (helpful/unhelpful)
router.post('/:id/vote', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { vote_type } = req.body;

    if (!['helpful', 'unhelpful'].includes(vote_type)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Check if review exists
    const reviewResult = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user already voted
    const existingVote = await pool.query(
      'SELECT * FROM review_votes WHERE review_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existingVote.rows.length > 0) {
      // Update existing vote
      const oldVote = existingVote.rows[0];
      
      // Adjust counts
      let updateQuery = 'UPDATE reviews SET ';
      if (oldVote.vote_type === 'helpful') {
        updateQuery += 'helpful_count = helpful_count - 1';
      } else {
        updateQuery += 'unhelpful_count = unhelpful_count - 1';
      }

      if (vote_type === 'helpful') {
        updateQuery += ', helpful_count = helpful_count + 1';
      } else {
        updateQuery += ', unhelpful_count = unhelpful_count + 1';
      }

      updateQuery += ' WHERE id = $1';
      await pool.query(updateQuery, [id]);

      // Update vote
      await pool.query(
        'UPDATE review_votes SET vote_type = $1 WHERE review_id = $2 AND user_id = $3',
        [vote_type, id, req.user.id]
      );
    } else {
      // Create new vote
      await pool.query(
        'INSERT INTO review_votes (review_id, user_id, vote_type) VALUES ($1, $2, $3)',
        [id, req.user.id, vote_type]
      );

      // Update counts
      const updateQuery = vote_type === 'helpful'
        ? 'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1'
        : 'UPDATE reviews SET unhelpful_count = unhelpful_count + 1 WHERE id = $1';
      
      await pool.query(updateQuery, [id]);
    }

    const updatedReview = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    res.json(updatedReview.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add response to review (artisan only)
router.post('/:id/response', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { response_text } = req.body;

    if (!response_text || response_text.trim().length === 0) {
      return res.status(400).json({ error: 'Response text is required' });
    }

    // Get review
    const reviewResult = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const review = reviewResult.rows[0];

    // Get artisan profile
    const artisanResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (artisanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const artisanId = artisanResult.rows[0].id;

    // Check if artisan owns this review
    if (review.artisan_id !== artisanId) {
      return res.status(403).json({ error: 'Not authorized to respond to this review' });
    }

    // Check if response already exists
    const existingResponse = await pool.query(
      'SELECT * FROM review_responses WHERE review_id = $1',
      [id]
    );

    if (existingResponse.rows.length > 0) {
      // Update existing response
      const result = await pool.query(
        `UPDATE review_responses 
         SET response_text = $1, updated_at = CURRENT_TIMESTAMP
         WHERE review_id = $2
         RETURNING *`,
        [response_text, id]
      );

      await createNotification(
        review.customer_id,
        'review',
        'Artisan responded to your review',
        'The artisan has responded to your review.',
        id,
        'review'
      );
      return res.json(result.rows[0]);
    }

    // Create new response
    const result = await pool.query(
      `INSERT INTO review_responses (review_id, artisan_id, response_text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, artisanId, response_text]
    );

    await createNotification(
      review.customer_id,
      'review',
      'Artisan responded to your review',
      'The artisan has responded to your review.',
      id,
      'review'
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete response (artisan only)
router.delete('/:id/response', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get artisan profile
    const artisanResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (artisanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const artisanId = artisanResult.rows[0].id;

    // Delete response
    const result = await pool.query(
      'DELETE FROM review_responses WHERE review_id = $1 AND artisan_id = $2 RETURNING id',
      [id, artisanId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Response not found' });
    }

    res.json({ success: true, message: 'Response deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get review statistics for an artisan
router.get('/stats/:artisanId', async (req, res) => {
  try {
    const { artisanId } = req.params;

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        ROUND(AVG(rating)::numeric, 1) as average_rating,
        COUNT(*) FILTER (WHERE rating = 5) as five_star,
        COUNT(*) FILTER (WHERE rating = 4) as four_star,
        COUNT(*) FILTER (WHERE rating = 3) as three_star,
        COUNT(*) FILTER (WHERE rating = 2) as two_star,
        COUNT(*) FILTER (WHERE rating = 1) as one_star,
        COUNT(*) FILTER (WHERE photo_url IS NOT NULL) as reviews_with_photos,
        COUNT(*) FILTER (WHERE id IN (SELECT review_id FROM review_responses)) as reviews_with_responses
      FROM reviews
      WHERE artisan_id = $1
    `, [artisanId]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
