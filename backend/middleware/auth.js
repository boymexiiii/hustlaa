const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const artisanMiddleware = (req, res, next) => {
  if (req.user.user_type !== 'artisan') {
    return res.status(403).json({ error: 'Access denied. Artisan only.' });
  }
  next();
};

const customerMiddleware = (req, res, next) => {
  if (req.user.user_type !== 'customer') {
    return res.status(403).json({ error: 'Access denied. Customer only.' });
  }
  next();
};

module.exports = { authMiddleware, artisanMiddleware, customerMiddleware };
