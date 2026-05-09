const express = require('express');
const router = express.Router();
const { getAllEmployees, createEmployee, deleteEmployee } = require('../controllers/employeeController');
const auth = require('../middleware/auth');

router.get('/', auth, getAllEmployees);
router.post('/', auth, createEmployee);
router.delete('/:id', auth, deleteEmployee);

module.exports = router;
