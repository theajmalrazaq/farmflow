const Employee = require('../models/Employee');

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ farmer: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, role, salary, contact } = req.body;
    if (!name || !role || !salary) return res.status(400).json({ message: 'Name, role, and salary are required' });

    const employee = await Employee.create({
      name,
      role,
      salary,
      contact,
      farmer: req.user.id,
    });
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
