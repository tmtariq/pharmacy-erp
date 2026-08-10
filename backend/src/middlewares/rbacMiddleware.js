export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userFull || !req.userFull.role) {
      return res.status(403).json({ message: 'Access forbidden: No user role context' });
    }

    if (allowedRoles.includes(req.userFull.role) || req.userFull.role === 'Owner' || req.userFull.role === 'SuperAdmin') {
      return next();
    }

    return res.status(403).json({ message: `Access denied. Required roles: ${allowedRoles.join(', ')}` });
  };
};

export const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.userFull) {
      return res.status(403).json({ message: 'Access forbidden: No user context' });
    }

    const role = req.userFull.role;
    // SuperAdmin and Owner have global bypass
    if (['SuperAdmin', 'Owner'].includes(role)) {
      return next();
    }

    const userPerms = req.userFull.permissions || [];
    if (userPerms.includes('*')) {
      return next();
    }

    // Check if user has all required permissions or wildcard namespace match
    const hasAll = requiredPermissions.every((perm) => {
      if (userPerms.includes(perm)) return true;
      const namespace = perm.split('.')[0];
      if (userPerms.includes(`${namespace}.*`)) return true;
      return false;
    });

    if (!hasAll) {
      return res.status(403).json({
        message: `Permission denied. Required permission(s): ${requiredPermissions.join(', ')}`
      });
    }

    next();
  };
};

export default authorizeRoles;