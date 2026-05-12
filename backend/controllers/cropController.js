const Crop = require('../models/Crop');


exports.createCrop = async (req, res) => {
  try {
    const { name, cropType, plantedDate, expectedHarvestDate, quantity, unit, fieldArea, location, notes } = req.body;

    if (!name || !cropType || !plantedDate || !expectedHarvestDate || !quantity) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const crop = await Crop.create({
      farmer: req.farmerId,
      name,
      cropType,
      plantedDate,
      expectedHarvestDate,
      quantity,
      unit,
      fieldArea,
      location,
      notes,
    });

    res.status(201).json({
      success: true,
      crop,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMyCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ farmer: req.farmerId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: crops.length,
      crops,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    
    if (req.user.role !== 'admin' && crop.farmer.toString() !== req.farmerId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this crop' });
    }

    res.status(200).json({
      success: true,
      crop,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateCrop = async (req, res) => {
  try {
    let crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    
    if (req.user.role !== 'admin' && crop.farmer.toString() !== req.farmerId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this crop' });
    }

    crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      crop,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateCropStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Please provide status' });
    }

    let crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (req.user.role !== 'admin' && crop.farmer.toString() !== req.farmerId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this crop' });
    }

    crop.status = status;
    if (status === 'harvested') {
      crop.actualHarvestDate = new Date();
    }
    crop.updatedAt = Date.now();

    await crop.save();

    res.status(200).json({
      success: true,
      crop,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.addGrowthProgress = async (req, res) => {
  try {
    const { stage, observation, photo } = req.body;

    if (!stage || !observation) {
      return res.status(400).json({ message: 'Please provide stage and observation' });
    }

    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (req.user.role !== 'admin' && crop.farmer.toString() !== req.farmerId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this crop' });
    }

    crop.growthProgress.push({
      stage,
      observation,
      photo,
    });

    crop.updatedAt = Date.now();
    await crop.save();

    res.status(201).json({
      success: true,
      message: 'Growth progress added',
      crop,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (req.user.role !== 'admin' && crop.farmer.toString() !== req.farmerId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this crop' });
    }

    await Crop.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Crop deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
