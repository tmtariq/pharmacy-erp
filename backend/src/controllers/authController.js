import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Pharmacy from '../models/Pharmacy.js';
import Branch from '../models/Branch.js';
import AuditLog from '../models/AuditLog.js';
import { generateTokens } from '../utils/generateTokens.js';
import LoginHistory from '../models/LoginHistory.js';

// Helper: record login event
const recordLogin = async (userId, pharmacyId, email, req, status, failureReason = '') => {
  try {
    await LoginHistory.create({
      user: userId,
      pharmacy: pharmacyId || null,
      email,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      status,
      failureReason
    });
  } catch (e) {
    console.error('LoginHistory record error:', e.message);
  }
};

// Hierarchical Permission Tree Token Definitions
export const ALL_PERMISSIONS = {
  sales: ['sales.view', 'sales.create', 'sales.edit', 'sales.cancel', 'sales.refund'],
  inventory: ['inventory.view', 'inventory.create', 'inventory.adjust', 'inventory.transfer', 'inventory.delete'],
  medicines: ['medicines.view', 'medicines.create', 'medicines.edit', 'medicines.delete'],
  staff: ['staff.view', 'staff.create', 'staff.edit', 'staff.delete'],
  reports: ['reports.sales', 'reports.inventory', 'reports.financial', 'reports.profit_loss']
};

// Default Role Permissions Matrix based on Hierarchical Tree
export const DEFAULT_ROLE_PERMISSIONS = {
  SuperAdmin: ['*'],
  Owner: ['*'],
  Admin: [
    'sales.view', 'sales.create', 'sales.edit', 'sales.cancel', 'sales.refund',
    'inventory.view', 'inventory.create', 'inventory.adjust', 'inventory.transfer', 'inventory.delete',
    'medicines.view', 'medicines.create', 'medicines.edit', 'medicines.delete',
    'staff.view', 'staff.create', 'staff.edit', 'staff.delete',
    'reports.sales', 'reports.inventory', 'reports.financial', 'reports.profit_loss'
  ],
  'Branch Manager': [
    'sales.view', 'sales.create', 'sales.edit', 'sales.cancel', 'sales.refund',
    'inventory.view', 'inventory.create', 'inventory.adjust', 'inventory.transfer',
    'medicines.view', 'medicines.create', 'medicines.edit',
    'staff.view', 'staff.create', 'staff.edit',
    'reports.sales', 'reports.inventory'
  ],
  BranchManager: [
    'sales.view', 'sales.create', 'sales.edit', 'sales.cancel', 'sales.refund',
    'inventory.view', 'inventory.create', 'inventory.adjust', 'inventory.transfer',
    'medicines.view', 'medicines.create', 'medicines.edit',
    'staff.view', 'staff.create', 'staff.edit',
    'reports.sales', 'reports.inventory'
  ],
  'Inventory Manager': [
    'inventory.view', 'inventory.create', 'inventory.adjust', 'inventory.transfer',
    'medicines.view', 'medicines.create', 'medicines.edit',
    'reports.inventory'
  ],
  InventoryManager: [
    'inventory.view', 'inventory.create', 'inventory.adjust', 'inventory.transfer',
    'medicines.view', 'medicines.create', 'medicines.edit',
    'reports.inventory'
  ],
  Pharmacist: [
    'sales.view', 'sales.create', 'sales.edit',
    'inventory.view',
    'medicines.view', 'medicines.create', 'medicines.edit',
    'reports.sales', 'reports.inventory'
  ],
  Cashier: [
    'sales.view', 'sales.create',
    'inventory.view',
    'medicines.view'
  ],
  'Sales Staff': [
    'sales.view', 'sales.create',
    'inventory.view',
    'medicines.view'
  ],
  SalesStaff: [
    'sales.view', 'sales.create',
    'inventory.view',
    'medicines.view'
  ]
};

// Login with Account Lockout & 2FA support
export const login = async (req, res) => {
  const { email, password, twoFactorCode } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = typeof email === 'string' ? email.toLowerCase().trim() : '';

  try {
    const user = await User.findOne({ email: normalizedEmail })
      .select('+password')
      .populate('pharmacy')
      .populate('branch')
      .populate('assignedBranches');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 1. Account Lockout Check
    if (user.isLocked()) {
      const waitMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      await recordLogin(user._id, user.pharmacy?._id || user.pharmacy, normalizedEmail, req, 'locked', 'Account locked');
      return res.status(423).json({
        message: `Account is locked due to repeated failed logins. Please try again in ${waitMinutes} minutes.`
      });
    }

    // 2. Check Password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const isLocked = attempts >= 5;
      const lockTime = isLocked ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            failedLoginAttempts: attempts,
            lockUntil: lockTime
          }
        }
      );

      if (isLocked) {
        try {
          await AuditLog.create({
            pharmacy: user.pharmacy?._id || user.pharmacy || null,
            branch: user.branch?._id || user.branch || null,
            user: user._id,
            userName: user.name,
            action: 'ACCOUNT_LOCKED',
            module: 'Security',
            details: `Account ${user.email} locked after 5 failed login attempts.`
          });
        } catch (e) {
          console.error('AuditLog error:', e.message);
        }
        return res.status(423).json({ message: 'Too many failed login attempts. Account locked for 15 minutes.' });
      }
      await recordLogin(user._id, user.pharmacy?._id || user.pharmacy, normalizedEmail, req, 'failed', 'Invalid credentials');
      return res.status(401).json({ message: `Invalid credentials. ${5 - attempts} attempts remaining.` });
    }

    // 3. Reset failed attempts on success atomically
    await User.updateOne(
      { _id: user._id },
      { $set: { failedLoginAttempts: 0, lockUntil: null } }
    );

    // 4. Two-Factor Authentication Check
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        // Generate and send 2FA code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
        user.twoFactorCodeExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        console.log(`🔑 [SECURITY 2FA CODE for ${user.email}]: ${code}`);

        return res.status(202).json({
          status: '2fa_required',
          message: '2FA code sent. Please provide twoFactorCode to complete login.',
          email: user.email
        });
      }

      // Record 2FA pending as login event
      await recordLogin(user._id, user.pharmacy?._id || user.pharmacy, normalizedEmail, req, '2fa_pending');

      const hashedCode = crypto.createHash('sha256').update(twoFactorCode).digest('hex');
      if (user.twoFactorCode !== hashedCode || user.twoFactorCodeExpire < Date.now()) {
        return res.status(401).json({ message: 'Invalid or expired 2FA code' });
      }

      user.twoFactorCode = null;
      user.twoFactorCodeExpire = null;
      await user.save();
    }

    const accessToken = generateTokens(res, user._id);

    const activePermissions = user.permissions?.length ? user.permissions : DEFAULT_ROLE_PERMISSIONS[user.role] || [];

    try {
      await AuditLog.create({
        pharmacy: user.pharmacy?._id || user.pharmacy || null,
        branch: user.branch?._id || user.branch || null,
        user: user._id,
        userName: user.name,
        action: 'USER_LOGIN',
        module: 'Authentication',
        details: `User ${user.email} logged in successfully.`
      });
    } catch (e) {
      console.error('AuditLog error:', e.message);
    }

    await recordLogin(user._id, user.pharmacy?._id || user.pharmacy, normalizedEmail, req, 'success');

    res.status(200).json({
      status: 'success',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: activePermissions,
        pharmacy: user.pharmacy,
        branch: user.branch,
        assignedBranches: user.assignedBranches || [user.branch],
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password Endpoint
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({ message: 'If an account exists, a password reset token has been sent.' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    console.log(`🔐 [RESET PASSWORD TOKEN for ${user.email}]: ${resetToken}`);

    res.status(200).json({
      status: 'success',
      message: 'Password reset token generated.',
      resetToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password Endpoint
export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    await AuditLog.create({
      pharmacy: user.pharmacy,
      branch: user.branch,
      user: user._id,
      userName: user.name,
      action: 'PASSWORD_RESET',
      module: 'Security',
      details: `Password reset successfully for ${user.email}`
    });

    res.status(200).json({ status: 'success', message: 'Password has been reset successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle 2FA Endpoint
export const toggle2FA = async (req, res) => {
  try {
    const user = await User.findById(req.userFull._id);
    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();

    res.json({
      message: `Two-Factor Authentication (2FA) is now ${user.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}.`,
      twoFactorEnabled: user.twoFactorEnabled
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register Staff with Role Permissions
export const registerStaff = async (req, res) => {
  const { name, email, password, role, branchId, permissions, phone } = req.body;

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'User email is already registered.' });
    }

    const assignedRole = role || 'Cashier';
    const assignedBranch = branchId || req.branchId;
    const assignedPermissions = permissions?.length ? permissions : (DEFAULT_ROLE_PERMISSIONS[assignedRole] || []);

    const newStaff = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      permissions: assignedPermissions,
      pharmacy: req.pharmacyId,
      branch: assignedBranch,
      assignedBranches: [assignedBranch],
      phone: phone || ''
    });

    await AuditLog.create({
      pharmacy: req.pharmacyId,
      branch: assignedBranch,
      user: req.userFull._id,
      userName: req.userFull.name,
      action: 'STAFF_REGISTERED',
      module: 'Staff Management',
      details: `Registered staff member ${newStaff.name} with Role: "${newStaff.role}"`
    });

    res.status(201).json({
      message: 'Staff user created successfully',
      user: {
        id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        permissions: newStaff.permissions,
        branch: newStaff.branch
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Staff User Details & Role
export const updateStaffUser = async (req, res) => {
  try {
    const { name, email, role, branchId, isActive } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (branchId) {
      updateData.branch = branchId;
      updateData.assignedBranches = [branchId];
    }
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.id, pharmacy: req.pharmacyId },
      updateData,
      { new: true }
    ).populate('branch');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json({
      message: `Staff member "${updatedUser.name}" updated successfully.`,
      user: updatedUser
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get Users of Pharmacy
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      pharmacy: req.pharmacyId,
      role: { $ne: 'SuperAdmin' }
    })
      .populate('branch')
      .populate('assignedBranches')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id)
      .select('-password')
      .populate('pharmacy')
      .populate('branch')
      .populate('assignedBranches');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const activePermissions = user.permissions?.length ? user.permissions : DEFAULT_ROLE_PERMISSIONS[user.role] || [];

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: activePermissions,
        pharmacy: user.pharmacy,
        branch: user.branch,
        assignedBranches: user.assignedBranches || [user.branch],
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'super_secret_pharmacy_erp_refresh_key_2026';
    const decoded = jwt.verify(refreshToken, refreshSecret);
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('pharmacy')
      .populate('branch')
      .populate('assignedBranches');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Refresh token invalid or user inactive' });
    }

    const accessToken = generateTokens(res, user._id);
    const activePermissions = user.permissions?.length ? user.permissions : DEFAULT_ROLE_PERMISSIONS[user.role] || [];

    res.status(200).json({
      status: 'success',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: activePermissions,
        pharmacy: user.pharmacy,
        branch: user.branch,
        assignedBranches: user.assignedBranches || [user.branch]
      }
    });
  } catch (error) {
    return res.status(401).json({ message: 'Unable to refresh token' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  res.status(200).json({ message: 'Logged out successfully' });
};

// Get Login History for a pharmacy's users
export const getLoginHistory = async (req, res) => {
  try {
    const filter = { pharmacy: req.pharmacyId };
    if (req.query.userId) filter.user = req.query.userId;
    const logs = await LoginHistory.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 100)
      .populate('user', 'name email role');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};