const express = require('express');
const router = express.Router();
const {
  createCrop,
  getMyCrops,
  getCropById,
  updateCrop,
  updateCropStatus,
  addGrowthProgress,
  deleteCrop,
} = require('../controllers/cropController');
const auth = require('../middleware/auth');

// Protected routes (farmer only)
router.post('/', auth, createCrop);
router.get('/', auth, getMyCrops);
router.get('/:id', auth, getCropById);
router.put('/:id', auth, updateCrop);
router.put('/:id/status', auth, updateCropStatus);
router.post('/:id/growth', auth, addGrowthProgress);
router.delete('/:id', auth, deleteCrop);

module.exports = router;
