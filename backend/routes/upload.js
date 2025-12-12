const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/auth');
const { Pool } = require('pg');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload profile picture
router.post('/profile-picture', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    // Update user profile
    const result = await pool.query(
      'UPDATE users SET profile_image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [imageUrl, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      image_url: imageUrl,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload service image
router.post('/service-image/:serviceId', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { serviceId } = req.params;
    const imageUrl = `/uploads/${req.file.filename}`;

    // Verify service belongs to user
    const serviceResult = await pool.query(`
      SELECT s.* FROM services s
      JOIN artisan_profiles ap ON s.artisan_id = ap.id
      WHERE s.id = $1 AND ap.user_id = $2
    `, [serviceId, req.user.id]);

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Update service image
    const result = await pool.query(
      'UPDATE services SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [imageUrl, serviceId]
    );

    res.json({
      success: true,
      message: 'Service image uploaded successfully',
      image_url: imageUrl,
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload verification documents
router.post('/verification-document', authMiddleware, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const documentUrl = `/uploads/${req.file.filename}`;

    // Get artisan profile
    const profileResult = await pool.query(
      'SELECT id FROM artisan_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Artisan profile not found' });
    }

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document_url: documentUrl,
      artisan_id: profileResult.rows[0].id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Serve uploaded files
router.get('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);

    // Security check - prevent directory traversal
    if (!filepath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
});

module.exports = router;
