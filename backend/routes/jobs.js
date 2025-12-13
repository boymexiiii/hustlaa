const express = require('express');
const { authMiddleware, artisanMiddleware, customerMiddleware } = require('../middleware/auth');
const { createNotification } = require('./notifications');
const pool = require('../db/pool');

const router = express.Router();

// List jobs (public)
router.get('/', async (req, res) => {
  try {
    const { status = 'open', category, state, city, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT j.*,
             u.first_name AS customer_first_name,
             u.last_name AS customer_last_name,
             (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) AS applications_count
      FROM jobs j
      JOIN users u ON j.customer_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND j.status = $${paramCount}`;
      params.push(status);
    }

    if (category) {
      paramCount++;
      query += ` AND j.category ILIKE $${paramCount}`;
      params.push(`%${category}%`);
    }

    if (state) {
      paramCount++;
      query += ` AND j.state = $${paramCount}`;
      params.push(state);
    }

    if (city) {
      paramCount++;
      query += ` AND j.city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
    }

    query += ` ORDER BY j.created_at DESC`;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// List jobs created by the current customer
router.get('/my', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*,
              u.first_name AS customer_first_name,
              u.last_name AS customer_last_name,
              (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) AS applications_count
       FROM jobs j
       JOIN users u ON j.customer_id = u.id
       WHERE j.customer_id = $1
       ORDER BY j.created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// List applications made by the current artisan
router.get('/my-applications', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const profileResult = await pool.query('SELECT id FROM artisan_profiles WHERE user_id = $1', [req.user.id]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const artisanId = profileResult.rows[0].id;

    const result = await pool.query(
      `SELECT
          ja.id AS application_id,
          ja.status AS application_status,
          ja.cover_letter,
          ja.created_at AS applied_at,
          j.*,
          u.first_name AS customer_first_name,
          u.last_name AS customer_last_name
       FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       JOIN users u ON j.customer_id = u.id
       WHERE ja.artisan_id = $1
       ORDER BY ja.created_at DESC`,
      [artisanId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Apply to a job (artisan only) - MUST come before /:id GET route
router.post('/:id/apply', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { cover_letter } = req.body;

    const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (jobResult.rows[0].status !== 'open') {
      return res.status(400).json({ error: 'Job is not open' });
    }

    const profileResult = await pool.query('SELECT id FROM artisan_profiles WHERE user_id = $1', [req.user.id]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const artisanId = profileResult.rows[0].id;

    const insert = await pool.query(
      `INSERT INTO job_applications (job_id, artisan_id, cover_letter)
       VALUES ($1, $2, $3)
       ON CONFLICT (job_id, artisan_id) DO UPDATE SET cover_letter = EXCLUDED.cover_letter
       RETURNING *`,
      [id, artisanId, cover_letter || null]
    );

    await createNotification(
      jobResult.rows[0].customer_id,
      'system',
      'New job application',
      'An artisan has applied to your job.',
      id,
      'job'
    );

    res.status(201).json(insert.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Close job (customer only) - MUST come before /:id GET route
router.patch('/:id/close', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE jobs
       SET status = 'closed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND customer_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get applications for a job (customer only) - MUST come before /:id GET route
router.get('/:id/applications', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1 AND customer_id = $2', [id, req.user.id]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const apps = await pool.query(
      `SELECT a.*, ap.user_id, u.first_name, u.last_name, u.profile_image_url
       FROM job_applications a
       JOIN artisan_profiles ap ON a.artisan_id = ap.id
       JOIN users u ON ap.user_id = u.id
       WHERE a.job_id = $1
       ORDER BY a.created_at DESC`,
      [id]
    );

    res.json(apps.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get job by id (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT j.*,
              u.first_name AS customer_first_name,
              u.last_name AS customer_last_name,
              (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) AS applications_count
       FROM jobs j
       JOIN users u ON j.customer_id = u.id
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create job (customer only)
router.post('/', authMiddleware, customerMiddleware, async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      state,
      city,
      address,
      budget_min,
      budget_max,
    } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO jobs
        (customer_id, title, category, description, state, city, address, budget_min, budget_max)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        req.user.id,
        title,
        category,
        description,
        state || null,
        city || null,
        address || null,
        budget_min !== undefined && budget_min !== null ? Number(budget_min) : null,
        budget_max !== undefined && budget_max !== null ? Number(budget_max) : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Update application status (customer only)
router.patch('/:jobId/applications/:applicationId', authMiddleware, customerMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { jobId, applicationId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await client.query('BEGIN');

    const jobResult = await client.query('SELECT * FROM jobs WHERE id = $1 AND customer_id = $2', [jobId, req.user.id]);
    if (jobResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Job not found' });
    }

    const updateRes = await client.query(
      `UPDATE job_applications
       SET status = $1
       WHERE id = $2 AND job_id = $3
       RETURNING *`,
      [status, applicationId, jobId]
    );

    if (updateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Application not found' });
    }

    const artisanUserRes = await client.query(
      `SELECT ap.user_id
       FROM job_applications ja
       JOIN artisan_profiles ap ON ja.artisan_id = ap.id
       WHERE ja.id = $1`,
      [applicationId]
    );

    if (artisanUserRes.rows.length > 0) {
      const artisanUserId = artisanUserRes.rows[0].user_id;
      await createNotification(
        artisanUserId,
        'system',
        `Job application ${status}`,
        `Your application was ${status} by the customer.`,
        Number(jobId),
        'job'
      );
    }

    if (status === 'accepted') {
      await client.query(
        `UPDATE job_applications
         SET status = 'rejected'
         WHERE job_id = $1 AND id <> $2 AND status = 'pending'`,
        [jobId, applicationId]
      );

      await client.query(
        `UPDATE jobs
         SET status = 'closed', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [jobId]
      );
    }

    await client.query('COMMIT');
    res.json(updateRes.rows[0]);
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (e) {
      // ignore
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
