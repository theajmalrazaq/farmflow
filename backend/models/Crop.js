const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  cropType: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'dairy', 'eggs', 'honey', 'other'],
    required: true,
  },
  plantedDate: {
    type: Date,
    required: true,
  },
  expectedHarvestDate: {
    type: Date,
    required: true,
  },
  actualHarvestDate: Date,
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    enum: ['kg', 'lbs', 'tons', 'liters', 'dozens', 'pieces'],
    default: 'kg',
  },
  fieldArea: {
    type: Number, // in acres or hectares
  },
  status: {
    type: String,
    enum: ['planning', 'growing', 'harvesting', 'harvested', 'failed'],
    default: 'planning',
  },
  notes: String,
  growthProgress: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      stage: String, // e.g., "seedling", "flowering", "fruiting"
      observation: String,
      photo: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Crop', cropSchema);
