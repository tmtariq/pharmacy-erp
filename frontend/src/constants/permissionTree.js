/**
 * Hierarchical Permission Tree System
 * Grouped into Sales, Inventory, Medicines, Staff, and Reports
 */

export const PERMISSION_TREE = {
  sales: {
    label: 'Sales & POS',
    description: 'Permissions governing billing, order modifications, and refunds',
    permissions: [
      { key: 'sales.view', label: 'View Sales & Invoices', description: 'Can view sales history and receipts' },
      { key: 'sales.create', label: 'Create Sale / Checkout', description: 'Can open POS and complete sales' },
      { key: 'sales.edit', label: 'Edit Sales Orders', description: 'Can edit hold carts and line item quantities' },
      { key: 'sales.cancel', label: 'Cancel Sales Orders', description: 'Can cancel unpaid/held transactions' },
      { key: 'sales.refund', label: 'Process Refunds', description: 'Can issue and execute customer refunds' }
    ]
  },
  inventory: {
    label: 'Inventory & Stock Control',
    description: 'Permissions governing batches, warehouse stock, and adjustments',
    permissions: [
      { key: 'inventory.view', label: 'View Stock & Batches', description: 'Can view on-hand stock and FEFO batches' },
      { key: 'inventory.create', label: 'Add Stock Batches', description: 'Can receive and add new batch stocks' },
      { key: 'inventory.adjust', label: 'Adjust Stock Counts', description: 'Can perform stock count adjustments and corrections' },
      { key: 'inventory.transfer', label: 'Stock Transfers', description: 'Can request and receive inter-branch transfers' },
      { key: 'inventory.delete', label: 'Delete / Dispose Stock', description: 'Can dispose of expired or damaged inventory' }
    ]
  },
  medicines: {
    label: 'Medicine Catalog',
    description: 'Permissions governing pharmaceutical catalog and pricing',
    permissions: [
      { key: 'medicines.view', label: 'Search & View Medicines', description: 'Can search catalog and view details' },
      { key: 'medicines.create', label: 'Create New Medicines', description: 'Can add new pharmaceutical products' },
      { key: 'medicines.edit', label: 'Edit Medicine Details', description: 'Can update descriptions, packaging, and strength' },
      { key: 'medicines.delete', label: 'Delete Medicines', description: 'Can permanently remove medicine profiles' }
    ]
  },
  staff: {
    label: 'Staff & Team Management',
    description: 'Permissions governing staff accounts, roles, and branch assignments',
    permissions: [
      { key: 'staff.view', label: 'View Staff Roster', description: 'Can view staff profiles and activity' },
      { key: 'staff.create', label: 'Create Staff Accounts', description: 'Can register new staff members' },
      { key: 'staff.edit', label: 'Edit Staff & Permissions', description: 'Can modify roles, branches, and permissions' },
      { key: 'staff.delete', label: 'Disable / Remove Staff', description: 'Can deactivate or delete staff members' }
    ]
  },
  reports: {
    label: 'Reports & Analytics',
    description: 'Permissions governing business intelligence, sales metrics, and financial audits',
    permissions: [
      { key: 'reports.sales', label: 'Sales Reports', description: 'Can view sales trends, receipts, and cashier summaries' },
      { key: 'reports.inventory', label: 'Inventory Reports', description: 'Can view stock valuation, expiry, and batch reports' },
      { key: 'reports.financial', label: 'Financial Summaries', description: 'Can view receivables, payables, and revenue streams' },
      { key: 'reports.profit_loss', label: 'Profit & Loss Statements', description: 'Can view executive net profit and cost calculations' }
    ]
  }
};

// Flattened List of all system permissions
export const ALL_PERMISSION_KEYS = Object.values(PERMISSION_TREE).flatMap(
  (group) => group.permissions.map((p) => p.key)
);

// Helper: Check if a user has a specific permission (supports wildcard & custom array)
export const hasPermission = (user, requiredPermission) => {
  if (!user) return false;
  if (['SuperAdmin', 'Owner'].includes(user.role)) return true;

  const perms = user.permissions || [];
  if (perms.includes('*')) return true;
  if (perms.includes(requiredPermission)) return true;

  const namespace = requiredPermission.split('.')[0];
  if (perms.includes(`${namespace}.*`)) return true;

  return false;
};

// Helper: Check if a user has any of the permissions
export const hasAnyPermission = (user, permissionsList = []) => {
  if (!user) return false;
  if (['SuperAdmin', 'Owner'].includes(user.role)) return true;
  return permissionsList.some((p) => hasPermission(user, p));
};

// Helper: Check if a user has all required permissions
export const hasAllPermissions = (user, permissionsList = []) => {
  if (!user) return false;
  if (['SuperAdmin', 'Owner'].includes(user.role)) return true;
  return permissionsList.every((p) => hasPermission(user, p));
};

// Route permission mapping (checks fine-grained permission OR role access)
export const ROUTE_PERMISSIONS = {
  '/pos': ['sales.create', 'sales.view'],
  '/inventory': ['inventory.view', 'medicines.view'],
  '/expiry': ['inventory.view'],
  '/barcode-labels': ['inventory.view'],
  '/transfers': ['inventory.transfer'],
  '/purchases': ['inventory.create', 'inventory.view'],
  '/customers': ['sales.view', 'sales.create'],
  '/reports': ['reports.sales', 'reports.inventory', 'reports.financial', 'reports.profit_loss'],
  '/employees': ['staff.view', 'staff.create', 'staff.edit'],
  '/settings/company': ['*'],
  '/settings/branches': ['*'],
  '/settings/subscription': ['*']
};

export const canAccessRoute = (user, path) => {
  if (!user) return false;
  if (['SuperAdmin', 'Owner', 'Admin'].includes(user.role)) return true;

  const required = ROUTE_PERMISSIONS[path];
  if (!required) return true; // Open if not specified

  return hasAnyPermission(user, required);
};
