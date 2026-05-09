const User = require('../models/User');
const Product = require('../models/Product');
const Employee = require('../models/Employee');
const Cattle = require('../models/Cattle');

// Get public farm profile
exports.getFarmBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find farmer by slug
    const farm = await User.findOne({ farmSlug: slug, role: 'farmer' })
      .select('-password -email -role -createdAt -__v');

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Get public products for this farm
    const products = await Product.find({ farmer: farm._id }).sort({ createdAt: -1 });

    // Get basic stats (optional, could be public)
    const employeeCount = await Employee.countDocuments({ farmer: farm._id });
    const cattleCount = await Cattle.countDocuments({ farmer: farm._id });

    res.status(200).json({
      success: true,
      farm: {
        ...farm.toObject(),
        stats: {
          employeeCount,
          cattleCount,
        }
      },
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all farms (for global marketplace)
exports.getAllFarms = async (req, res) => {
  try {
    const farms = await User.find({ role: 'farmer', farmSlug: { $exists: true } })
      .select('name farmName farmSlug farmDescription logo coverImage address');

    res.status(200).json({
      success: true,
      count: farms.length,
      farms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Delete farm (SuperAdmin)
exports.deleteFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const farm = await User.findByIdAndDelete(id);
    
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Also delete products associated with this farm
    await Product.deleteMany({ farmer: id });

    res.status(200).json({
      success: true,
      message: 'Farm and associated products deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
