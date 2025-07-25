// === /server/routes/auth.js ===
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

// Public routes (no token required)
router.post('/register', register);
router.post('/login', login);

module.exports = router;