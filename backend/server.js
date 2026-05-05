const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => console.log('❌ MongoDB connection error:', err.message));

// Middleware
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('FarmFlow Backend is running!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});