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
const cattleRoutes = require('./routes/cattleRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const farmRoutes = require('./routes/farmRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const morgan = require('morgan');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
app.use(morgan('dev'));


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
app.use('/api/cattle', cattleRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/notifications', notificationRoutes);


mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(async err => {
    console.error('MongoDB connection error:', err.message);
    try {
      const { execSync } = require('child_process');
      const ip = execSync('curl -s ifconfig.me').toString().trim();
      console.log(`Please whitelist this IP in MongoDB Atlas: ${ip}`);
    } catch (ipErr) {
      console.log('Please check your MongoDB Atlas IP whitelist.');
    }
    process.exit(1);
  });