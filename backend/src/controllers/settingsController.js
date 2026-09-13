import Settings from '../models/Settings.js';

export const getSettings = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId;
    if (!pharmacyId) {
      return res.status(403).json({ message: 'Pharmacy organization context required.' });
    }

    let settings = await Settings.findOne({ pharmacy: pharmacyId });

    if (!settings) {
      settings = await Settings.create({ pharmacy: pharmacyId });
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch settings: ' + err.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId;
    if (!pharmacyId) {
      return res.status(403).json({ message: 'Pharmacy organization context required.' });
    }

    const settings = await Settings.findOneAndUpdate(
      { pharmacy: pharmacyId },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ message: 'System settings updated successfully', settings });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update settings: ' + err.message });
  }
};
