import Category from '../models/Category.js';
import Supplier from '../models/Supplier.js';
import Medicine from '../models/Medicine.js';
import Batch from '../models/Batch.js';
import AuditLog from '../models/AuditLog.js';

// --- Categories ---
export const getCategories = async (req, res) => {
  try {
    let categories = await Category.find({ pharmacy: req.pharmacyId }).sort({ name: 1 });
    if (!categories || categories.length === 0) {
      const defaultCatNames = [
        'Tablets & Oral Solid Dosage',
        'Capsules & Softgels',
        'Syrups, Liquids & Suspensions',
        'Injections, IV Solutions & Ampoules',
        'Eye, Ear & Nasal Drops',
        'Creams, Ointments & Topical Gels',
        'Antibiotics & Anti-Infectives',
        'Cardiovascular & Anti-Hypertensive',
        'Diabetes & Endocrine Care',
        'Pain Relief & Anti-Inflammatory',
        'Vitamins, Minerals & Health Supplements',
        'Pediatric & Baby Healthcare',
        'Surgical Items & First Aid Dressings',
        'Medical Devices, Meters & Equipment',
        'Respiratory & Asthma Inhalers',
        'Personal Hygiene & Dermatology'
      ];
      categories = await Promise.all(
        defaultCatNames.map(name => Category.create({ name, pharmacy: req.pharmacyId }))
      );
    }
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create({
      ...req.body,
      pharmacy: req.pharmacyId
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- Suppliers ---
export const getSuppliers = async (req, res) => {
  try {
    let suppliers = await Supplier.find({ pharmacy: req.pharmacyId }).sort({ name: 1 });
    if (!suppliers || suppliers.length === 0) {
      const defaultSuppliers = [
        { company: 'Global Pharma Corp', name: 'Alex Rivera', email: 'orders@pharmacorp.com', phone: '+1 800 555 0190' },
        { company: 'MedCare Wholesalers', name: 'Distribution Dept', email: 'supply@medcare.com', phone: '+1 800 555 0191' },
        { company: 'Sun Pharma Distribution', name: 'Regional Agent', email: 'contact@sunpharma.com', phone: '+1 800 555 0192' }
      ];
      suppliers = await Promise.all(
        defaultSuppliers.map(s => Supplier.create({ ...s, pharmacy: req.pharmacyId }))
      );
    }
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create({
      ...req.body,
      pharmacy: req.pharmacyId
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- Medicines ---
export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ pharmacy: req.pharmacyId })
      .populate('category')
      .populate('supplier')
      .sort({ name: 1 });

    const branchFilter = req.branchId ? { pharmacy: req.pharmacyId, branch: req.branchId } : { pharmacy: req.pharmacyId };
    const batches = await Batch.find(branchFilter).populate('supplier');

    const medicineMap = medicines.map(med => {
      const medBatches = batches.filter(b => b.medicine.toString() === med._id.toString());
      const totalStock = medBatches.reduce((acc, b) => acc + (b.status === 'active' ? b.quantity : 0), 0);
      return {
        ...med.toObject(),
        stockQty: totalStock,
        activeBatchesCount: medBatches.filter(b => b.status === 'active' && b.quantity > 0).length,
        batches: medBatches
      };
    });

    res.json(medicineMap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const existing = await Medicine.findOne({ pharmacy: req.pharmacyId, sku: req.body.sku });
    if (existing) {
      return res.status(400).json({ message: `SKU '${req.body.sku}' already exists in your inventory.` });
    }

    const skuCode = req.body.sku || `MED-${Date.now().toString().slice(-6)}`;
    const barcodeData = req.body.barcode || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const qrData = req.body.qrCodeData || JSON.stringify({
      sku: skuCode,
      name: req.body.name,
      rx: req.body.rxRequired || false,
      mfg: req.body.manufacturer || 'PharmaCorp'
    });

    const medicine = await Medicine.create({
      ...req.body,
      sku: skuCode,
      barcode: barcodeData,
      qrCodeData: qrData,
      pharmacy: req.pharmacyId
    });

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'MEDICINE_CREATED',
      module: 'Medicine Management',
      details: `Added new medicine "${medicine.name}" (SKU: ${medicine.sku}, Barcode: ${medicine.barcode})`
    });

    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, pharmacy: req.pharmacyId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'MEDICINE_UPDATED',
      module: 'Medicine Management',
      details: `Updated medicine "${medicine.name}" (SKU: ${medicine.sku})`
    });

    res.json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, pharmacy: req.pharmacyId },
      { $set: { status: 'inactive' } },
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

    // Deactivate active batches rather than hard-deleting to preserve historical audit traceability
    await Batch.updateMany(
      { medicine: req.params.id, pharmacy: req.pharmacyId, status: 'active' },
      { $set: { status: 'exhausted' } }
    );

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'MEDICINE_ARCHIVED',
      module: 'Medicine Management',
      details: `Archived medicine "${medicine.name}" (SKU: ${medicine.sku}) to maintain GxP audit trail`
    });

    res.json({ message: 'Medicine archived successfully to maintain clinical audit compliance.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Batches (FEFO Inventory) ---
export const getBatches = async (req, res) => {
  try {
    const query = { pharmacy: req.pharmacyId };
    if (req.branchId) query.branch = req.branchId;
    if (req.query.medicineId) query.medicine = req.query.medicineId;

    const batches = await Batch.find(query)
      .populate({ path: 'medicine', populate: ['category', 'supplier'] })
      .populate('supplier')
      .populate('branch')
      .sort({ expiryDate: 1 });

    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addBatch = async (req, res) => {
  const { medicineId, batchNumber, manufacturingDate, expiryDate, costPrice, sellingPrice, mrp, discount, quantity, rackNumber, supplierId, branchId } = req.body;

  try {
    const targetBranch = branchId || req.branchId;
    const barcode = req.body.barcode || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const batch = await Batch.create({
      medicine: medicineId,
      pharmacy: req.pharmacyId,
      branch: targetBranch,
      supplier: supplierId || null,
      batchNumber,
      manufacturingDate: manufacturingDate || null,
      expiryDate,
      costPrice: costPrice || 0,
      sellingPrice: sellingPrice || 0,
      mrp: mrp || sellingPrice || 0,
      discount: discount || 0,
      quantity,
      rackNumber: rackNumber || '',
      barcode
    });

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: targetBranch,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'BATCH_ADDED',
      module: 'Medicine Management',
      details: `Added Batch ${batchNumber} (${quantity} units, Exp: ${new Date(expiryDate).toLocaleDateString()})`
    });

    res.status(201).json(batch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findOneAndUpdate(
      { _id: req.params.id, pharmacy: req.pharmacyId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'BATCH_UPDATED',
      module: 'Medicine Management',
      details: `Updated Batch "${batch.batchNumber}" (Qty: ${batch.quantity}, Price: $${batch.sellingPrice})`
    });

    res.json(batch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findOneAndDelete({ _id: req.params.id, pharmacy: req.pharmacyId });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'BATCH_DELETED',
      module: 'Medicine Management',
      details: `Deleted Batch "${batch.batchNumber}"`
    });

    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
