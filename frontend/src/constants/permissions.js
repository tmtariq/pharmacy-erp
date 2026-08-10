// Role-based sidebar visibility map
// Each role maps to an array of route paths they can see in the sidebar
export const SIDEBAR_VISIBILITY = {
  Owner: ['*'], // sees everything
  Admin: ['*'], // sees everything except subscription management
  'Branch Manager': [
    '/dashboard',
    '/pos',
    '/prescriptions',
    '/inventory',
    '/expiry',
    '/barcode-labels',
    '/transfers',
    '/purchases',
    '/customers',
    '/employees',
    '/reports'
  ],
  BranchManager: [
    '/dashboard',
    '/pos',
    '/prescriptions',
    '/inventory',
    '/expiry',
    '/barcode-labels',
    '/transfers',
    '/purchases',
    '/customers',
    '/employees',
    '/reports'
  ],
  Pharmacist: ['/dashboard', '/pos', '/prescriptions', '/inventory', '/expiry', '/customers'],
  Cashier: ['/dashboard', '/pos', '/customers'],
  'Sales Staff': ['/dashboard', '/pos', '/inventory', '/customers'],
  SalesStaff: ['/dashboard', '/pos', '/inventory', '/customers'],
  'Inventory Manager': [
    '/dashboard',
    '/inventory',
    '/expiry',
    '/barcode-labels',
    '/transfers',
    '/purchases',
    '/reports'
  ],
  InventoryManager: [
    '/dashboard',
    '/inventory',
    '/expiry',
    '/barcode-labels',
    '/transfers',
    '/purchases',
    '/reports'
  ],
};

// Dashboard widget visibility per role
export const DASHBOARD_WIDGETS = {
  Owner: ['sales', 'purchases', 'stockValue', 'profit', 'lowStock', 'expiring', 'outstanding', 'suppliers', 'customers', 'branches', 'staffActivity', 'charts', 'finance'],
  Admin: ['sales', 'purchases', 'stockValue', 'profit', 'lowStock', 'expiring', 'outstanding', 'suppliers', 'customers', 'branches', 'staffActivity', 'charts', 'finance'],
  'Branch Manager': ['sales', 'purchases', 'stockValue', 'profit', 'lowStock', 'expiring', 'outstanding', 'suppliers', 'customers', 'staffActivity', 'charts'],
  BranchManager: ['sales', 'purchases', 'stockValue', 'profit', 'lowStock', 'expiring', 'outstanding', 'suppliers', 'customers', 'staffActivity', 'charts'],
  Pharmacist: ['sales', 'lowStock', 'expiring', 'customers'],
  Cashier: ['sales', 'customers'],
  'Inventory Manager': ['stockValue', 'lowStock', 'expiring', 'purchases', 'suppliers'],
  InventoryManager: ['stockValue', 'lowStock', 'expiring', 'purchases', 'suppliers'],
};

export * from './permissionTree';
import { canAccessRoute } from './permissionTree';

// Helper: check if a role or user object can access a specific route
export const canAccess = (roleOrUser, path) => {
  if (!roleOrUser) return false;

  // If passed a full user object with custom permissions
  if (typeof roleOrUser === 'object' && roleOrUser.role) {
    const role = roleOrUser.role;
    const visibility = SIDEBAR_VISIBILITY[role];
    if (visibility && visibility.includes('*')) return true;
    return canAccessRoute(roleOrUser, path);
  }

  // Fallback to role-based check
  const role = roleOrUser;
  const visibility = SIDEBAR_VISIBILITY[role];
  if (!visibility) return false;
  if (visibility.includes('*')) return true;
  return visibility.includes(path);
};

// Helper: check if a role can see a specific dashboard widget
export const canSeeWidget = (role, widget) => {
  const widgets = DASHBOARD_WIDGETS[role];
  if (!widgets) return false;
  return widgets.includes(widget);
};

// Helper: get sidebar items for a role
export const getVisiblePaths = (role) => {
  return SIDEBAR_VISIBILITY[role] || [];
};
