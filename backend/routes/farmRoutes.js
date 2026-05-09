const express = require('express');
const router = express.Router();
const { getFarmBySlug, getAllFarms, deleteFarm } = require('../controllers/farmController');

// Public routes for marketplace and farm profiles
router.get('/', getAllFarms);
router.get('/:slug', getFarmBySlug);

// Admin routes
router.delete('/:id', deleteFarm);

module.exports = router;
