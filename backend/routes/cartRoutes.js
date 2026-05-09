const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartCount,
} = require('../controllers/cartController');
const auth = require('../middleware/auth');

// Protected routes (customers)
router.get('/', auth, getCart);
router.post('/add', auth, addToCart);
router.post('/remove', auth, removeFromCart);
router.put('/update', auth, updateQuantity);
router.post('/clear', auth, clearCart);
router.delete('/clear', auth, clearCart);
router.get('/count', auth, getCartCount);

module.exports = router;
