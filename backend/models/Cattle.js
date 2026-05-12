const mongoose = require('mongoose');

const cattleSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true, 
  },
  count: {
    type: Number,
    required: true,
    default: 1,
  },
  healthStatus: {
    type: String,
    enum: ['Healthy', 'Sick', 'Treatment', 'Unknown'],
    default: 'Healthy',
  },
  purpose: {
    type: String,
    enum: ['Dairy', 'Meat', 'Breeding', 'Other'],
    default: 'Dairy',
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Cattle', cattleSchema);
