const Employee = require('../models/Employee');
const User = require('../models/User');

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ farmer: req.user.id })
      .populate('user')
      .sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, role, salary, contact, email, password, permissions } = req.body;
    if (!name || !role || !salary || !email || !password) {
      return res.status(400).json({ message: 'Name, role, salary, email, and password are required' });
    }

    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User with this email already exists' });

    
    const user = await User.create({
      name,
      email,
      password,
      role: 'employee',
      employer: req.user.id,
      permissions: permissions || {
        inventory: false,
        crops: false,
        cattle: false,
        expenses: false
      }
    });

    
    const employee = await Employee.create({
      name,
      role,
      salary,
      contact,
      email,
      password, 
      user: user._id,
      farmer: req.user.id,
    });
    const populatedEmployee = await Employee.findById(employee._id).populate('user');
    res.status(201).json(populatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    
    if (employee.user) {
      await User.findByIdAndDelete(employee.user);
    }

    await Employee.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { name, role, salary, contact, permissions } = req.body;
    
    const employee = await Employee.findOne({ _id: req.params.id, farmer: req.user.id });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    
    if (name) employee.name = name;
    if (role) employee.role = role;
    if (salary) employee.salary = salary;
    if (contact) employee.contact = contact;
    await employee.save();

    
    if (employee.user) {
      const user = await User.findById(employee.user);
      if (user) {
        if (name) user.name = name;
        if (permissions) user.permissions = permissions;
        await user.save();
      }
    }

    const updatedEmployee = await Employee.findById(employee._id).populate('user');
    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
