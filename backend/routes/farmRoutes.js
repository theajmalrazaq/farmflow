const express = require('express');
const router = express.Router();
const { getFarmBySlug, getAllFarms, deleteFarm } = require('../controllers/farmController');
const { auth, admin } = require('../middleware/auth');


router.get('/', getAllFarms);
router.get('/:slug', getFarmBySlug);


router.delete('/:id', auth, admin, deleteFarm);

module.exports = router;
