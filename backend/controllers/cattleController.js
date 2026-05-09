const Cattle = require('../models/Cattle');

exports.getAllCattle = async (req, res) => {
  try {
    const cattle = await Cattle.find({ farmer: req.user.id }).sort({ createdAt: -1 });
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
      farmer: req.user.id,
    });
    res.status(201).json(cattle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCattle = async (req, res) => {
  try {
    const cattle = await Cattle.findOneAndDelete({ _id: req.params.id, farmer: req.user.id });
    if (!cattle) return res.status(404).json({ message: 'Cattle not found' });
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
