const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');


exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Please add items to order' });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: 'Please provide delivery address' });
    }

    
    let totalPrice = 0;
    const orderItems = [];
    const farmerIds = new Set();

    for (let item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      totalPrice += product.price * item.quantity;
      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price,
      });

      farmerIds.add(product.farmer.toString());

      
      product.quantity -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      totalPrice,
      deliveryAddress,
      notes,
    });

    
    for (const farmerId of farmerIds) {
      await Notification.create({
        recipient: farmerId,
        type: 'ORDER_PLACED',
        title: 'New Order Received',
        message: `New Order #${order._id.toString().slice(-6)} received with ${order.items.length} items. Total value: Rs. ${order.totalPrice.toLocaleString()}`,
        relatedId: order._id
      });
    }

    await order.populate('items.product', 'name price image');
    await order.populate('customer', 'name email phone');

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price image description')
      .populate('customer', 'name email phone address');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    
    if (order.customer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json({
      success: true,
      order,
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


exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending orders' });
    }

    
    for (let item of order.items) {
      const product = await Product.findById(item.product);
      product.quantity += item.quantity;
      await product.save();
    }

    order.status = 'cancelled';
    order.updatedAt = Date.now();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled and inventory restored',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'admin') {
      
      orders = await Order.find()
        .populate('customer', 'name email phone')
        .populate('items.product', 'name price image farmer')
        .sort({ createdAt: -1 });
    } else {
      
      const farmerProducts = await Product.find({ farmer: req.user.id }).select('_id');
      const farmerProductIds = farmerProducts.map(p => p._id);

      
      orders = await Order.find({
        'items.product': { $in: farmerProductIds }
      })
        .populate('customer', 'name email phone')
        .populate('items.product', 'name price image farmer')
        .sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    
    if (req.user.role !== 'admin') {
      const farmerProducts = await Product.find({ farmer: req.user.id }).distinct('_id');
      const hasFarmerProduct = order.items.some(item => 
        farmerProducts.some(fpId => fpId.toString() === item.product.toString())
      );
      
      if (!hasFarmerProduct) {
        return res.status(403).json({ message: 'Not authorized to delete this order' });
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
