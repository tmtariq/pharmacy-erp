import Sale from '../models/Sale.js';
import Batch from '../models/Batch.js';
import Medicine from '../models/Medicine.js';
import Branch from '../models/Branch.js';
import Supplier from '../models/Supplier.js';
import Customer from '../models/Customer.js';
import Category from '../models/Category.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import Prescription from '../models/Prescription.js';
import StockTransfer from '../models/StockTransfer.js';
import CashRegister from '../models/CashRegister.js';
import RefundRequest from '../models/RefundRequest.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId;
    const branchId = req.branchId;

    const baseFilter = { pharmacy: pharmacyId };
    const branchFilter = { pharmacy: pharmacyId };
    if (branchId) branchFilter.branch = branchId;

    // --- 1. Real-time KPIs ---
    const totalMedicines = await Medicine.countDocuments(baseFilter);
    const activeMedicines = await Medicine.countDocuments({ ...baseFilter, status: 'active' });

    // Batches & Medicines for Stock Calculations
    const allMedicines = await Medicine.find(baseFilter).populate('category');
    const allBatches = await Batch.find(branchFilter);

    // Attach stock qty to medicines
    const medicineStockMap = allMedicines.map(med => {
      const medBatches = allBatches.filter(b => b.medicine.toString() === med._id.toString());
      const totalStock = medBatches.reduce((acc, b) => acc + (b.status === 'active' ? b.quantity : 0), 0);
      return {
        ...med.toObject(),
        stockQty: totalStock
      };
    });

    const lowStockCount = medicineStockMap.filter(m => m.stockQty > 0 && m.stockQty <= (m.reorderLevel || 10)).length;
    const outOfStockCount = medicineStockMap.filter(m => m.stockQty === 0).length;

    // Expiry KPIs
    const now = new Date();
    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

    const expiredMedicinesCount = allBatches.filter(b => b.quantity > 0 && new Date(b.expiryDate) < now).length;
    const expiringSoonCount = allBatches.filter(
      b => b.quantity > 0 && new Date(b.expiryDate) >= now && new Date(b.expiryDate) <= sixtyDaysLater
    ).length;

    // Sales & Revenue & Profit KPIs
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const salesTodayList = await Sale.find({
      ...branchFilter,
      createdAt: { $gte: startOfToday },
      status: 'completed'
    });
    const todaySales = salesTodayList.reduce((acc, s) => acc + s.grandTotal, 0);

    const salesMonthList = await Sale.find({
      ...branchFilter,
      createdAt: { $gte: startOfMonth },
      status: 'completed'
    });
    const monthlySales = salesMonthList.reduce((acc, s) => acc + s.grandTotal, 0);

    // Calculate Net Profit across all sales
    const allCompletedSales = await Sale.find({ ...branchFilter, status: 'completed' });
    let totalRevenue = 0;
    let totalCost = 0;

    for (const sale of allCompletedSales) {
      totalRevenue += sale.grandTotal;
      for (const item of sale.items) {
        // Approximate cost if available or batch cost
        const itemCost = (item.unitPrice * 0.6) * item.quantity; // 40% margin estimate or batch cost
        totalCost += itemCost;
      }
    }
    const totalProfit = Math.max(0, totalRevenue - totalCost);

    // Pending Payments & Supplier Dues
    const customers = await Customer.find(baseFilter);
    const pendingPayments = customers.reduce((acc, c) => acc + (c.creditBalance || 0), 0);

    const suppliers = await Supplier.find(baseFilter);
    const supplierDues = suppliers.reduce((acc, s) => acc + (s.balancePayable || 0), 0);

    // Recent Activities (Audit Stream) - Fetch 50 entries for scrollbar stream
    const recentActivities = await AuditLog.find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(50);

    // Branch Comparison
    const branches = await Branch.find(baseFilter);
    const branchComparison = [];
    for (const br of branches) {
      const brSales = await Sale.find({ pharmacy: pharmacyId, branch: br._id, status: 'completed' });
      const rev = brSales.reduce((acc, s) => acc + s.grandTotal, 0);
      branchComparison.push({
        branchName: br.name,
        branchCode: br.code,
        salesCount: brSales.length,
        totalRevenue: rev
      });
    }

    // Top Selling & Least Selling Medicines
    const medicineSalesCounter = {};
    for (const sale of allCompletedSales) {
      for (const item of sale.items) {
        const medName = item.medicineName || 'Unknown';
        medicineSalesCounter[medName] = (medicineSalesCounter[medName] || 0) + item.quantity;
      }
    }

    const sortedMedSales = Object.entries(medicineSalesCounter)
      .map(([name, qty]) => ({ name, quantitySold: qty }))
      .sort((a, b) => b.quantitySold - a.quantitySold);

    const topSellingMedicines = sortedMedSales.slice(0, 5);

    // Combine all medicines for least selling
    const allMedNames = medicineStockMap.map(m => m.name);
    const leastSellingMap = allMedNames.map(name => ({
      name,
      quantitySold: medicineSalesCounter[name] || 0
    })).sort((a, b) => a.quantitySold - b.quantitySold);

    const leastSellingMedicines = leastSellingMap.slice(0, 5);

    // --- 2. Chart Data Generation ---

    // Daily Sales (Last 7 Days)
    const dailySalesChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const daySales = allCompletedSales.filter(s => s.createdAt >= dayStart && s.createdAt <= dayEnd);
      const rev = daySales.reduce((acc, s) => acc + s.grandTotal, 0);
      const prof = rev * 0.35; // 35% net profit margin

      const dayName = dayStart.toLocaleDateString('en-US', { weekday: 'short' });
      dailySalesChart.push({
        day: dayName,
        date: dayStart.toISOString().slice(5, 10),
        salesCount: daySales.length,
        revenue: Math.round(rev),
        profit: Math.round(prof)
      });
    }

    // Monthly Sales (Last 6 Months)
    const monthlySalesChart = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const mSales = allCompletedSales.filter(s => s.createdAt >= monthStart && s.createdAt <= monthEnd);
      const rev = mSales.reduce((acc, s) => acc + s.grandTotal, 0);
      const prof = rev * 0.35;

      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });
      monthlySalesChart.push({
        month: monthName,
        revenue: Math.round(rev),
        profit: Math.round(prof),
        count: mSales.length
      });
    }

    // Stock Trends / Status Breakdown
    const healthyStockCount = Math.max(0, activeMedicines - lowStockCount - outOfStockCount);
    const stockTrendsChart = [
      { status: 'Healthy Stock', count: healthyStockCount, color: '#10B981' },
      { status: 'Low Stock Alert', count: lowStockCount, color: '#F59E0B' },
      { status: 'Out of Stock', count: outOfStockCount, color: '#EF4444' },
      { status: 'Expired Batches', count: expiredMedicinesCount, color: '#8B5CF6' }
    ];

    // Category Distribution
    const categoriesMap = {};
    for (const med of medicineStockMap) {
      const catName = med.category?.name || 'General';
      categoriesMap[catName] = (categoriesMap[catName] || 0) + 1;
    }

    const categoryDistributionChart = Object.entries(categoriesMap).map(([category, count]) => ({
      category,
      count
    }));

    res.json({
      // KPIs
      totalMedicines,
      activeMedicines,
      lowStockCount,
      outOfStockCount,
      expiredMedicinesCount,
      expiringSoonCount,
      todaySales,
      monthlySales,
      totalProfit,
      pendingPayments,
      supplierDues,

      // Activity Stream & Branch Comparison
      recentActivities,
      branchComparison,
      topSellingMedicines,
      leastSellingMedicines,

      // Chart Datasets
      dailySalesChart,
      monthlySalesChart,
      stockTrendsChart,
      categoryDistributionChart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ pharmacy: req.pharmacyId })
      .populate('branch', 'name code')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOwnerDashboard = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId;
    const baseFilter = { pharmacy: pharmacyId };

    // Entity counts
    const [staffCount, supplierCount, customerCount, branchCount] = await Promise.all([
      User.countDocuments({ ...baseFilter, role: { $ne: 'SuperAdmin' } }),
      Supplier.countDocuments(baseFilter),
      Customer.countDocuments(baseFilter),
      Branch.countDocuments(baseFilter)
    ]);

    // Total stock value from active batches
    const activeBatches = await Batch.find({ ...baseFilter, status: 'active', quantity: { $gt: 0 } });
    const totalStockValue = activeBatches.reduce((sum, b) => sum + (b.quantity * (b.sellingPrice || 0)), 0);

    // Total purchases amount
    const allPurchases = await Purchase.find({ ...baseFilter, status: { $in: ['received', 'partially_received'] } });
    const totalPurchases = allPurchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0);

    // Recent sales (last 10)
    const recentSales = await Sale.find({ ...baseFilter, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'name phone')
      .lean();

    // Staff activity (last 20 audit logs)
    const staffActivity = await AuditLog.find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Branch comparison
    const branches = await Branch.find(baseFilter);
    const branchComparison = [];
    for (const br of branches) {
      const brSales = await Sale.find({ pharmacy: pharmacyId, branch: br._id, status: 'completed' });
      const rev = brSales.reduce((acc, s) => acc + s.grandTotal, 0);
      branchComparison.push({
        branchName: br.name,
        branchCode: br.code,
        salesCount: brSales.length,
        totalRevenue: rev
      });
    }

    // Pending payments from customers
    const customers = await Customer.find(baseFilter);
    const pendingPayments = customers.reduce((acc, c) => acc + (c.creditBalance || 0), 0);

    // Supplier dues
    const suppliers = await Supplier.find(baseFilter);
    const supplierDues = suppliers.reduce((acc, s) => acc + (s.balancePayable || 0), 0);

    res.json({
      staffCount,
      supplierCount,
      customerCount,
      branchCount,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      totalPurchases: Math.round(totalPurchases * 100) / 100,
      pendingPayments: Math.round(pendingPayments * 100) / 100,
      supplierDues: Math.round(supplierDues * 100) / 100,
      recentSales,
      staffActivity,
      branchComparison
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPharmacistDashboard = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId;
    const branchId = req.branchId;

    const baseFilter = { pharmacy: pharmacyId };
    const branchFilter = { pharmacy: pharmacyId };
    if (branchId) branchFilter.branch = branchId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Prescriptions Statistics
    const [todayPrescriptionsCount, pendingPrescriptionsCount, dispensedTodayCount] = await Promise.all([
      Prescription.countDocuments({ ...branchFilter, createdAt: { $gte: startOfToday } }),
      Prescription.countDocuments({ ...branchFilter, status: { $in: ['pending', 'ocr_completed', 'under_review', 'clarification_requested'] } }),
      Prescription.countDocuments({ ...branchFilter, status: { $in: ['approved', 'fulfilled'] }, updatedAt: { $gte: startOfToday } })
    ]);

    // 2. Inventory Alerts (Low Stock & Expiring within 60 days)
    const allMedicines = await Medicine.find(baseFilter).select('_id name reorderLevel category dosageForm strength');
    const allBatches = await Batch.find(branchFilter);

    const now = new Date();
    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

    let lowStockCount = 0;
    const medicineStockMap = allMedicines.map(med => {
      const medBatches = allBatches.filter(b => b.medicine.toString() === med._id.toString());
      const stock = medBatches.reduce((acc, b) => acc + (b.status === 'active' ? b.quantity : 0), 0);
      if (stock > 0 && stock <= (med.reorderLevel || 10)) {
        lowStockCount++;
      }
      return { ...med.toObject(), stock };
    });

    const expiringBatches = allBatches.filter(
      b => b.quantity > 0 && new Date(b.expiryDate) >= now && new Date(b.expiryDate) <= sixtyDaysLater
    );
    const expiredBatches = allBatches.filter(b => b.quantity > 0 && new Date(b.expiryDate) < now);

    // 3. Drug Interaction & Safety Alerts
    const recentPrescriptionsWithAlerts = await Prescription.find({
      ...branchFilter,
      'drugInteractionAlerts.0': { $exists: true }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('patientName doctorName drugInteractionAlerts status createdAt');

    // 4. Recent Sales & Dispensing Stream
    const recentSales = await Sale.find({ ...branchFilter, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'name phone')
      .lean();

    // 5. Recent Prescriptions List
    const recentPrescriptions = await Prescription.find(branchFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('patient', 'name phone')
      .lean();

    res.json({
      todayPrescriptionsCount,
      pendingPrescriptionsCount,
      dispensedTodayCount,
      lowStockCount,
      expiringCount: expiringBatches.length,
      expiredCount: expiredBatches.length,
      recentAlerts: recentPrescriptionsWithAlerts,
      recentSales,
      recentPrescriptions,
      topLowStock: medicineStockMap.filter(m => m.stock <= (m.reorderLevel || 10)).slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryDashboard = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId;
    const branchId = req.branchId;

    const baseFilter = { pharmacy: pharmacyId };
    const branchFilter = { pharmacy: pharmacyId };
    if (branchId) branchFilter.branch = branchId;

    // 1. Batches & Stock Calculations
    const allMedicines = await Medicine.find(baseFilter).select('_id name reorderLevel category dosageForm strength sku');
    const allBatches = await Batch.find(branchFilter);

    const now = new Date();
    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

    let totalStockUnits = 0;
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const medicineStockList = allMedicines.map(med => {
      const medBatches = allBatches.filter(b => b.medicine.toString() === med._id.toString());
      const stock = medBatches.reduce((acc, b) => acc + (b.status === 'active' ? b.quantity : 0), 0);
      const val = medBatches.reduce((acc, b) => acc + (b.status === 'active' ? b.quantity * (b.sellingPrice || 0) : 0), 0);
      
      totalStockUnits += stock;
      totalStockValue += val;

      if (stock === 0) outOfStockCount++;
      else if (stock <= (med.reorderLevel || 10)) lowStockCount++;

      return { ...med.toObject(), stock, stockValue: val };
    });

    const expiringBatches = allBatches.filter(
      b => b.quantity > 0 && new Date(b.expiryDate) >= now && new Date(b.expiryDate) <= sixtyDaysLater
    );
    const expiredBatches = allBatches.filter(b => b.quantity > 0 && new Date(b.expiryDate) < now);

    // 2. Pending Purchases & POs
    const [pendingPurchasesCount, recentPurchases] = await Promise.all([
      Purchase.countDocuments({ ...branchFilter, status: { $in: ['pending', 'partially_received'] } }),
      Purchase.find(branchFilter).sort({ createdAt: -1 }).limit(10).populate('supplier', 'name').lean()
    ]);

    // 3. Stock Transfers & Movements
    const transferFilter = { pharmacy: pharmacyId };
    if (branchId) {
      transferFilter.$or = [{ fromBranch: branchId }, { toBranch: branchId }];
    }
    const [pendingTransfersCount, recentTransfers] = await Promise.all([
      StockTransfer.countDocuments({ ...transferFilter, status: 'pending' }),
      StockTransfer.find(transferFilter)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('fromBranch', 'name code')
        .populate('toBranch', 'name code')
        .lean()
    ]);

    // 4. Stock Audit Logs (Movement History)
    const recentMovements = await AuditLog.find({
      pharmacy: pharmacyId,
      module: { $in: ['Inventory', 'Stock Transfers', 'Purchases', 'FEFO Expiry'] }
    })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    res.json({
      totalMedicines: allMedicines.length,
      totalStockUnits,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      lowStockCount,
      outOfStockCount,
      expiringCount: expiringBatches.length,
      expiredCount: expiredBatches.length,
      pendingPurchasesCount,
      pendingTransfersCount,
      recentPurchases,
      recentTransfers,
      recentMovements,
      topLowStock: medicineStockList.filter(m => m.stock <= (m.reorderLevel || 10)).slice(0, 8),
      expiringBatches: expiringBatches.slice(0, 8)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalesStaffDashboard = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId;
    const branchId = req.branchId;

    const baseFilter = { pharmacy: pharmacyId };
    const branchFilter = { pharmacy: pharmacyId };
    if (branchId) branchFilter.branch = branchId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Today's Sales for Cashier / Branch
    const [salesTodayList, pendingPrescriptionsCount, recentCustomersList] = await Promise.all([
      Sale.find({
        ...branchFilter,
        createdAt: { $gte: startOfToday },
        status: 'completed'
      }).populate('customer', 'name phone'),
      Prescription.countDocuments({
        ...branchFilter,
        status: { $in: ['approved', 'under_review', 'pending'] }
      }),
      Customer.find(baseFilter).sort({ createdAt: -1 }).limit(8).lean()
    ]);

    const todaySalesRevenue = salesTodayList.reduce((acc, s) => acc + (s.grandTotal || 0), 0);
    const todayTransactionsCount = salesTodayList.length;

    // 2. Active Available Stock & Batch Summary (Read-Only)
    const activeBatches = await Batch.find({
      ...branchFilter,
      status: 'active',
      quantity: { $gt: 0 }
    });
    const totalAvailableStockUnits = activeBatches.reduce((acc, b) => acc + b.quantity, 0);

    // 3. Recent Sales Stream (Last 10)
    const recentSales = await Sale.find({ ...branchFilter, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'name phone')
      .lean();

    res.json({
      todaySalesRevenue: Math.round(todaySalesRevenue * 100) / 100,
      todayTransactionsCount,
      pendingOrdersCount: pendingPrescriptionsCount,
      totalAvailableStockUnits,
      salesTarget: 1500, // Configurable daily branch sales target
      recentCustomers: recentCustomersList,
      recentSales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCashierDashboard = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId;
    const branchId = req.branchId;
    const cashierId = req.userFull?._id || req.user?.id || req.user?._id;

    const branchFilter = { pharmacy: pharmacyId };
    if (branchId) branchFilter.branch = branchId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Today's Transactions & Payment Method Breakdown
    const todaySales = await Sale.find({
      ...branchFilter,
      createdAt: { $gte: startOfToday },
      status: 'completed'
    }).populate('customer', 'name phone');

    let cashReceived = 0;
    let cardPayments = 0;
    let digitalPayments = 0;
    let otherPayments = 0;
    let totalRevenue = 0;

    todaySales.forEach((sale) => {
      const amount = sale.grandTotal || 0;
      totalRevenue += amount;
      const method = (sale.paymentMethod || 'cash').toLowerCase();
      if (method === 'cash') cashReceived += amount;
      else if (method === 'card') cardPayments += amount;
      else if (['jazzcash', 'easypaisa', 'bank_transfer'].includes(method)) digitalPayments += amount;
      else otherPayments += amount;
    });

    // 2. Active Cash Register Session for Current Shift
    const activeRegister = await CashRegister.findOne({
      pharmacy: pharmacyId,
      branch: branchId,
      cashier: cashierId,
      status: 'open'
    }).sort({ createdAt: -1 });

    // 3. Pending & Approved Refund Requests
    const [pendingRefundsCount, recentRefunds] = await Promise.all([
      RefundRequest.countDocuments({ ...branchFilter, status: 'pending_approval' }),
      RefundRequest.find(branchFilter).sort({ createdAt: -1 }).limit(10).lean()
    ]);

    res.json({
      todayTransactionsCount: todaySales.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      cashReceived: Math.round(cashReceived * 100) / 100,
      cardPayments: Math.round(cardPayments * 100) / 100,
      digitalPayments: Math.round(digitalPayments * 100) / 100,
      otherPayments: Math.round(otherPayments * 100) / 100,
      activeRegister: activeRegister || {
        status: 'closed',
        openingBalance: 0,
        cashierName: req.userFull?.name || 'Cashier',
        openedAt: null
      },
      pendingRefundsCount,
      recentRefunds,
      recentTransactions: todaySales.slice(0, 12).map((s) => ({
        invoiceNumber: s.invoiceNumber,
        customerName: s.customer?.name || s.patientName || 'Walk-in Customer',
        grandTotal: s.grandTotal,
        paymentMethod: s.paymentMethod,
        time: s.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
