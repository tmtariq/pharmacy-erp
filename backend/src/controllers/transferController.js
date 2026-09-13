import StockTransfer from '../models/StockTransfer.js';
import Batch from '../models/Batch.js';
import AuditLog from '../models/AuditLog.js';

export const createTransferRequest = async (req, res) => {
  const { toBranchId, items, notes } = req.body;

  try {
    const fromBranchId = req.branchId;
    if (!fromBranchId || fromBranchId === toBranchId) {
      return res.status(400).json({ message: 'Invalid origin or destination branch.' });
    }

    const transferNumber = `TRF-${Date.now().toString().slice(-6)}`;

    const transfer = await StockTransfer.create({
      transferNumber,
      pharmacy: req.pharmacyId,
      fromBranch: fromBranchId,
      toBranch: toBranchId,
      requestedBy: req.userFull._id,
      items,
      status: 'pending',
      notes: notes || ''
    });

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: fromBranchId,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'STOCK_TRANSFER_REQUESTED',
      module: 'Stock Transfers',
      details: `Created stock transfer request ${transferNumber} to branch ${toBranchId}`
    });

    res.status(201).json(transfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransfers = async (req, res) => {
  try {
    const transfers = await StockTransfer.find({ pharmacy: req.pharmacyId })
      .populate('fromBranch', 'name code')
      .populate('toBranch', 'name code')
      .populate('requestedBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTransferStatus = async (req, res) => {
  const { status } = req.body; // 'approved', 'dispatched', 'received', 'rejected'

  try {
    const transfer = await StockTransfer.findOne({ _id: req.params.id, pharmacy: req.pharmacyId });
    if (!transfer) return res.status(404).json({ message: 'Transfer request not found' });

    // If status changes to 'received', deduct batch from fromBranch and add to toBranch!
    if (status === 'received' && transfer.status !== 'received') {
      // 1. Pre-validation: ensure all items exist with sufficient stock in origin branch
      for (const item of transfer.items) {
        const sourceBatch = await Batch.findOne({
          pharmacy: req.pharmacyId,
          branch: transfer.fromBranch,
          medicine: item.medicine,
          batchNumber: item.batchNumber
        });

        if (!sourceBatch || sourceBatch.quantity < item.quantity) {
          return res.status(400).json({
            message: `Cannot receive transfer: Insufficient inventory in origin branch for batch '${item.batchNumber}'. Available: ${sourceBatch?.quantity || 0}, Required: ${item.quantity}.`
          });
        }
      }

      // 2. Perform atomic batch deductions and target increments
      for (const item of transfer.items) {
        // Atomic deduction from source branch batch
        const sourceBatch = await Batch.findOneAndUpdate(
          {
            pharmacy: req.pharmacyId,
            branch: transfer.fromBranch,
            medicine: item.medicine,
            batchNumber: item.batchNumber,
            quantity: { $gte: item.quantity }
          },
          { $inc: { quantity: -item.quantity } },
          { new: true }
        );

        if (sourceBatch && sourceBatch.quantity === 0) {
          sourceBatch.status = 'exhausted';
          await sourceBatch.save();
        }

        // Add to target branch batch (create or increment atomically)
        let targetBatch = await Batch.findOne({
          pharmacy: req.pharmacyId,
          branch: transfer.toBranch,
          medicine: item.medicine,
          batchNumber: item.batchNumber
        });

        if (targetBatch) {
          targetBatch.quantity += item.quantity;
          targetBatch.status = 'active';
          await targetBatch.save();
        } else {
          await Batch.create({
            medicine: item.medicine,
            pharmacy: req.pharmacyId,
            branch: transfer.toBranch,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            costPrice: item.costPrice || 0,
            sellingPrice: item.sellingPrice || 0,
            mrp: item.mrp || 0,
            quantity: item.quantity,
            status: 'active'
          });
        }
      }
    }

    transfer.status = status;
    if (status === 'approved' || status === 'received') {
      transfer.approvedBy = req.userFull._id;
    }
    await transfer.save();

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'STOCK_TRANSFER_UPDATED',
      module: 'Stock Transfers',
      details: `Updated transfer ${transfer.transferNumber} status to "${status}"`
    });

    res.json(transfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
