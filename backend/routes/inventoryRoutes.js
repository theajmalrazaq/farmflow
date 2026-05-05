const express = require('express');
const router = express.Router();
const {
  createInventory,
  getMyInventory,
  getInventoryById,
  updateInventory,
  deleteInventory,
} = require('../controllers/inventoryController');
const auth = require('../middleware/auth');

// Protected routes (farmer only)
router.post('/', auth, createInventory);
router.get('/', auth, getMyInventory);
router.get('/:id', auth, getInventoryById);
router.put('/:id', auth, updateInventory);
router.delete('/:id', auth, deleteInventory);

module.exports = router;
