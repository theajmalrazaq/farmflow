const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  approveProduct,
} = require('../controllers/productController');
const { auth } = require('../middleware/auth');

// Protected routes (farmer can create/update/delete products)
router.post('/', auth, createProduct);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);

// Add review (authenticated users)
router.post('/:id/review', auth, addReview);

// Admin routes
router.put('/:id/approve', approveProduct);

module.exports = router;
