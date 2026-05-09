const express = require('express');
const router = express.Router();
const { getAllCattle, createCattle, deleteCattle } = require('../controllers/cattleController');
const auth = require('../middleware/auth');

router.get('/', auth, getAllCattle);
router.post('/', auth, createCattle);
router.delete('/:id', auth, deleteCattle);

module.exports = router;
