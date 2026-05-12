const express = require('express');
const router = express.Router();
const {
  createExpense,
  getMyExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} = require('../controllers/expenseController');
const { auth } = require('../middleware/auth');


router.post('/', auth, createExpense);
router.get('/', auth, getMyExpenses);
router.get('/summary', auth, getExpenseSummary);
router.get('/:id', auth, getExpenseById);
router.put('/:id', auth, updateExpense);
router.delete('/:id', auth, deleteExpense);

module.exports = router;
