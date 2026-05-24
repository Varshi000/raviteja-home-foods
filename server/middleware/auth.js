// server/middleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: 'Missing token' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user; // { email: ... }
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.email && req.user.email === process.env.ADMIN_EMAIL) {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

module.exports = { verifyToken, verifyAdmin };
