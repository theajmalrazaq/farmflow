const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  getAllOrders,
} = require('../controllers/orderController');
const { auth } = require('../middleware/auth');


router.post('/', auth, createOrder);
router.get('/my-orders', auth, getMyOrders);
router.get('/:id', auth, getOrderById);
router.put('/:id', auth, updateOrderStatus);
router.delete('/:id', auth, deleteOrder);
router.post('/:id/cancel', auth, cancelOrder);


router.get('/', auth, getAllOrders);

module.exports = router;
