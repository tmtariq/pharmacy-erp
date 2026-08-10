import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { Users, UserPlus, Clock, Search, CheckCircle2, Activity, Key, LogIn, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button, Input, Select, Card, Badge, Modal, DataTable, Skeleton, useToast } from '../components/ui';
import { ROLE_COLORS } from '../constants/roles';
import { PERMISSION_TREE } from '../constants/permissionTree';

const EmployeeManagement = () => {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ totalStaff: 0, activeStaff: 0, morningShift: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Cashier',
    shift: 'Morning',
    salary: 2500
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [showActivity, setShowActivity] = useState(false);
  const [showLogins, setShowLogins] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [userLogs, setUserLogs] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);

  const handleToggleStatus = async (emp) => {
    try {
      await API.put(`/auth/users/${emp._id || emp.id}`, { isActive: !emp.isActive });
      toast.success(`User status updated.`);
      fetchEmployees();
    } catch(err) {
      toast.error('Failed to update status');
    }
  };

  const openActivity = async (emp) => {
    setSelectedUser(emp);
    try {
      const res = await API.get(`/reports/audit-logs?userId=${emp._id || emp.id}`);
      setUserLogs(res.data || []);
      setShowActivity(true);
    } catch(e) {
      toast.error('Failed to load activity');
    }
  };

  const openLogins = async (emp) => {
    setSelectedUser(emp);
    try {
      const res = await API.get(`/auth/login-history?userId=${emp._id || emp.id}`);
      setLoginHistory(res.data || []);
      setShowLogins(true);
    } catch(e) {
      toast.error('Failed to load logins');
    }
  };

  const openReset = (emp) => {
    setSelectedUser(emp);
    setTempPassword('');
    setShowReset(true);
  };

  const handleResetPassword = async () => {
    try {
      await API.post('/auth/forgot-password', { email: selectedUser.email });
      setTempPassword('TempPass123!');
      toast.success('Password reset email sent');
    } catch(err) {
      toast.error('Failed to reset password');
    }
  };

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/employees');
      setEmployees(res.data.employees || []);
      setStats(res.data.stats || { totalStaff: 0, activeStaff: 0, morningShift: 0 });
    } catch (err) {
      console.error('Failed to load employees:', err);
      toast.error('Failed to load employee roster.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await API.post('/employees', formData);
      toast.success(`Staff member "${formData.name}" added successfully!`);
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', role: 'Cashier', shift: 'Morning', salary: 2500 });
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Top Header Bar */}
      <Card variant="glass" className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Employee Management & Staff Shift Operations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage pharmacy staff roster, shift schedules, roles, and branch assignments</p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={UserPlus}
          onClick={() => setShowAddModal(true)}
          className="shadow-lg shadow-blue-500/20"
        >
          Add New Staff
        </Button>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Staff Roster</p>
            <p className="text-2xl font-bold text-white">{stats.totalStaff}</p>
          </div>
        </Card>

        <Card variant="glass" className="p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Active Staff</p>
            <p className="text-2xl font-bold text-white">{stats.activeStaff}</p>
          </div>
        </Card>

        <Card variant="glass" className="p-5 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Morning Shift Staff</p>
            <p className="text-2xl font-bold text-white">{stats.morningShift}</p>
          </div>
        </Card>
      </div>

      {/* Search Input */}
      <Input
        type="text"
        leftIcon={Search}
        placeholder="Search employees by name, email, or role..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />

      {/* Staff Table */}
      <Card variant="glass" className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <Skeleton.Table rows={5} columns={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <th className="p-4">Employee Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Shift Schedule</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Base Salary</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">No employees found.</td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp._id || emp.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-medium text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">{emp.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={ROLE_COLORS?.[emp.role] || "info"} size="sm">{emp.role}</Badge>
                      </td>
                      <td className="p-4 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          {emp.shift}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{emp.phone || 'N/A'}</td>
                      <td className="p-4 font-semibold text-emerald-400">${emp.salary}</td>
                      <td className="p-4">
                        <button onClick={() => handleToggleStatus(emp)} className="flex items-center gap-1">
                          {emp.isActive !== false ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                          <span className={emp.isActive !== false ? "text-emerald-400 text-xs" : "text-slate-500 text-xs"}>{emp.isActive !== false ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openActivity(emp)} title="View Activity">
                          <Activity className="w-4 h-4 text-blue-400" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openLogins(emp)} title="Login History">
                          <LogIn className="w-4 h-4 text-amber-400" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openReset(emp)} title="Reset Password">
                          <Key className="w-4 h-4 text-rose-400" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Staff Member"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@pharmacy.com"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'Cashier', label: 'Cashier' },
                { value: 'Pharmacist', label: 'Pharmacist' },
                { value: 'Manager', label: 'Manager' },
                { value: 'Inventory Staff', label: 'Inventory Staff' },
                { value: 'Delivery Staff', label: 'Delivery Staff' }
              ]}
            />

            <Select
              label="Shift"
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              options={[
                { value: 'Morning', label: 'Morning' },
                { value: 'Evening', label: 'Evening' },
                { value: 'Night', label: 'Night' },
                { value: 'Flexible', label: 'Flexible' }
              ]}
            />
          </div>

          {/* Granular Permission Tree Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200">
                Granular Permissions ({formData.permissions?.length || 0} selected)
              </label>
              <span className="text-[11px] text-[#72D6C1]">Custom Access Rules</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 bg-slate-950/80 rounded-xl border border-slate-800">
              {Object.entries(PERMISSION_TREE).map(([groupKey, group]) => (
                <div key={groupKey} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                  <span className="text-xs font-bold text-slate-200 block border-b border-slate-800 pb-1">
                    {group.label}
                  </span>
                  <div className="space-y-1">
                    {group.permissions.map((perm) => {
                      const isChecked = (formData.permissions || []).includes(perm.key);
                      return (
                        <label key={perm.key} className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer hover:text-white">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const curr = formData.permissions || [];
                              const next = e.target.checked
                                ? [...curr, perm.key]
                                : curr.filter((k) => k !== perm.key);
                              setFormData({ ...formData, permissions: next });
                            }}
                            className="mt-0.5 rounded border-slate-700 text-[#0B5E8E] focus:ring-0"
                          />
                          <div>
                            <span className="font-mono text-[10px] text-[#72D6C1] block">{perm.key}</span>
                            <span className="text-slate-400 text-[10px]">{perm.label}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
            >
              Save Employee
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showActivity} onClose={() => setShowActivity(false)} title={`Activity Logs: ${selectedUser?.name}`} size="lg">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {userLogs.length === 0 ? <p className="text-slate-400">No activity logs found.</p> : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead><tr className="border-b border-slate-700"><th className="pb-2">Action</th><th className="pb-2">Module</th><th className="pb-2">Details</th><th className="pb-2">Time</th></tr></thead>
              <tbody>
                {userLogs.slice(0, 20).map((log, i) => (
                  <tr key={i} className="border-b border-slate-800/50"><td className="py-2">{log.action}</td><td className="py-2">{log.module}</td><td className="py-2">{log.details}</td><td className="py-2">{new Date(log.timestamp).toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>

      <Modal isOpen={showLogins} onClose={() => setShowLogins(false)} title={`Login History: ${selectedUser?.name}`} size="lg">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loginHistory.length === 0 ? <p className="text-slate-400">No login history found.</p> : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead><tr className="border-b border-slate-700"><th className="pb-2">Date/Time</th><th className="pb-2">IP Address</th><th className="pb-2">Device/Browser</th><th className="pb-2">Status</th></tr></thead>
              <tbody>
                {loginHistory.map((log, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="py-2">{new Date(log.timestamp).toLocaleString()}</td><td className="py-2">{log.ipAddress}</td><td className="py-2">{log.device}</td>
                    <td className="py-2"><Badge variant={log.status === 'success' ? 'success' : log.status === 'failed' ? 'danger' : 'warning'} size="sm">{log.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>

      <Modal isOpen={showReset} onClose={() => setShowReset(false)} title="Reset Password" size="sm">
        <div className="space-y-4 text-sm text-slate-300">
          <p>Are you sure you want to reset the password for {selectedUser?.name}?</p>
          {tempPassword && (
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl text-center">
              <p className="text-slate-400 text-xs mb-1">Temporary Password</p>
              <p className="font-mono text-lg text-emerald-400">{tempPassword}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setShowReset(false)}>Close</Button>
            {!tempPassword && <Button variant="primary" size="sm" onClick={handleResetPassword}>Generate New Password</Button>}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeManagement;
