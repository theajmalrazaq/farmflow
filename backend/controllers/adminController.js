const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Crop = require('../models/Crop');
const Cattle = require('../models/Cattle');
const Employee = require('../models/Employee');


exports.getDashboardStats = async (req, res) => {
  try {
    
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    
    const totalFarmers = await User.countDocuments({ role: 'farmer' });

    
    const totalProducts = await Product.countDocuments();

    
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

    
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    
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


exports.getFarmerDashboardStats = async (req, res) => {
  try {
    const farmerId = req.farmerId || req.user?._id;

    if (!farmerId) {
      return res.status(400).json({ message: 'Farmer ID not found in session' });
    }

    
    const totalProducts = await Product.countDocuments({ farmer: farmerId });

    
    const totalCrops = await Crop.countDocuments({ farmer: farmerId });

    
    const totalCattle = await Cattle.countDocuments({ farmer: farmerId });

    
    const totalEmployees = await Employee.countDocuments({ farmer: farmerId });

    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesAnalytics = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      { $match: { 'productInfo.farmer': new mongoose.Types.ObjectId(farmerId) } },
      {
        $facet: {
          grandTotals: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                totalSales: { $sum: '$items.quantity' },
              },
            },
          ],
          dailyHistory: [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const statsResult = salesAnalytics[0] || { grandTotals: [], dailyHistory: [] };
    const grandTotals = statsResult.grandTotals?.[0] || { totalRevenue: 0, totalSales: 0 };
    const rawHistory = statsResult.dailyHistory || [];

    
    const salesHistory = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = rawHistory.find(d => d._id === dateStr);
      salesHistory.push({
        _id: dateStr,
        revenue: dayData ? dayData.revenue : 0
      });
    }

    
    const allExpenses = await Expense.find({ farmer: farmerId });
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    
    const farmerProductIds = await Product.find({ farmer: farmerId }).distinct('_id');

    
    const recentOrders = await Order.find({
      'items.product': { $in: farmerProductIds }
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('customer', 'name');

    const recentActivities = recentOrders.map(order => ({
      id: order._id,
      type: 'order',
      text: `New order from ${order.customer?.name || 'Customer'}`,
      time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    
    if (recentActivities.length === 0) {
      recentActivities.push({
        id: 'welcome',
        type: 'info',
        text: 'Welcome to FarmFlow! Start by adding your first product.',
        time: 'Just now'
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalCrops,
        totalCattle,
        totalEmployees,
        totalRevenue: grandTotals.totalRevenue || 0,
        totalSales: grandTotals.totalSales || 0,
        totalExpenses: totalExpenses || 0,
        salesHistory,
        recentActivities,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const filter = dateFilter ? { createdAt: dateFilter } : {};

    
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


exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('name email phone address createdAt')
      .sort({ createdAt: -1 });

    
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


exports.getAllFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .select('name email farmName phone address createdAt')
      .sort({ createdAt: -1 });

    
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


exports.getInventoryAnalytics = async (req, res) => {
  try {
    const Inventory = require('../models/Inventory');

    
    const lowStockItems = await Inventory.find({ quantity: { $lt: 10 } })
      .populate('product', 'name category price')
      .populate('farmer', 'name farmName');

    
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


exports.getExpenseAnalytics = async (req, res) => {
  try {
    
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
