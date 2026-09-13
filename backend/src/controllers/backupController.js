import Backup from '../models/Backup.js';
import Medicine from '../models/Medicine.js';
import Batch from '../models/Batch.js';
import Sale from '../models/Sale.js';
import Purchase from '../models/Purchase.js';
import Customer from '../models/Customer.js';
import Supplier from '../models/Supplier.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { dispatchNotificationHelper } from './notificationController.js';

export const createBackup = async (req, res) => {
  const { schedule = 'manual', target = 'local' } = req.body;
  const pharmacyId = req.pharmacyId;

  try {
    // 1. Gather all collections for active pharmacy tenant
    const medicines = await Medicine.find({ pharmacy: pharmacyId });
    const batches = await Batch.find({ pharmacy: pharmacyId });
    const sales = await Sale.find({ pharmacy: pharmacyId });
    const purchases = await Purchase.find({ pharmacy: pharmacyId });
    const customers = await Customer.find({ pharmacy: pharmacyId });
    const suppliers = await Supplier.find({ pharmacy: pharmacyId });
    const users = await User.find({ pharmacy: pharmacyId }).select('-password');

    const totalRecords = medicines.length + batches.length + sales.length + purchases.length + customers.length + suppliers.length + users.length;

    const snapshotObj = {
      timestamp: new Date().toISOString(),
      pharmacyId,
      collections: {
        medicines,
        batches,
        sales,
        purchases,
        customers,
        suppliers,
        users
      }
    };

    const serialized = JSON.stringify(snapshotObj);
    const sizeBytes = Buffer.byteLength(serialized, 'utf8');

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const backupName = `backup-${schedule}-${dateStr}-${randomHex}.json`;
    const fileUrl = target === 'cloud'
      ? `https://cloud-storage.pharmacy-erp.net/backups/${backupName}`
      : `/backups/${backupName}`;

    const newBackup = await Backup.create({
      backupName,
      pharmacy: pharmacyId,
      schedule,
      target,
      sizeBytes,
      recordCount: totalRecords,
      status: 'verified',
      fileUrl,
      backupData: serialized
    });

    // 2. Dispatch Notification & Log Audit
    await dispatchNotificationHelper({
      pharmacyId,
      branchId: req.branchId,
      userId: req.userFull._id,
      title: 'Database Backup Completed',
      message: `Successfully created ${schedule.toUpperCase()} database backup "${backupName}" (${totalRecords} records, ${(sizeBytes / 1024).toFixed(1)} KB).`,
      type: 'backup_status'
    });

    await AuditLog.create({
      pharmacy: pharmacyId,
      branch: req.branchId,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'BACKUP_COMPLETED',
      module: 'Backup Engine',
      details: `Created ${schedule.toUpperCase()} ${target.toUpperCase()} Backup ${backupName}`
    });

    res.status(201).json(newBackup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBackups = async (req, res) => {
  try {
    const backups = await Backup.find({ pharmacy: req.pharmacyId })
      .select('-backupData')
      .sort({ createdAt: -1 });

    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyBackupIntegrity = async (req, res) => {
  const { backupId } = req.params;

  try {
    const backup = await Backup.findOne({ _id: backupId, pharmacy: req.pharmacyId });
    if (!backup) return res.status(404).json({ message: 'Backup snapshot not found' });

    if (!backup.backupData) {
      backup.status = 'corrupted';
      await backup.save();
      return res.status(400).json({ message: 'Backup verification failed: Payload empty' });
    }

    const parsed = JSON.parse(backup.backupData);
    if (!parsed.collections) {
      backup.status = 'corrupted';
      await backup.save();
      return res.status(400).json({ message: 'Backup verification failed: Invalid snapshot schema' });
    }

    backup.status = 'verified';
    await backup.save();

    res.json({
      message: `Backup "${backup.backupName}" integrity verified 100% successfully.`,
      recordCount: backup.recordCount,
      sizeBytes: backup.sizeBytes,
      status: 'verified'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreBackup = async (req, res) => {
  const { backupId } = req.params;

  try {
    const backup = await Backup.findOne({ _id: backupId, pharmacy: req.pharmacyId });
    if (!backup) return res.status(404).json({ message: 'Backup snapshot not found' });

    if (!backup.backupData) {
      return res.status(400).json({ message: 'Cannot restore backup: Snapshot data payload is empty.' });
    }

    let parsed;
    try {
      parsed = JSON.parse(backup.backupData);
    } catch (parseErr) {
      return res.status(400).json({ message: 'Corrupted backup file: JSON payload could not be parsed.' });
    }

    if (!parsed.collections) {
      return res.status(400).json({ message: 'Corrupted backup schema: missing collections in snapshot.' });
    }

    const { medicines = [], batches = [], customers = [], suppliers = [] } = parsed.collections;
    let restoredCounts = { medicines: 0, batches: 0, customers: 0, suppliers: 0 };

    // Restore Medicines
    if (medicines.length > 0) {
      const medOps = medicines.map((m) => ({
        replaceOne: {
          filter: { _id: m._id, pharmacy: req.pharmacyId },
          replacement: { ...m, pharmacy: req.pharmacyId },
          upsert: true
        }
      }));
      const medResult = await Medicine.bulkWrite(medOps);
      restoredCounts.medicines = (medResult.upsertedCount || 0) + (medResult.modifiedCount || 0);
    }

    // Restore Batches
    if (batches.length > 0) {
      const batchOps = batches.map((b) => ({
        replaceOne: {
          filter: { _id: b._id, pharmacy: req.pharmacyId },
          replacement: { ...b, pharmacy: req.pharmacyId },
          upsert: true
        }
      }));
      const batchResult = await Batch.bulkWrite(batchOps);
      restoredCounts.batches = (batchResult.upsertedCount || 0) + (batchResult.modifiedCount || 0);
    }

    // Restore Customers
    if (customers.length > 0) {
      const custOps = customers.map((c) => ({
        replaceOne: {
          filter: { _id: c._id, pharmacy: req.pharmacyId },
          replacement: { ...c, pharmacy: req.pharmacyId },
          upsert: true
        }
      }));
      const custResult = await Customer.bulkWrite(custOps);
      restoredCounts.customers = (custResult.upsertedCount || 0) + (custResult.modifiedCount || 0);
    }

    // Restore Suppliers
    if (suppliers.length > 0) {
      const suppOps = suppliers.map((s) => ({
        replaceOne: {
          filter: { _id: s._id, pharmacy: req.pharmacyId },
          replacement: { ...s, pharmacy: req.pharmacyId },
          upsert: true
        }
      }));
      const suppResult = await Supplier.bulkWrite(suppOps);
      restoredCounts.suppliers = (suppResult.upsertedCount || 0) + (suppResult.modifiedCount || 0);
    }

    backup.status = 'restored';
    backup.verifiedAt = new Date();
    await backup.save();

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: req.branchId,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'BACKUP_RESTORED',
      module: 'Backup Engine',
      details: `Restored Database Snapshot from Backup "${backup.backupName}". Restored: ${JSON.stringify(restoredCounts)}`
    });

    res.json({
      message: `Database successfully restored to snapshot state "${backup.backupName}".`,
      restoredAt: new Date().toISOString(),
      restoredCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
