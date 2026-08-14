import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: [
        'SuperAdmin',
        'Owner',
        'Company Owner',
        'Branch Manager',
        'Pharmacist',
        'Inventory Manager',
        'Inventory Staff',
        'Sales Staff',
        'Cashier',
        'Accountant',
        'Delivery Staff',
        'Customer'
      ],
      default: 'Cashier'
    },
    permissions: [{ type: String }],
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    assignedBranches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
    phone: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },

    // Security & Auth Enhancements
    isEmailVerified: { type: Boolean, default: true },
    emailVerificationToken: { type: String, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },
    
    // Account Lockout Protection
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    // Two-Factor Authentication (2FA)
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorCode: { type: String, default: null },
    twoFactorCodeExpire: { type: Date, default: null }
  },
  { timestamps: true }
);

// Password Hashing Pre-save Hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (typeof this.password === 'string' && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare Password Method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch {
    return false;
  }
};

// Check if Account is Locked
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Generate Reset Password Token Method
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resetToken;
};

export default mongoose.model('User', userSchema);