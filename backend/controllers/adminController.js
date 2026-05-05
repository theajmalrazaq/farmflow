const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Crop = require('../models/Crop');

// Dashboard overview
exports.getDashboardStats = async (req, res) => {
  try {
    // Total orders
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    // Total customers
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    // Total farmers
    const totalFarmers = await User.countDocuments({ role: 'farmer' });

    // Total products
    const totalProducts = await Product.countDocuments();

    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalCustomers,
        totalFarmers,
        totalProducts,
        topProducts,
        ordersByStatus,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Sales analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = dateFilter ? { createdAt: dateFilter } : {};

    // Daily revenue
    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue by payment status
    const revenueByStatus = await Order.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $group: {
          _id: '$paymentStatus',
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Category sales
    const categorySales = await Order.aggregate([
      { $match: { createdAt: dateFilter } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        dailyRevenue,
        revenueByStatus,
        categorySales,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Customer management
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('name email phone address createdAt')
      .sort({ createdAt: -1 });

    // Get customer stats
    const customerStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.countDocuments({ customer: customer._id });
        const totalSpent = await Order.aggregate([
          { $match: { customer: customer._id } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);

        return {
          ...customer.toObject(),
          totalOrders: orders,
          totalSpent: totalSpent[0]?.total || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: customerStats.length,
      customers: customerStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Farmer management
exports.getAllFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .select('name email farmName phone address createdAt')
      .sort({ createdAt: -1 });

    // Get farmer stats
    const farmerStats = await Promise.all(
      farmers.map(async (farmer) => {
        const products = await Product.countDocuments({ farmer: farmer._id });
        const crops = await Crop.countDocuments({ farmer: farmer._id });
        const totalProductRevenue = await Order.aggregate([
          { $unwind: '$items' },
          {
            $lookup: {
              from: 'products',
              localField: 'items.product',
              foreignField: '_id',
              as: 'product',
            },
          },
          { $unwind: '$product' },
          { $match: { 'product.farmer': farmer._id } },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            },
          },
        ]);

        return {
          ...farmer.toObject(),
          totalProducts: products,
          totalCrops: crops,
          totalRevenue: totalProductRevenue[0]?.total || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: farmerStats.length,
      farmers: farmerStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Inventory analytics
exports.getInventoryAnalytics = async (req, res) => {
  try {
    const Inventory = require('../models/Inventory');

    // Low stock items
    const lowStockItems = await Inventory.find({ quantity: { $lt: 10 } })
      .populate('product', 'name category price')
      .populate('farmer', 'name farmName');

    // Inventory by farmer
    const inventoryByFarmer = await Inventory.aggregate([
      {
        $group: {
          _id: '$farmer',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'farmerInfo',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        lowStockItems,
        inventoryByFarmer,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Expense analytics
exports.getExpenseAnalytics = async (req, res) => {
  try {
    // Total expenses by category
    const expensesByCategory = await Expense.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Expenses by farmer
    const expensesByFarmer = await Expense.aggregate([
      {
        $group: {
          _id: '$farmer',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'farmerInfo',
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly expense trend
    const monthlyExpenses = await Expense.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        expensesByCategory,
        expensesByFarmer,
        monthlyExpenses,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Please provide status' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.updatedAt = Date.now();

    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
