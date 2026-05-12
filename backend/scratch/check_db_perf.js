const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Employee = require('../models/Employee');
const Cattle = require('../models/Cattle');
require('dotenv').config();

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const farmerCount = await User.countDocuments({ role: 'farmer' });
    const productCount = await Product.countDocuments();
    const employeeCount = await Employee.countDocuments();
    const cattleCount = await Cattle.countDocuments();

    console.log('Farmer Count:', farmerCount);
    console.log('Product Count:', productCount);
    console.log('Employee Count:', employeeCount);
    console.log('Cattle Count:', cattleCount);

    const start = Date.now();
    await User.find({ role: 'farmer', farmSlug: { $exists: true } })
      .select('name farmName farmSlug farmDescription logo coverImage address');
    console.log('getAllFarms query took:', Date.now() - start, 'ms');

    const malikFarm = await User.findOne({ farmSlug: 'malik-farms', role: 'farmer' });
    if (malikFarm) {
        const start2 = Date.now();
        await Product.find({ farmer: malikFarm._id, status: 'approved' }).sort({ createdAt: -1 });
        console.log('Products query took:', Date.now() - start2, 'ms');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDb();
