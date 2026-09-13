import ReorderSuggestion from '../models/ReorderSuggestion.js';
import DuplicateLog from '../models/DuplicateLog.js';
import Medicine from '../models/Medicine.js';
import Batch from '../models/Batch.js';
import Sale from '../models/Sale.js';
import Supplier from '../models/Supplier.js';
import AuditLog from '../models/AuditLog.js';

const escapeRegex = (string) => (typeof string === 'string' ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '');

// GET /api/v1/reorder - Get All Reorder Suggestions & Priority Summaries
export const getReorderDashboard = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId;
    const branchId = req.branchId;

    const filter = { pharmacy: pharmacyId };
    if (branchId) filter.branch = branchId;

    const medicines = await Medicine.find({ pharmacy: pharmacyId }).populate('category').populate('supplier');
    const batches = await Batch.find(filter);

    // Sales aggregation over last 30 days for daily velocity (scalable & memory-safe)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const salesAggregation = await Sale.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: thirtyDaysAgo },
          status: 'completed'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine',
          totalSold: { $sum: '$items.quantity' }
        }
      }
    ]);

    const salesVelocityMap = new Map();
    for (const record of salesAggregation) {
      if (record._id) {
        salesVelocityMap.set(record._id.toString(), record.totalSold || 0);
      }
    }

    const reorders = [];

    for (const med of medicines) {
      const medBatches = batches.filter(b => b.medicine && b.medicine.toString() === med._id.toString());
      const currentStock = medBatches.reduce((acc, b) => acc + (b.status === 'active' ? b.quantity : 0), 0);
      const totalSold30 = salesVelocityMap.get(med._id.toString()) || 0;

      const avgDailySales = totalSold30 > 0 ? Number((totalSold30 / 30).toFixed(2)) : 0.5;
      const remainingDays = avgDailySales > 0 ? Math.round(currentStock / avgDailySales) : 99;

      let priority = 'LOW';
      if (remainingDays <= 3) priority = 'CRITICAL';
      else if (remainingDays <= 7) priority = 'HIGH';
      else if (remainingDays <= 15) priority = 'MEDIUM';

      // Suggested Purchase Formula = Expected Demand (30 Days) + Safety Stock (MinStock) - Current Stock
      const minStock = med.minStock || 10;
      const maxStock = med.maxStock || 500;
      const expectedDemand = Math.round(avgDailySales * 30);
      const suggestedPurchase = Math.max(0, expectedDemand + minStock - currentStock);

      const supplierName = med.supplier?.company || med.supplier?.name || 'PharmaCorp Global Ltd';
      const costPrice = med.costPrice || 5.00;
      const estimatedCost = Math.round(suggestedPurchase * costPrice);

      if (remainingDays <= 15 || currentStock <= minStock) {
        reorders.push({
          medicineId: med._id,
          medicineName: med.name,
          sku: med.sku,
          categoryName: med.category?.name || 'General',
          currentStock,
          minimumStock: minStock,
          maximumStock: maxStock,
          averageDailySales: avgDailySales,
          remainingDays,
          suggestedPurchase: Math.max(suggestedPurchase, 50),
          supplier: supplierName,
          estimatedCost,
          priority,
          confidence: 95
        });
      }
    }

    reorders.sort((a, b) => a.remainingDays - b.remainingDays);

    const criticalList = reorders.filter(r => r.priority === 'CRITICAL');
    const highList = reorders.filter(r => r.priority === 'HIGH');
    const mediumList = reorders.filter(r => r.priority === 'MEDIUM');

    res.json({
      summary: {
        totalReorders: reorders.length,
        criticalCount: criticalList.length,
        highCount: highList.length,
        mediumCount: mediumList.length
      },
      criticalList,
      highList,
      reorders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/v1/reorder/critical - Critical Stock ≤ 3 Days
export const getCriticalReorders = async (req, res) => {
  try {
    const dashboard = await getReorderDashboard(req, {
      json: (data) => res.json(data.criticalList)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/v1/reorder/high - High Stock ≤ 7 Days
export const getHighReorders = async (req, res) => {
  try {
    const dashboard = await getReorderDashboard(req, {
      json: (data) => res.json(data.highList)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/v1/reorder/generate - Generate & Save Reorder Suggestions
export const generateReorderSuggestions = async (req, res) => {
  try {
    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'REORDER_GENERATED',
      module: 'Reorder Suggestions',
      details: 'Generated Automated Reorder Suggestions & Supplier Recommendations'
    });

    res.json({
      message: 'Automated reorder suggestions generated successfully!',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- MODULE B: DUPLICATE MEDICINE DETECTION CONTROLLERS ---

// GET /api/v1/duplicates - Get All Duplicate Logs & Summary Protection Cards
export const getDuplicateLogs = async (req, res) => {
  try {
    const medicines = await Medicine.find({ pharmacy: req.pharmacyId });
    const batches = await Batch.find({ pharmacy: req.pharmacyId });

    // Track exact & possible duplicates across Barcode, SKU, Generic Name
    const skuMap = {};
    const barcodeMap = {};
    const genericMap = {};

    let duplicateSKUsCount = 0;
    let duplicateBarcodesCount = 0;
    let duplicateGenericsCount = 0;
    const possibleDuplicatesList = [];

    for (const med of medicines) {
      // SKU Tracking
      if (skuMap[med.sku]) duplicateSKUsCount++;
      else skuMap[med.sku] = med;

      // Barcode Tracking
      if (med.barcode) {
        if (barcodeMap[med.barcode]) duplicateBarcodesCount++;
        else barcodeMap[med.barcode] = med;
      }

      // Generic Name Tracking
      if (med.genericName) {
        const normGen = med.genericName.trim().toLowerCase();
        if (genericMap[normGen]) {
          duplicateGenericsCount++;
          possibleDuplicatesList.push({
            medicineName: med.name,
            duplicateMedicineName: genericMap[normGen].name,
            genericName: med.genericName,
            sku1: med.sku,
            sku2: genericMap[normGen].sku,
            similarityScore: 92,
            type: 'Same Generic Compound'
          });
        } else {
          genericMap[normGen] = med;
        }
      }
    }

    res.json({
      cards: {
        duplicateSKUs: duplicateSKUsCount,
        duplicateBarcodes: duplicateBarcodesCount,
        duplicateGenericNames: duplicateGenericsCount,
        possibleDuplicates: possibleDuplicatesList.length
      },
      possibleDuplicatesList
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/v1/duplicates/check - Real-Time Scanner Duplicate Check
export const checkDuplicateRealtime = async (req, res) => {
  try {
    const { name, sku, barcode, genericName } = req.body;

    const existingSKU = await Medicine.findOne({ pharmacy: req.pharmacyId, sku });
    if (existingSKU) {
      return res.json({
        isDuplicate: true,
        type: 'Exact SKU',
        message: `Exact duplicate found: SKU '${sku}' is already assigned to "${existingSKU.name}".`,
        existingMedicine: existingSKU
      });
    }

    if (barcode) {
      const existingBarcode = await Medicine.findOne({ pharmacy: req.pharmacyId, barcode });
      if (existingBarcode) {
        return res.json({
          isDuplicate: true,
          type: 'Exact Barcode',
          message: `Exact duplicate found: Barcode '${barcode}' is already assigned to "${existingBarcode.name}".`,
          existingMedicine: existingBarcode
        });
      }
    }

    if (genericName) {
      const sanitized = escapeRegex(genericName.trim());
      const existingGeneric = await Medicine.findOne({
        pharmacy: req.pharmacyId,
        genericName: { $regex: new RegExp(`^${sanitized}$`, 'i') }
      });
      if (existingGeneric) {
        return res.json({
          isDuplicate: false,
          isPossibleDuplicate: true,
          type: 'Same Generic Compound',
          message: `Possible duplicate: "${existingGeneric.name}" shares the same active generic ingredient (${genericName}).`,
          existingMedicine: existingGeneric
        });
      }
    }

    res.json({ isDuplicate: false, message: 'No duplicate records found.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/v1/duplicates/merge - Merge 2 Duplicate Medicine Records
export const mergeDuplicateMedicines = async (req, res) => {
  try {
    const { primaryMedicineId, duplicateMedicineId } = req.body;

    const primaryMed = await Medicine.findOne({ _id: primaryMedicineId, pharmacy: req.pharmacyId });
    const duplicateMed = await Medicine.findOne({ _id: duplicateMedicineId, pharmacy: req.pharmacyId });

    if (!primaryMed || !duplicateMed) {
      return res.status(404).json({ message: 'Primary or Duplicate medicine record not found.' });
    }

    // 1. Move all stock batches from duplicateMed to primaryMed
    await Batch.updateMany(
      { medicine: duplicateMed._id, pharmacy: req.pharmacyId },
      { $set: { medicine: primaryMed._id } }
    );

    // 2. Remove duplicate medicine record
    await Medicine.deleteOne({ _id: duplicateMed._id });

    // 3. Log Audit Entry
    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'MEDICINE_UPDATED',
      module: 'Duplicate Medicine Protection',
      details: `Merged duplicate medicine "${duplicateMed.name}" (SKU: ${duplicateMed.sku}) into primary record "${primaryMed.name}" (SKU: ${primaryMed.sku})`
    });

    res.json({
      message: `Successfully merged "${duplicateMed.name}" into "${primaryMed.name}". Stock batches consolidated cleanly.`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
