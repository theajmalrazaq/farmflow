const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['farmer', 'customer', 'admin', 'employee'],
    default: 'customer',
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  permissions: {
    dashboard: { type: Boolean, default: false },
    inventory: { type: Boolean, default: false },
    crops: { type: Boolean, default: false },
    cattle: { type: Boolean, default: false },
    expenses: { type: Boolean, default: false },
  },
  farmName: {
    type: String,
  },
  farmSlug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
  },
  farmDescription: {
    type: String,
  },
  logo: {
    type: String,
  },
  coverImage: {
    type: String,
  },
  phone: String,
  address: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});


userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
