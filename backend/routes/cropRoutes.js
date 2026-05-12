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
const { auth, checkPermission } = require('../middleware/auth');


router.post('/', auth, checkPermission('crops'), createCrop);
router.get('/', auth, checkPermission('crops'), getMyCrops);
router.get('/:id', auth, checkPermission('crops'), getCropById);
router.put('/:id', auth, checkPermission('crops'), updateCrop);
router.put('/:id/status', auth, checkPermission('crops'), updateCropStatus);
router.delete('/:id', auth, checkPermission('crops'), deleteCrop);

module.exports = router;
