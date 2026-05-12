const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  updateOrderStatus,
  getFarmerDashboardStats,
} = require('../controllers/adminController');
const { auth, admin } = require('../middleware/auth');


router.get('/dashboard', auth, admin, getDashboardStats);
router.put('/orders/:id', auth, admin, updateOrderStatus);


router.get('/farmer/dashboard', auth, getFarmerDashboardStats);

module.exports = router;
