import crypto from 'crypto';
import Sale from '../models/Sale.js';
import Batch from '../models/Batch.js';
import Medicine from '../models/Medicine.js';
import Customer from '../models/Customer.js';
import AuditLog from '../models/AuditLog.js';
import CashRegister from '../models/CashRegister.js';
import RefundRequest from '../models/RefundRequest.js';

export const processSale = async (req, res) => {
  const {
    customerPhone, patientName, patientPhone, doctorName, prescriptionNumber,
    prescriptionDocumentUrl, items, discountAmount, taxAmount, paymentMethod,
    redeemLoyaltyPoints
  } = req.body;

  const appliedDeductions = [];

  try {
    const pharmacyId = req.pharmacyId;
    const branchId = req.branchId;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart items cannot be empty' });
    }

    // 1. Process Customer (or Walk-in) & Loyalty Points
    let customer = null;
    if (customerPhone) {
      customer = await Customer.findOne({ pharmacy: pharmacyId, phone: customerPhone });
      if (!customer && patientName) {
        customer = await Customer.create({
          pharmacy: pharmacyId,
          name: patientName,
          phone: customerPhone
        });
      }
    }

    const saleItems = [];
    let calculatedSubtotal = 0;
    const now = new Date();

    // 2. FEFO Batch Stock Allocation Loop (HARD LOCK EXCLUSION OF EXPIRED BATCHES!)
    for (const cartItem of items) {
      let remainingQtyToDeduct = cartItem.quantity;

      const activeBatches = await Batch.find({
        pharmacy: pharmacyId,
        branch: branchId,
        medicine: cartItem.medicineId,
        status: 'active',
        quantity: { $gt: 0 },
        expiryDate: { $gt: now } // HARD LOCK: Prevents sale of expired medicines!
      }).sort({ expiryDate: 1 }); // FEFO Sort

      const totalAvailable = activeBatches.reduce((acc, b) => acc + b.quantity, 0);
      if (totalAvailable < cartItem.quantity) {
        const med = await Medicine.findById(cartItem.medicineId);
        throw new Error(`Insufficient unexpired stock for "${med?.name || 'Item'}". Requested: ${cartItem.quantity}, Available: ${totalAvailable}`);
      }

      for (const batch of activeBatches) {
        if (remainingQtyToDeduct <= 0) break;

        const deductQty = Math.min(batch.quantity, remainingQtyToDeduct);

        // Atomic conditional decrement to prevent race conditions
        const updatedBatch = await Batch.findOneAndUpdate(
          {
            _id: batch._id,
            pharmacy: pharmacyId,
            branch: branchId,
            quantity: { $gte: deductQty }
          },
          {
            $inc: { quantity: -deductQty }
          },
          { new: true }
        );

        if (!updatedBatch) {
          throw new Error(`Concurrent stock contention for batch ${batch.batchNumber}. Please refresh and retry checkout.`);
        }

        appliedDeductions.push({ batchId: batch._id, quantity: deductQty });

        if (updatedBatch.quantity === 0) {
          await Batch.updateOne({ _id: batch._id }, { $set: { status: 'exhausted' } });
        }

        const itemSubtotal = deductQty * cartItem.unitPrice;
        calculatedSubtotal += itemSubtotal;

        saleItems.push({
          medicine: cartItem.medicineId,
          medicineName: cartItem.name,
          batch: batch._id,
          batchNumber: batch.batchNumber,
          quantity: deductQty,
          unitPrice: cartItem.unitPrice,
          discount: cartItem.discount || 0,
          taxRate: cartItem.taxRate || 0,
          total: itemSubtotal
        });

        remainingQtyToDeduct -= deductQty;
      }
    }

    // 3. Financial Totals & Loyalty Points Calculation
    const disc = Number(discountAmount) || 0;
    const tax = Number(taxAmount) || 0;
    let grandTotal = Math.max(0, calculatedSubtotal - disc + tax);

    let pointsEarned = 0;
    let pointsRedeemed = 0;

    if (customer) {
      if (redeemLoyaltyPoints && customer.loyaltyPoints >= 10) {
        pointsRedeemed = Math.min(customer.loyaltyPoints, Math.floor(grandTotal * 10));
        const pointDiscount = pointsRedeemed / 10;
        grandTotal = Math.max(0, grandTotal - pointDiscount);
        customer.loyaltyPoints -= pointsRedeemed;
      }

      pointsEarned = Math.floor(grandTotal / 10);
      customer.loyaltyPoints += pointsEarned;

      if (paymentMethod === 'credit_account') {
        customer.creditBalance += grandTotal;
      }

      await customer.save();
    }

    // High-Entropy Collision-Resistant Invoice Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomEntropy = crypto.randomBytes(3).toString('hex').toUpperCase();
    const invoiceNumber = `INV-${dateStr}-${randomEntropy}`;

    const qrPayload = JSON.stringify({
      inv: invoiceNumber,
      total: grandTotal.toFixed(2),
      date: new Date().toISOString(),
      branch: branchId
    });

    const newSale = await Sale.create({
      invoiceNumber,
      pharmacy: pharmacyId,
      branch: branchId,
      cashier: req.userFull._id,
      customer: customer?._id || null,
      patientName: patientName || 'Walk-in Customer',
      patientPhone: patientPhone || customerPhone || '',
      doctorName: doctorName || '',
      prescriptionNumber: prescriptionNumber || '',
      prescriptionDocumentUrl: prescriptionDocumentUrl || '',
      items: saleItems,
      subtotal: calculatedSubtotal,
      discountAmount: disc,
      taxAmount: tax,
      loyaltyPointsEarned: pointsEarned,
      loyaltyPointsRedeemed: pointsRedeemed,
      grandTotal,
      paymentMethod: paymentMethod || 'cash',
      status: 'completed',
      qrVerificationData: qrPayload
    });

    await AuditLog.create({
      pharmacy: pharmacyId,
      branch: branchId,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'POS_SALE_COMPLETED',
      module: 'POS Billing',
      details: `Completed Invoice ${invoiceNumber} ($${grandTotal.toFixed(2)}) via ${paymentMethod.toUpperCase()}`
    });

    res.status(201).json({
      message: 'Sale completed successfully',
      sale: newSale
    });
  } catch (error) {
    // Rollback any batches decremented before failure
    for (const deduction of appliedDeductions) {
      try {
        await Batch.updateOne(
          { _id: deduction.batchId },
          { $inc: { quantity: deduction.quantity }, $set: { status: 'active' } }
        );
      } catch (rollbackErr) {
        console.error(`Rollback failure on batch ${deduction.batchId}:`, rollbackErr.message);
      }
    }
    res.status(400).json({ message: error.message });
  }
};

export const getSalesHistory = async (req, res) => {
  try {
    const query = { pharmacy: req.pharmacyId };
    if (req.branchId) query.branch = req.branchId;

    const sales = await Sale.find(query)
      .populate('cashier', 'name')
      .populate('customer')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findOne({ _id: req.params.id, pharmacy: req.pharmacyId })
      .populate('cashier', 'name')
      .populate('customer');

    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkout = processSale;
export const getSales = getSalesHistory;

// ==================== CASH REGISTER CONTROLLERS ====================

export const openCashRegister = async (req, res) => {
  try {
    const { openingBalance, notes } = req.body;
    const cashierId = req.userFull?._id || req.user?.id || req.user?._id;

    // Check if already open
    const existing = await CashRegister.findOne({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      cashier: cashierId,
      status: 'open'
    });

    if (existing) {
      return res.status(400).json({ message: 'A cash register session is already open for your shift', register: existing });
    }

    const register = await CashRegister.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      cashier: cashierId,
      cashierName: req.userFull?.name || 'Cashier',
      openingBalance: Number(openingBalance) || 0,
      notes: notes || ''
    });

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: cashierId,
      userName: req.userFull?.name || 'Cashier',
      action: 'CASH_REGISTER_OPENED',
      module: 'POS Billing',
      details: `Opened shift cash register with $${Number(openingBalance || 0).toFixed(2)}`
    });

    res.status(201).json({ message: 'Cash register opened successfully', register });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const closeCashRegister = async (req, res) => {
  try {
    const { actualCashCount, notes } = req.body;
    const cashierId = req.userFull?._id || req.user?.id || req.user?._id;

    const register = await CashRegister.findOne({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      cashier: cashierId,
      status: 'open'
    }).sort({ createdAt: -1 });

    if (!register) {
      return res.status(404).json({ message: 'No active cash register found to close' });
    }

    // Calculate cash sales during this register session
    const sessionSales = await Sale.find({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      cashier: cashierId,
      paymentMethod: 'cash',
      status: 'completed',
      createdAt: { $gte: register.openedAt }
    });

    const totalCashSales = sessionSales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const expectedClosing = (register.openingBalance || 0) + totalCashSales;
    const actual = Number(actualCashCount) || 0;
    const difference = actual - expectedClosing;

    register.closingBalance = expectedClosing;
    register.actualCashCount = actual;
    register.cashDifference = Math.round(difference * 100) / 100;
    register.status = 'closed';
    register.closedAt = new Date();
    if (notes) register.notes = notes;

    await register.save();

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: cashierId,
      userName: req.userFull?.name || 'Cashier',
      action: 'CASH_REGISTER_CLOSED',
      module: 'POS Billing',
      details: `Closed shift register. Expected: $${expectedClosing.toFixed(2)}, Actual: $${actual.toFixed(2)}, Diff: $${difference.toFixed(2)}`
    });

    res.json({ message: 'Cash register closed successfully', register, totalCashSales, expectedClosing });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentRegister = async (req, res) => {
  try {
    const cashierId = req.userFull?._id || req.user?.id || req.user?._id;
    const register = await CashRegister.findOne({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      cashier: cashierId,
      status: 'open'
    }).sort({ createdAt: -1 });

    res.json(register || { status: 'closed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== REFUND CONTROLLERS ====================

export const requestRefund = async (req, res) => {
  try {
    const { saleId, invoiceNumber, refundAmount, reason, items } = req.body;
    const cashierId = req.userFull?._id || req.user?.id || req.user?._id;

    const refund = await RefundRequest.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      sale: saleId,
      invoiceNumber,
      refundAmount: Number(refundAmount) || 0,
      reason,
      items: items || [],
      requestedBy: cashierId,
      requestedByName: req.userFull?.name || 'Cashier',
      status: 'pending_approval'
    });

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: cashierId,
      userName: req.userFull?.name || 'Cashier',
      action: 'REFUND_REQUESTED',
      module: 'POS Billing',
      details: `Requested refund of $${Number(refundAmount).toFixed(2)} for Invoice ${invoiceNumber}`
    });

    res.status(201).json({ message: 'Refund request submitted for Manager/Admin approval', refund });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'
    const reviewerId = req.userFull?._id || req.user?.id || req.user?._id;

    const refund = await RefundRequest.findOne({ _id: id, pharmacy: req.pharmacyId });
    if (!refund) return res.status(404).json({ message: 'Refund request not found' });

    if (action === 'approve') {
      refund.status = 'approved';
      refund.approvedBy = reviewerId;
      refund.approvedByName = req.userFull?.name || 'Manager';
    } else {
      refund.status = 'rejected';
      refund.rejectionReason = rejectionReason || 'Rejected by management';
    }

    await refund.save();

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: reviewerId,
      userName: req.userFull?.name || 'Manager',
      action: action === 'approve' ? 'REFUND_APPROVED' : 'REFUND_REJECTED',
      module: 'POS Billing',
      details: `${action.toUpperCase()} refund request for Invoice ${refund.invoiceNumber}`
    });

    res.json({ message: `Refund request ${refund.status}`, refund });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const cashierId = req.userFull?._id || req.user?.id || req.user?._id;

    const refund = await RefundRequest.findOne({ _id: id, pharmacy: req.pharmacyId });
    if (!refund) return res.status(404).json({ message: 'Refund request not found' });
    if (refund.status !== 'approved') {
      return res.status(400).json({ message: 'Only Manager-approved refunds can be processed' });
    }

    const sale = await Sale.findOne({ _id: refund.sale, pharmacy: req.pharmacyId });
    if (!sale) return res.status(404).json({ message: 'Associated sale record not found' });

    // 1. Restore Inventory to Batches
    const itemsToRestore = (refund.items && refund.items.length > 0) ? refund.items : sale.items;
    for (const item of itemsToRestore) {
      if (item.batch && item.quantity > 0) {
        await Batch.findByIdAndUpdate(item.batch, {
          $inc: { quantity: item.quantity },
          $set: { status: 'active' }
        });
      }
    }

    // 2. Adjust Customer Loyalty Points & Credit Balance
    if (sale.customer) {
      const customer = await Customer.findById(sale.customer);
      if (customer) {
        if (sale.loyaltyPointsEarned > 0) {
          customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - sale.loyaltyPointsEarned);
        }
        if (sale.loyaltyPointsRedeemed > 0) {
          customer.loyaltyPoints += sale.loyaltyPointsRedeemed;
        }
        if (sale.paymentMethod === 'credit_account') {
          customer.creditBalance = Math.max(0, customer.creditBalance - refund.refundAmount);
        }
        await customer.save();
      }
    }

    refund.status = 'processed';
    refund.processedAt = new Date();
    await refund.save();

    // 3. Mark sale refunded
    sale.status = 'refunded';
    await sale.save();

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: cashierId,
      userName: req.userFull?.name || 'Cashier',
      action: 'REFUND_PROCESSED',
      module: 'POS Billing',
      details: `Processed refund of $${refund.refundAmount.toFixed(2)} for Invoice ${refund.invoiceNumber}. Inventory restored to batches.`
    });

    res.json({ message: 'Refund processed successfully, inventory restored and sale updated', refund });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRefunds = async (req, res) => {
  try {
    const filter = { pharmacy: req.pharmacyId };
    if (req.branchId) filter.branch = req.branchId;

    const refunds = await RefundRequest.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(refunds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

