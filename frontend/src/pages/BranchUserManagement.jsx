import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  UserPlus,
  Shield,
  Store,
  Plus,
  Edit,
  Trash2,
  ShieldAlert,
  CreditCard,
  Mail,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DataTable,
  Input,
  Select,
  Badge,
  StatusDot,
  Button,
  Modal,
  Skeleton,
  useToast
} from '../components/ui';

const BranchUserManagement = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isCompanyOwner = user?.role === 'Owner';

  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals visibility
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);

  const [editingBranch, setEditingBranch] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    phone: '',
    address: '',
    receiptHeader: 'Thank you for visiting!',
    receiptFooter: 'Get well soon!'
  });

  const [editBranchForm, setEditBranchForm] = useState({
    name: '',
    code: '',
    phone: '',
    address: '',
    receiptHeader: '',
    receiptFooter: ''
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'Pharmacist',
    phone: '',
    branchId: ''
  });

  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    role: 'Pharmacist',
    branchId: '',
    isActive: true
  });

  const fetchBranches = useCallback(async () => {
    try {
      const res = await API.get('/tenants/branches');
      setBranches(res.data || []);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
      toast.error('Failed to load branch stores');
    }
  }, [toast]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get('/auth/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error('Failed to load staff roster');
    }
  }, [toast]);

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await API.get('/subscriptions/my-subscription');
      if (res.data) setSubscription(res.data.subscription || {});
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!isCompanyOwner) return;
    setLoading(true);
    await Promise.allSettled([fetchBranches(), fetchUsers(), fetchSubscription()]);
    setLoading(false);
  }, [isCompanyOwner, fetchBranches, fetchUsers, fetchSubscription]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Branch Action Handlers
  const handleOpenCreateBranch = () => {
    setBranchForm({
      name: '',
      code: '',
      phone: '',
      address: '',
      receiptHeader: 'Thank you for visiting!',
      receiptFooter: 'Get well soon!'
    });
    setShowBranchModal(true);
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/tenants/branches', branchForm);
      toast.success(`Branch store "${branchForm.name}" created successfully!`);
      setShowBranchModal(false);
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to onboard branch store');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditBranch = (b) => {
    setEditingBranch(b);
    setEditBranchForm({
      name: b.name || '',
      code: b.code || '',
      phone: b.phone || '',
      address: b.address || '',
      receiptHeader: b.receiptHeader || '',
      receiptFooter: b.receiptFooter || ''
    });
    setShowEditBranchModal(true);
  };

  const handleSaveEditBranch = async (e) => {
    e.preventDefault();
    if (!editingBranch) return;
    setSubmitting(true);
    try {
      await API.put(`/tenants/branches/${editingBranch._id}`, editBranchForm);
      toast.success(`Branch store "${editBranchForm.name}" updated successfully!`);
      setShowEditBranchModal(false);
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update branch store');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBranch = async (branchId, branchName) => {
    const confirmed = await toast.confirm({
      title: 'Delete Branch Store',
      message: `Are you sure you want to delete branch "${branchName}"? This action cannot be undone.`,
      confirmText: 'Delete Branch',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      await API.delete(`/tenants/branches/${branchId}`);
      toast.success(`Branch store "${branchName}" deleted.`);
      setShowEditBranchModal(false);
      fetchBranches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete branch store');
    }
  };

  // Staff User Action Handlers
  const handleOpenCreateUser = () => {
    setUserForm({
      name: '',
      email: '',
      password: 'password123',
      role: 'Pharmacist',
      phone: '',
      branchId: branches[0]?._id || ''
    });
    setShowUserModal(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/auth/register', userForm);
      toast.success(`Staff member "${userForm.name}" invited successfully!`);
      setShowUserModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setEditUserForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || 'Pharmacist',
      branchId: u.branch?._id || u.branch || '',
      isActive: u.isActive !== false
    });
    setShowEditUserModal(true);
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      await API.put(`/auth/users/${editingUser._id}`, editUserForm);
      toast.success(`Staff user "${editUserForm.name}" updated successfully!`);
      setShowEditUserModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update staff user');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isCompanyOwner) {
    return (
      <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12 shadow-2xl space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
          Access Restricted to Company Owner
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
          Multi-branch store administration and staff management can only be accessed by the Company Owner.
        </p>
      </div>
    );
  }

  const planMaxBranches =
    subscription?.planName === 'Starter'
      ? 1
      : subscription?.planName === 'Enterprise'
      ? 10
      : 3;

  const staffColumns = [
    {
      header: 'Staff Member',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0 text-xs">
            {row.name ? row.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
            {row.name}
          </span>
        </div>
      )
    },
    {
      header: 'Email Address',
      accessor: 'email',
      render: (row) => <span className="font-mono text-blue-400 text-xs">{row.email}</span>
    },
    {
      header: 'Assigned Role',
      accessor: 'role',
      render: (row) => {
        const roleVariant =
          row.role === 'Owner'
            ? 'purple'
            : row.role === 'Admin'
            ? 'info'
            : row.role === 'Pharmacist'
            ? 'success'
            : row.role === 'Branch Manager'
            ? 'warning'
            : 'neutral';
        return <Badge variant={roleVariant} size="sm">{row.role}</Badge>;
      }
    },
    {
      header: 'Assigned Branch',
      render: (row) => (
        <span className="text-slate-300 dark:text-slate-300 light:text-slate-700 text-xs">
          {row.branch?.name || 'All Branches'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => {
        const active = row.isActive !== false;
        return (
          <Badge variant={active ? 'success' : 'danger'} size="sm" dot>
            {active ? 'Active' : 'Suspended'}
          </Badge>
        );
      }
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenEditUser(row)}
          className="ml-auto"
        >
          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-5 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            Branch Stores & Staff Role Administration
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 mt-0.5">
            Current Plan:{' '}
            <span className="text-blue-400 font-bold">
              {subscription?.planName || 'Professional'}
            </span>{' '}
            ({branches.length} / {planMaxBranches} Branches Used)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {branches.length >= planMaxBranches ? (
            <Link to="/settings/subscription">
              <Button variant="warning" size="sm">
                <CreditCard className="w-4 h-4 mr-1.5" /> Upgrade Plan to Add Branch
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="sm" onClick={handleOpenCreateBranch}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Branch Location
            </Button>
          )}
          <Button variant="success" size="sm" onClick={handleOpenCreateUser}>
            <UserPlus className="w-4 h-4 mr-1.5" /> Invite Staff Member
          </Button>
        </div>
      </div>

      {/* Branch Stores Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-md font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
            Onboarded Branch Stores ({branches.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton.Card />
            <Skeleton.Card />
            <Skeleton.Card />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((b) => (
              <div
                key={b._id}
                className="bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-5 rounded-2xl shadow-lg space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 min-w-0">
                    <Store className="w-5 h-5 text-emerald-400 shrink-0" />
                    <h3 className="font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 text-sm truncate">
                      {b.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="info" size="sm">
                      {b.code}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditBranch(b)}
                      title="Edit Branch Store"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-400" />
                    </Button>
                    {!b.isHeadquarter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBranch(b._id, b.name)}
                        title="Delete Branch Store"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 space-y-1 pt-2 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
                  <div className="flex justify-between items-center">
                    <span>Phone: {b.phone || 'N/A'}</span>
                    {!b.isHeadquarter && (
                      <span className="flex items-center gap-1">
                        <StatusDot variant={b.isActive !== false ? "success" : "danger"} size="sm" /> 
                        {b.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    )}
                  </div>
                  <div className="truncate">Address: {b.address || 'N/A'}</div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/50">
                    <div className="bg-slate-800/30 p-1.5 rounded">
                      <div className="text-[10px] text-slate-500">Total Sales</div>
                      <div className="font-semibold text-slate-200">{b.metrics?.salesCount || 0}</div>
                    </div>
                    <div className="bg-slate-800/30 p-1.5 rounded">
                      <div className="text-[10px] text-slate-500">Revenue</div>
                      <div className="font-semibold text-emerald-400">${b.metrics?.revenue || 0}</div>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="neutral" size="sm"><UserCheck className="w-3 h-3 mr-1 inline" /> {b.metrics?.staffCount || 0} Staff Assigned</Badge>
                  </div>

                  {b.isHeadquarter && (
                    <div className="text-amber-400 font-bold text-[10px] flex items-center gap-1 mt-1">
                      <StatusDot variant="warning" size="sm" /> Main Headquarter
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staff Roster Table */}
      <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl p-5 shadow-xl space-y-4">
        <h2 className="text-md font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
          Staff Members & Assigned Roles ({users.length})
        </h2>

        {loading ? (
          <Skeleton.Table rows={5} columns={6} />
        ) : (
          <DataTable
            columns={staffColumns}
            data={users}
            searchable={true}
            searchPlaceholder="Search staff member, email, or role..."
            pagination={true}
            pageSize={10}
            emptyMessage="No staff members onboarded yet."
          />
        )}
      </div>

      {/* MODAL 1: ADD BRANCH */}
      <Modal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        title="Onboard New Branch Store"
        description="Register a new retail branch location under your pharmacy organization"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBranchModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateBranch}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Branch'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateBranch} className="space-y-3">
          <Input
            label="Branch Name"
            required
            value={branchForm.name}
            onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
            placeholder="HealthCare Downtown Branch"
          />

          <Input
            label="Branch Code (Unique)"
            required
            value={branchForm.code}
            onChange={(e) =>
              setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })
            }
            placeholder="BR-02"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              required
              value={branchForm.phone}
              onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
              placeholder="+1 555 0199"
            />
            <Input
              label="Address"
              required
              value={branchForm.address}
              onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
              placeholder="Downtown Plaza"
            />
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT BRANCH */}
      <Modal
        isOpen={showEditBranchModal}
        onClose={() => setShowEditBranchModal(false)}
        title="Edit Branch Store Details"
        size="md"
        footer={
          <>
            {editingBranch && !editingBranch.isHeadquarter && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteBranch(editingBranch._id, editingBranch.name)}
                className="mr-auto"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Branch
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditBranchModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEditBranch}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Branch'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEditBranch} className="space-y-3">
          <Input
            label="Branch Name"
            required
            value={editBranchForm.name}
            onChange={(e) =>
              setEditBranchForm({ ...editBranchForm, name: e.target.value })
            }
          />

          <Input
            label="Branch Code"
            required
            value={editBranchForm.code}
            onChange={(e) =>
              setEditBranchForm({ ...editBranchForm, code: e.target.value.toUpperCase() })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              required
              value={editBranchForm.phone}
              onChange={(e) =>
                setEditBranchForm({ ...editBranchForm, phone: e.target.value })
              }
            />
            <Input
              label="Address"
              required
              value={editBranchForm.address}
              onChange={(e) =>
                setEditBranchForm({ ...editBranchForm, address: e.target.value })
              }
            />
          </div>
        </form>
      </Modal>

      {/* MODAL 3: INVITE STAFF */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="Invite New Staff Member"
        description="Create account credentials and assign RBAC role permissions."
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUserModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleCreateUser}
              disabled={submitting}
            >
              {submitting ? 'Inviting...' : 'Create User'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-3">
          <Input
            label="Full Name"
            required
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            placeholder="Dr. Alex Rivera"
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            placeholder="alex@pharmacy.com"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="System Role"
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              options={[
                { value: 'Admin', label: 'Admin' },
                { value: 'Pharmacist', label: 'Pharmacist' },
                { value: 'Cashier', label: 'Cashier' },
                { value: 'Inventory Manager', label: 'Inventory Manager' },
                { value: 'Branch Manager', label: 'Branch Manager' }
              ]}
            />

            <Select
              label="Assign Branch Location"
              value={userForm.branchId}
              onChange={(e) => setUserForm({ ...userForm, branchId: e.target.value })}
              options={[
                { value: '', label: 'All Branches' },
                ...branches.map((b) => ({ value: b._id, label: b.name }))
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* MODAL 4: EDIT STAFF MEMBER */}
      <Modal
        isOpen={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        title="Edit Staff Member Details"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditUserModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEditUser}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Staff Member'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEditUser} className="space-y-3">
          <Input
            label="Full Name"
            required
            value={editUserForm.name}
            onChange={(e) =>
              setEditUserForm({ ...editUserForm, name: e.target.value })
            }
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={editUserForm.email}
            onChange={(e) =>
              setEditUserForm({ ...editUserForm, email: e.target.value })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="System Role"
              value={editUserForm.role}
              onChange={(e) =>
                setEditUserForm({ ...editUserForm, role: e.target.value })
              }
              options={[
                { value: 'Owner', label: 'Owner' },
                { value: 'Admin', label: 'Admin' },
                { value: 'Pharmacist', label: 'Pharmacist' },
                { value: 'Cashier', label: 'Cashier' },
                { value: 'Inventory Manager', label: 'Inventory Manager' },
                { value: 'Branch Manager', label: 'Branch Manager' }
              ]}
            />

            <Select
              label="Assign Branch Location"
              value={editUserForm.branchId}
              onChange={(e) =>
                setEditUserForm({ ...editUserForm, branchId: e.target.value })
              }
              options={[
                { value: '', label: 'All Branches' },
                ...branches.map((b) => ({ value: b._id, label: b.name }))
              ]}
            />
          </div>

          <Select
            label="Account Status"
            value={editUserForm.isActive ? 'true' : 'false'}
            onChange={(e) =>
              setEditUserForm({ ...editUserForm, isActive: e.target.value === 'true' })
            }
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Suspended / Inactive' }
            ]}
          />
        </form>
      </Modal>
    </div>
  );
};

export default BranchUserManagement;
