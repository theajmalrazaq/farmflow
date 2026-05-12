const Expense = require('../models/Expense');


exports.createExpense = async (req, res) => {
  try {
    const { category, amount, currency, description, date, crop, vendor, invoice, notes } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ message: 'Please provide category and amount' });
    }

    const expense = await Expense.create({
      farmer: req.farmerId || req.user.id,
      category,
      amount,
      currency,
      description,
      date,
      crop,
      vendor,
      invoice,
      notes,
    });

    res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMyExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, crop } = req.query;
    let filter = { farmer: req.farmerId };

    if (category) filter.category = category;
    if (crop) filter.crop = crop;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter)
      .populate('crop', 'name cropType')
      .sort({ date: -1 });

    
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalExpenses,
      expenses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('crop', 'name cropType');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (req.user.role !== 'admin' && expense.farmer.toString() !== req.farmerId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this expense' });
    }

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (req.user.role !== 'admin' && expense.farmer.toString() !== req.farmerId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this expense' });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('crop', 'name cropType');

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (req.user.role !== 'admin' && expense.farmer.toString() !== req.farmerId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ farmer: req.farmerId });

    const summary = {};
    expenses.forEach((exp) => {
      if (!summary[exp.category]) {
        summary[exp.category] = 0;
      }
      summary[exp.category] += exp.amount;
    });

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
