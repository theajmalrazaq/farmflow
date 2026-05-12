const Cattle = require('../models/Cattle');

exports.getAllCattle = async (req, res) => {
  try {
    const cattle = await Cattle.find({ farmer: req.farmerId }).sort({ createdAt: -1 });
    res.status(200).json(cattle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCattle = async (req, res) => {
  try {
    const { type, count, healthStatus, purpose } = req.body;
    if (!type || !count) return res.status(400).json({ message: 'Type and count are required' });

    const cattle = await Cattle.create({
      type,
      count,
      healthStatus,
      purpose,
      farmer: req.farmerId || req.user.id,
    });
    res.status(201).json(cattle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCattle = async (req, res) => {
  try {
    const cattle = await Cattle.findById(req.params.id);
    if (!cattle) return res.status(404).json({ message: 'Cattle not found' });

    if (req.user.role !== 'admin' && cattle.farmer.toString() !== req.farmerId?.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this cattle' });
    }

    await Cattle.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCattle = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to update cattle ${id}`);

    const cattle = await Cattle.findById(id);
    if (!cattle) {
      console.log(`Cattle ${id} not found`);
      return res.status(404).json({ message: 'Cattle not found' });
    }

    
    if (req.user.role !== 'admin' && cattle.farmer.toString() !== (req.farmerId || req.user._id).toString()) {
      return res.status(403).json({ message: 'Not authorized to update this cattle' });
    }

    const updatedCattle = await Cattle.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedCattle);
  } catch (error) {
    console.error('Update cattle error:', error);
    res.status(500).json({ message: error.message });
  }
};
