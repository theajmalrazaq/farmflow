const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cropRoutes = require('./routes/cropRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes');

const morgan = require('morgan');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.send('FarmFlow Backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    // Start Server only after DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(async err => {
    console.error('❌ MongoDB connection error:', err.message);
    try {
      const { execSync } = require('child_process');
      const ip = execSync('curl -s ifconfig.me').toString().trim();
      console.log(`👉 Please whitelist this IP in MongoDB Atlas: ${ip}`);
    } catch (ipErr) {
      console.log('👉 Please check your MongoDB Atlas IP whitelist.');
    }
    process.exit(1);
  });