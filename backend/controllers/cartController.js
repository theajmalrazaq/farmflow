const Cart = require('../models/Cart');
const Product = require('../models/Product');


exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price category farmer image');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Please provide productId and quantity' });
    }

    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    
    if (product.quantity < quantity) {
      return res.status(400).json({ message: `Not enough stock. Available: ${product.quantity}` });
    }

    
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id });
    }

    
    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      
      existingItem.quantity += quantity;
      existingItem.price = product.price * existingItem.quantity;
    } else {
      
      cart.items.push({
        product: productId,
        quantity,
        price: product.price * quantity,
      });
    }

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price, 0);
    cart.updatedAt = Date.now();

    await cart.save();
    await cart      .populate('items.product', 'name price category farmer image');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Please provide productId' });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);

    
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price, 0);
    cart.updatedAt = Date.now();

    await cart.save();
    await cart      .populate('items.product', 'name price category farmer image');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    console.log('[updateQuantity] body:', req.body);

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: 'quantity must be a number >= 1' });
    }

    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    console.log('[updateQuantity] cart items:', cart.items.map(i => i.product.toString()));

    const cartItem = cart.items.find(item => item.product.toString() === productId.toString());
    if (!cartItem) {
      return res.status(404).json({ message: `Item with product id ${productId} not found in cart` });
    }

    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    cartItem.quantity = qty;
    cartItem.price = product.price * qty;

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price, 0);
    cart.updatedAt = Date.now();

    await cart.save();
    await cart      .populate('items.product', 'name price category farmer image');

    res.status(200).json({
      success: true,
      message: 'Quantity updated',
      cart,
    });
  } catch (error) {
    console.error('[updateQuantity] error:', error.message);
    res.status(500).json({ message: error.message });
  }
};


exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    cart.updatedAt = Date.now();

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    const count = cart ? cart.totalItems : 0;

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
