const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

// Create inventory entry
exports.createInventory = async (req, res) => {
  try {
    const { product, quantity, unit, warehouseLocation, expiryDate, batchNumber, quality, notes } = req.body;

    if (!product || !quantity) {
      return res.status(400).json({ message: 'Please provide product and quantity' });
    }

    // Check if product exists and belongs to farmer
    const prod = await Product.findById(product);
    if (!prod || prod.farmer.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Product not found or you do not own it' });
    }

    const inventory = await Inventory.create({
      farmer: req.user.id,
      product,
      quantity,
      unit,
      warehouseLocation,
      expiryDate,
      batchNumber,
      quality,
      notes,
    });

    await inventory.populate('product', 'name category price');

    res.status(201).json({
      success: true,
      inventory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my inventory
exports.getMyInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ farmer: req.user.id })
      .populate('product', 'name category price')
      .sort({ lastRestockedDate: -1 });

    res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get inventory item
exports.getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('product', 'name category price description');

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    if (inventory.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this inventory' });
    }

    res.status(200).json({
      success: true,
      inventory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update inventory
exports.updateInventory = async (req, res) => {
  try {
    let inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    if (inventory.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this inventory' });
    }

    inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('product', 'name category price');

    res.status(200).json({
      success: true,
      inventory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete inventory
exports.deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    if (inventory.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this inventory' });
    }

    await Inventory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Inventory deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
