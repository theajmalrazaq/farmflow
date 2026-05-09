const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;

    // Build filter
    let filter = {};
    if (req.query.mine === 'true' && req.user) {
      filter.farmer = req.user.id;
    }
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter)
      .populate('farmer', 'name farmName email farmSlug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name farmName email phone address')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product (farmer only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, category, image } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      quantity,
      category,
      image,
      farmer: req.user.id,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product (farmer only)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the farmer who created the product
    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product (farmer only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the farmer who created the product
    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add review to product
exports.addReview = async (req, res) => {
  try {
    const { comment, rating } = req.body;

    if (!comment || !rating) {
      return res.status(400).json({ message: 'Please provide comment and rating' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = {
      user: req.user.id,
      comment,
      rating,
    };

    product.reviews.push(review);

    // Calculate average rating
    const avgRating =
      product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
    product.rating = avgRating;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Approve product (SuperAdmin)
exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product approved successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
