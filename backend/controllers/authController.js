const User = require('../models/User');
const jwt = require('jsonwebtoken');


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};


exports.register = async (req, res) => {
  try {
    const { name, email, password, role, farmName, address, coverImage, logo } = req.body;

    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    
    let farmSlug = undefined;
    if (role === 'farmer' && farmName) {
      farmSlug = farmName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      const existingSlug = await User.findOne({ farmSlug });
      if (existingSlug) {
        farmSlug += `-${Math.floor(Math.random() * 1000)}`;
      }
    }

    
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      farmName: role === 'farmer' ? farmName : undefined,
      farmSlug,
      address: role === 'farmer' ? address : undefined,
      coverImage: role === 'farmer' ? coverImage : undefined,
      logo: role === 'farmer' ? logo : undefined,
    });

    
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmSlug: user.farmSlug,
        permissions: user.permissions,
        employer: user.employer,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmSlug: user.farmSlug,
        permissions: user.permissions,
        employer: user.employer,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmName: user.farmName,
        farmSlug: user.farmSlug,
        farmDescription: user.farmDescription,
        address: user.address,
        coverImage: user.coverImage,
        logo: user.logo,
        permissions: user.permissions,
        employer: user.employer,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { name, address, coverImage, farmName, farmDescription, logo } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (address) user.address = address;
    if (coverImage) user.coverImage = coverImage;
    if (farmName) user.farmName = farmName;
    if (farmDescription) user.farmDescription = farmDescription;
    if (logo) user.logo = logo;

    
    if (farmName && user.role === 'farmer') {
      user.farmSlug = farmName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const existingSlug = await User.findOne({ farmSlug: user.farmSlug, _id: { $ne: user._id } });
      if (existingSlug) {
        user.farmSlug += `-${Math.floor(Math.random() * 1000)}`;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        coverImage: user.coverImage,
        farmName: user.farmName,
        farmSlug: user.farmSlug
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new passwords' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
