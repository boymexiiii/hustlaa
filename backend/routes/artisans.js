const express = require('express');
const { authMiddleware, artisanMiddleware } = require('../middleware/auth');
const pool = require('../db/pool');

const router = express.Router();

// Nigerian states for validation
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

// Get all artisans with filters
router.get('/', async (req, res) => {
  try {
    const { state, city, skill, rating, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.profile_image_url,
        ap.id as artisan_id, ap.bio, ap.rating, ap.total_reviews, 
        ap.skills, ap.hourly_rate, ap.availability_status, ap.verification_status,
        al.state, al.city, al.address
      FROM users u
      JOIN artisan_profiles ap ON u.id = ap.user_id
      LEFT JOIN artisan_locations al ON ap.id = al.artisan_id
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

    if (rating) {
      paramCount++;
      query += ` AND ap.rating >= $${paramCount}`;
      params.push(parseFloat(rating));
    }

    query += ` ORDER BY ap.rating DESC, ap.total_reviews DESC`;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get artisan by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const artisanResult = await pool.query(`
      SELECT 
        u.id, u.first_name, u.last_name, u.phone, u.profile_image_url,
        ap.id as artisan_id, ap.bio, ap.rating, ap.total_reviews, 
        ap.skills, ap.hourly_rate, ap.availability_status, ap.verification_status,
        al.state, al.city, al.address, al.latitude, al.longitude
      FROM users u
      JOIN artisan_profiles ap ON u.id = ap.user_id
      LEFT JOIN artisan_locations al ON ap.id = al.artisan_id
      WHERE ap.id = $1
    `, [id]);

    if (artisanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan not found' });
    }

    // Get services
    const servicesResult = await pool.query(
      'SELECT * FROM services WHERE artisan_id = $1',
      [id]
    );

    // Get reviews
    const reviewsResult = await pool.query(`
      SELECT r.*, u.first_name, u.last_name, u.profile_image_url
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.artisan_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [id]);

    res.json({
      ...artisanResult.rows[0],
      services: servicesResult.rows,
      reviews: reviewsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update artisan profile
router.put('/profile', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { bio, skills, hourly_rate, availability_status } = req.body;

    const result = await pool.query(`
      UPDATE artisan_profiles 
      SET bio = COALESCE($1, bio),
          skills = COALESCE($2, skills),
          hourly_rate = COALESCE($3, hourly_rate),
          availability_status = COALESCE($4, availability_status),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $5
      RETURNING *
    `, [bio, skills, hourly_rate, availability_status, req.user.id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Set artisan location
router.post('/location', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { state, city, address, latitude, longitude, service_radius_km } = req.body;

    if (!NIGERIAN_STATES.includes(state)) {
      return res.status(400).json({ error: 'Invalid Nigerian state' });
    }

    // Get artisan profile id
    const profileResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const artisanId = profileResult.rows[0].id;

    // Upsert location
    const result = await pool.query(`
      INSERT INTO artisan_locations (artisan_id, state, city, address, latitude, longitude, service_radius_km)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (artisan_id) 
      DO UPDATE SET 
        state = $2, city = $3, address = $4, 
        latitude = $5, longitude = $6, service_radius_km = $7,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [artisanId, state, city, address, latitude, longitude, service_radius_km || 10]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add service
router.post('/services', authMiddleware, artisanMiddleware, async (req, res) => {
  try {
    const { name, description, price, duration_minutes, image_url } = req.body;

    const profileResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    const result = await pool.query(`
      INSERT INTO services (artisan_id, name, description, price, duration_minutes, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [profileResult.rows[0].id, name, description, price, duration_minutes, image_url]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Nigerian states
router.get('/meta/states', (req, res) => {
  res.json(NIGERIAN_STATES);
});

// Search artisans by location proximity
router.get('/search/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius_km = 10, skill } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    let query = `
      SELECT 
        u.id, u.first_name, u.last_name, u.profile_image_url,
        ap.id as artisan_id, ap.bio, ap.rating, ap.total_reviews, 
        ap.skills, ap.hourly_rate, ap.availability_status,
        al.state, al.city, al.address, al.latitude, al.longitude,
        (6371 * acos(cos(radians($1)) * cos(radians(al.latitude)) * 
         cos(radians(al.longitude) - radians($2)) + 
         sin(radians($1)) * sin(radians(al.latitude)))) AS distance_km
      FROM users u
      JOIN artisan_profiles ap ON u.id = ap.user_id
      JOIN artisan_locations al ON ap.id = al.artisan_id
      WHERE ap.verification_status = 'verified'
        AND ap.availability_status = 'available'
    `;

    const params = [parseFloat(latitude), parseFloat(longitude)];
    let paramCount = 2;

    if (skill) {
      paramCount++;
      query += ` AND $${paramCount} = ANY(ap.skills)`;
      params.push(skill);
    }

    query += ` AND (6371 * acos(cos(radians($1)) * cos(radians(al.latitude)) * 
              cos(radians(al.longitude) - radians($2)) + 
              sin(radians($1)) * sin(radians(al.latitude)))) < $${paramCount + 1}`;
    params.push(parseFloat(radius_km));

    query += ` ORDER BY distance_km ASC LIMIT 50`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
