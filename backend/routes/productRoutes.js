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
  rejectProduct,
} = require('../controllers/productController');
const { auth, optionalAuth, admin, checkPermission } = require('../middleware/auth');


router.get('/', optionalAuth, getAllProducts);
router.get('/:id', getProductById);


router.post('/', auth, checkPermission('inventory'), createProduct);
router.put('/:id', auth, checkPermission('inventory'), updateProduct);
router.delete('/:id', auth, checkPermission('inventory'), deleteProduct);


router.post('/:id/review', auth, addReview);


router.put('/:id/approve', auth, admin, approveProduct);
router.put('/:id/reject', auth, admin, rejectProduct);

module.exports = router;
