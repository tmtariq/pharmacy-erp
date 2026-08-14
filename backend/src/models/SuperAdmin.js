import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const superAdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['Super Admin', 'Finance Admin', 'Support Admin', 'Operations Admin', 'SuperAdmin'],
      default: 'Super Admin'
    },
    permissions: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },

    // Security & Auth
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: null },
    twoFactorCode: { type: String, default: null },
    twoFactorCodeExpire: { type: Date, default: null },

    // Lockout Protection
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: '' }
  },
  { timestamps: true }
);

// Hash password before saving
superAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (typeof this.password === 'string' && (this.password.startsWith('$2a$') || this.password.startsWith('$2b$'))) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match Password
superAdminSchema.methods.matchPassword = async function (enteredPassword) {
  if (!enteredPassword || !this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if locked
superAdminSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

export default mongoose.model('SuperAdmin', superAdminSchema);
