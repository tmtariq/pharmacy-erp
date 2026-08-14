import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin.js';
import AuditLog from '../models/AuditLog.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'pharmacy-erp-jwt-secret-key-2026';

// Dedicated SuperAdmin Login
export const superAdminLogin = async (req, res) => {
  const { email, password, twoFactorCode } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const admin = await SuperAdmin.findOne({ email: normalizedEmail }).select('+password');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid administrative credentials' });
    }

    // 1. Lockout Check
    if (admin.isLocked()) {
      const waitMinutes = Math.ceil((admin.lockUntil - Date.now()) / (60 * 1000));
      return res.status(423).json({
        message: `Account temporarily locked due to repeated failed logins. Try again in ${waitMinutes} minutes.`
      });
    }

    // 2. Password Check
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      const attempts = (admin.failedLoginAttempts || 0) + 1;
      const isLocked = attempts >= 5;
      const lockTime = isLocked ? new Date(Date.now() + 20 * 60 * 1000) : null;

      await SuperAdmin.updateOne(
        { _id: admin._id },
        { $set: { failedLoginAttempts: attempts, lockUntil: lockTime } }
      );

      return res.status(401).json({
        message: isLocked
          ? 'Too many failed login attempts. Account locked for 20 minutes.'
          : `Invalid administrative credentials. ${5 - attempts} attempts remaining.`
      });
    }

    // 3. Status Check
    if (admin.status !== 'active') {
      return res.status(403).json({ message: 'Administrative account is inactive or suspended.' });
    }

    // 4. Two-Factor Authentication Check
    if (admin.twoFactorEnabled) {
      if (!twoFactorCode) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        admin.twoFactorCode = crypto.createHash('sha256').update(code).digest('hex');
        admin.twoFactorCodeExpire = new Date(Date.now() + 10 * 60 * 1000);
        await admin.save();

        console.log(`🔐 [SUPERADMIN 2FA CODE for ${admin.email}]: ${code}`);

        return res.status(202).json({
          status: '2fa_required',
          message: '2FA code generated. Provide twoFactorCode to complete login.',
          email: admin.email
        });
      }

      const hashedCode = crypto.createHash('sha256').update(twoFactorCode).digest('hex');
      if (admin.twoFactorCode !== hashedCode || admin.twoFactorCodeExpire < Date.now()) {
        return res.status(401).json({ message: 'Invalid or expired 2FA code' });
      }

      admin.twoFactorCode = null;
      admin.twoFactorCodeExpire = null;
    }

    // 5. Reset Attempts & Update Login Audit
    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;
    admin.lastLoginAt = new Date();
    admin.lastLoginIp = req.ip || req.headers['x-forwarded-for'] || '';
    await admin.save();

    // 6. Generate Dedicated SuperAdmin JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'SuperAdmin', isPlatformAdmin: true },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Set secure HTTP-only cookie
    res.cookie('saas_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000
    });

    await AuditLog.create({
      user: admin._id,
      userName: admin.name,
      action: 'SUPERADMIN_LOGIN',
      module: 'SaaS Platform Security',
      details: `SuperAdmin ${admin.email} signed into SaaS Admin Portal from IP ${admin.lastLoginIp}`
    });

    res.json({
      message: 'SaaS SuperAdmin authenticated successfully',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'SuperAdmin',
        status: admin.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'SuperAdmin authentication error: ' + error.message });
  }
};

// SuperAdmin Current Profile
export const getSuperAdminProfile = async (req, res) => {
  try {
    const admin = await SuperAdmin.findById(req.superAdmin._id).select('-password');
    if (!admin) return res.status(404).json({ message: 'SuperAdmin not found' });
    res.json({ admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SuperAdmin Logout
export const superAdminLogout = async (req, res) => {
  try {
    res.clearCookie('saas_admin_token');
    res.json({ message: 'SuperAdmin logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
