const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort } = req.query;
    let filter = {};
    if (req.query.mine === 'true' && req.user) {
      filter.farmer = req.farmerId;
    } else if (req.query.all === 'true') {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized as an admin' });
      }
    } else {
      filter.status = 'approved';
    }
    if (category && category !== 'all') filter.category = category;
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

    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { price: 1 };
    if (sort === 'price_desc') sortOptions = { price: -1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };

    const products = await Product.find(filter)
      .populate('farmer', 'name farmName email farmSlug')
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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
      farmer: req.farmerId,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    
    if (req.user.role !== 'admin' && product.farmer.toString() !== req.farmerId?.toString()) {
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


exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    
    if (req.user.role !== 'admin' && product.farmer.toString() !== req.farmerId?.toString()) {
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

exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('farmer', 'name farmName email farmSlug');

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


exports.rejectProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('farmer', 'name farmName email farmSlug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product rejected',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
