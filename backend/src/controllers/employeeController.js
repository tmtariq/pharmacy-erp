import Employee from '../models/Employee.js';

export const getEmployees = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId || req.user?.pharmacy;
    const employees = await Employee.find({ pharmacy: pharmacyId }).sort({ createdAt: -1 });

    const totalStaff = employees.length;
    const activeStaff = employees.filter(e => e.isActive).length;
    const morningShift = employees.filter(e => e.shift === 'Morning').length;

    res.json({
      employees,
      stats: { totalStaff, activeStaff, morningShift }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch employees: ' + err.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId;
    if (!pharmacyId) {
      return res.status(403).json({ message: 'Pharmacy organization context required.' });
    }

    const { name, email, phone, role, shift, salary, branch } = req.body;

    const employee = await Employee.create({
      pharmacy: pharmacyId,
      branch: branch || req.branchId,
      name,
      email,
      phone,
      role,
      shift,
      salary: salary || 0
    });

    res.status(201).json({ message: 'Employee added successfully', employee });
  } catch (err) {
    res.status(400).json({ message: 'Failed to add employee: ' + err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacyId = req.pharmacyId;
    if (!pharmacyId) {
      return res.status(403).json({ message: 'Pharmacy organization context required.' });
    }

    const { name, email, phone, role, shift, salary, branch, isActive } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (shift !== undefined) updateData.shift = shift;
    if (salary !== undefined) updateData.salary = salary;
    if (branch !== undefined) updateData.branch = branch;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await Employee.findOneAndUpdate(
      { _id: id, pharmacy: pharmacyId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Employee record not found in this pharmacy organization.' });
    }

    res.json({ message: 'Employee updated', employee: updated });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update employee: ' + err.message });
  }
};
