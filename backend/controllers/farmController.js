const User = require('../models/User');
const Product = require('../models/Product');
const Employee = require('../models/Employee');
const Cattle = require('../models/Cattle');


exports.getFarmBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    
    const farm = await User.findOne({ farmSlug: slug, role: 'farmer' })
      .select('-password -email -role -createdAt -__v');

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    
    const products = await Product.find({ farmer: farm._id, status: 'approved' }).sort({ createdAt: -1 });

    
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


exports.getAllFarms = async (req, res) => {
  try {
    const { region } = req.query;
    let filter = { role: 'farmer', farmSlug: { $exists: true } };

    if (region && region !== 'all') {
      filter.address = { $regex: region, $options: 'i' };
    }

    const farms = await User.find(filter)
      .select('name farmName farmSlug farmDescription address');

    res.status(200).json({
      success: true,
      count: farms.length,
      farms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const farm = await User.findByIdAndDelete(id);
    
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    
    await Product.deleteMany({ farmer: id });

    res.status(200).json({
      success: true,
      message: 'Farm and associated products deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
