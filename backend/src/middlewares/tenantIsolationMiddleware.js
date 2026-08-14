/**
 * Enforces strict SaaS Multi-Tenant Isolation boundary.
 * Prevents horizontal privilege escalation where one company user
 * attempts to view or modify resources belonging to another company.
 */
export const enforceTenantIsolation = (req, res, next) => {
  // 1. Super Admins bypass tenant isolation to allow for troubleshooting support sessions
  if (req.superAdmin || req.user?.isPlatformAdmin || ['Super Admin', 'Finance Admin', 'Support Admin', 'Operations Admin', 'SuperAdmin'].includes(req.user?.role)) {
    return next();
  }

  // 2. Extract tenant identifiers from request context
  const userPharmacyId = String(req.user?.pharmacyId || req.user?.pharmacy || '');
  const requestedPharmacyId = String(req.params?.pharmacyId || req.body?.pharmacyId || req.query?.pharmacyId || '');

  // 3. If no targeted pharmacyId is requested, proceed (it's a self-bound query)
  if (!requestedPharmacyId) {
    return next();
  }

  // 4. Validate matching identifiers
  if (userPharmacyId !== requestedPharmacyId) {
    return res.status(403).json({
      message: 'FORBIDDEN: Tenant Isolation violation. You do not have permission to access resources outside your registered pharmacy company.'
    });
  }

  next();
};

/**
 * Enforces strict SaaS multi-branch boundary checks.
 * Restricts branch managers and cashiers to their assigned branch outlet.
 */
export const enforceBranchIsolation = (req, res, next) => {
  // 1. Super Admins, Platform Admins, and Company Owners bypass branch boundaries
  const bypassRoles = ['Super Admin', 'Finance Admin', 'Support Admin', 'Operations Admin', 'SuperAdmin', 'Owner', 'Company Owner'];
  if (req.superAdmin || req.user?.isPlatformAdmin || bypassRoles.includes(req.user?.role)) {
    return next();
  }

  // 2. Extract branch identifiers
  const userBranchId = String(req.user?.branchId || req.user?.branch || '');
  const requestedBranchId = String(req.params?.branchId || req.body?.branchId || req.query?.branchId || '');

  // 3. If no branchId is specified, proceed
  if (!requestedBranchId) {
    return next();
  }

  // 4. Validate matching identifiers
  if (userBranchId !== requestedBranchId) {
    return res.status(403).json({
      message: 'FORBIDDEN: Branch boundary violation. Your account is restricted to your assigned branch outlet.'
    });
  }

  next();
};
