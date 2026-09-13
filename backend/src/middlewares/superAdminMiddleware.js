import jwt from 'jsonwebtoken';
import SuperAdmin from '../models/SuperAdmin.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY EXCEPTION: JWT_SECRET environment variable is not defined.');
    }
    return 'dev-superadmin-fallback-secret-2026';
  }
  return secret;
};

/**
 * Strict Gatekeeper: Verifies that the requester is a real SaaS SuperAdmin
 * Rejects all standard company users (Owners, Pharmacists, Cashiers, etc.)
 */
export const requireSuperAdmin = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.saas_admin_token) {
      token = req.cookies.saas_admin_token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied: SuperAdmin authentication required' });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    const platformRoles = ['Super Admin', 'Finance Admin', 'Support Admin', 'Operations Admin', 'SuperAdmin'];
    if (!platformRoles.includes(decoded.role) || !decoded.isPlatformAdmin) {
      return res.status(403).json({
        message: 'FORBIDDEN: Company and branch accounts are not authorized to access SaaS Admin routes'
      });
    }

    const admin = await SuperAdmin.findById(decoded.id);
    if (!admin || admin.status !== 'active') {
      return res.status(403).json({ message: 'Platform Administrator account inactive or revoked' });
    }

    req.superAdmin = admin;
    req.user = { id: admin._id, role: admin.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired SuperAdmin administrative session' });
  }
};

/**
 * Platform Action Gatekeeper: Verifies that the authenticated platform administrator
 * holds the necessary role to complete the action.
 *
 * @param {...string} allowedRoles - Allowed platform roles
 */
export const authorizePlatformRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Super Admin/SuperAdmin bypasses all restriction maps
    const adminRole = req.superAdmin?.role || req.user?.role;
    if (adminRole === 'Super Admin' || adminRole === 'SuperAdmin') {
      return next();
    }

    if (!allowedRoles.includes(adminRole)) {
      return res.status(403).json({
        message: `FORBIDDEN: Your platform role (${adminRole}) does not have permission to execute this administrative operation. Required role(s): ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
