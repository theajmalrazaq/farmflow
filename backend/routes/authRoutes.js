const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, updateProfile, changePassword } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getCurrentUser);
router.put('/update', auth, updateProfile);
router.put('/change-password', auth, changePassword);

module.exports = router;
