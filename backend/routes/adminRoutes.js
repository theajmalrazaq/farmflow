const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSalesAnalytics,
  getAllCustomers,
  getAllFarmers,
  getInventoryAnalytics,
  getExpenseAnalytics,
  updateOrderStatus,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');

// All admin routes require authentication
// In a real app, you'd add a check to ensure user is admin role

router.get('/dashboard', auth, getDashboardStats);
router.get('/sales-analytics', auth, getSalesAnalytics);
router.get('/customers', auth, getAllCustomers);
router.get('/farmers', auth, getAllFarmers);
router.get('/inventory-analytics', auth, getInventoryAnalytics);
router.get('/expense-analytics', auth, getExpenseAnalytics);
router.put('/orders/:id', auth, updateOrderStatus);

module.exports = router;
