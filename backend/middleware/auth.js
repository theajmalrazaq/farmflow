const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    
    
    if (user.role === 'farmer') {
      req.farmerId = user._id;
    } else if (user.role === 'employee') {
      req.farmerId = user.employer;
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        if (user.role === 'farmer') req.farmerId = user._id;
        else if (user.role === 'employee') req.farmerId = user.employer;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === 'farmer' || req.user.role === 'admin') {
      return next();
    }
    
    if (req.user.role === 'employee' && req.user.permissions && req.user.permissions[permission]) {
      return next();
    }
    
    res.status(403).json({ message: `Access denied: Missing ${permission} permission` });
  };
};

module.exports = {
  auth,
  optionalAuth,
  admin,
  checkPermission
};
