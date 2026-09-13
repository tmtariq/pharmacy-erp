import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ pharmacy: req.pharmacyId }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const ALLOWED_CUSTOMER_FIELDS = [
  'name', 'profilePhoto', 'phone', 'email', 'address', 'city', 'country',
  'dateOfBirth', 'gender', 'emergencyContact', 'allergies', 'medicalNotes',
  'savedAddresses', 'medicineReminders'
];

const filterCustomerBody = (body) => {
  const filtered = {};
  for (const field of ALLOWED_CUSTOMER_FIELDS) {
    if (body[field] !== undefined) {
      filtered[field] = body[field];
    }
  }
  return filtered;
};

export const createCustomer = async (req, res) => {
  try {
    const payload = filterCustomerBody(req.body || {});
    const customer = await Customer.create({
      ...payload,
      pharmacy: req.pharmacyId
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const payload = filterCustomerBody(req.body || {});
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, pharmacy: req.pharmacyId },
      { $set: payload },
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, pharmacy: req.pharmacyId });
    if (!customer) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.json({ message: 'Patient profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomerHistory = async (req, res) => {
  try {
    const sales = await Sale.find({ pharmacy: req.pharmacyId, customer: req.params.id })
      .populate('branch', 'name code')
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
