const express = require('express');
const router = express.Router();
const { getAllCattle, createCattle, deleteCattle, updateCattle } = require('../controllers/cattleController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getAllCattle);
router.post('/', auth, createCattle);
router.put('/:id', auth, updateCattle);
router.delete('/:id', auth, deleteCattle);

module.exports = router;
