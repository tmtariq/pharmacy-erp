import User from '../models/User.js';

export const attachTenant = async (req, res, next) => {
  try {
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId)
      .populate('pharmacy')
      .populate('branch')
      .populate('assignedBranches');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User account is inactive or not found' });
    }

    req.userFull = user;

    const pharmacy = user.pharmacy;
    if (!pharmacy) {
      return res.status(403).json({ message: 'No pharmacy organization associated with this user account' });
    }

    // Determine active branch context
    const headerBranchId = req.headers['x-branch-id'];
    let activeBranchId = user.branch ? (user.branch._id || user.branch).toString() : null;

    const isOwnerOrSuperAdmin = ['SuperAdmin', 'Owner'].includes(user.role);

    if (headerBranchId) {
      const isUserAssignedBranch =
        (user.branch && (user.branch._id || user.branch).toString() === headerBranchId) ||
        (user.assignedBranches && user.assignedBranches.some(b => (b._id || b).toString() === headerBranchId));

      if (isOwnerOrSuperAdmin || isUserAssignedBranch) {
        activeBranchId = headerBranchId;
      } else {
        // Non-owner staff attempting to access unassigned branch
        return res.status(403).json({
          message: 'Access denied: Branch staff can only access their assigned branch. Only pharmacy owners can switch branches.'
        });
      }
    } else if (!isOwnerOrSuperAdmin && user.branch) {
      // Strictly force primary assigned branch for non-owner staff
      activeBranchId = (user.branch._id || user.branch).toString();
    }

    req.pharmacyId = pharmacy._id;
    req.branchId = activeBranchId;
    req.pharmacy = pharmacy;
    req.tenant = {
      pharmacyId: pharmacy._id,
      branchId: activeBranchId
    };

    // Strict Tenant Isolation Boundary Check
    const requestedPharmacyId = String(req.params?.pharmacyId || req.body?.pharmacyId || req.query?.pharmacyId || '');
    if (requestedPharmacyId && String(pharmacy._id) !== requestedPharmacyId) {
      return res.status(403).json({
        message: 'FORBIDDEN: Tenant Isolation boundary violation. Attempt to access unauthorized pharmacy company data is blocked.'
      });
    }

    // Strict Branch Isolation Boundary Check
    const requestedBranchId = String(req.params?.branchId || req.body?.branchId || req.query?.branchId || '');
    if (requestedBranchId && activeBranchId && String(activeBranchId) !== requestedBranchId) {
      const isOwnerOrAdmin = ['Owner', 'Admin'].includes(user.role);
      if (!isOwnerOrAdmin) {
        return res.status(403).json({
          message: 'FORBIDDEN: Branch Isolation boundary violation. Your account is restricted to your assigned branch outlet.'
        });
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
