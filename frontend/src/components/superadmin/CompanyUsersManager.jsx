import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  Users, Search, RefreshCw, KeyRound, ShieldAlert,
  Building2, MapPin, CheckCircle2, XCircle, Clock,
  ChevronLeft, ChevronRight, UserCheck, UserX, Send,
  ShieldCheck, Lock, Unlock, Mail, Phone, Filter
} from 'lucide-react';
import { useToast } from '../ui';

export default function CompanyUsersManager() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Reset Password Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      const res = await API.get('/saas-admin/users', {
        headers: getAdminHeaders(),
        params
      });
      setUsers(res.data.users || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch {
      toast.error('Failed to load company staff users');
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders, search, roleFilter, statusFilter, toast]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleOpenResetModal = (u) => {
    setSelectedUser(u);
    setShowResetModal(true);
  };

  const handleSendResetLink = async () => {
    setSubmitting(true);
    try {
      const res = await API.post(`/saas-admin/users/${selectedUser._id}/reset-password`, {}, {
        headers: getAdminHeaders()
      });
      toast.success(res.data?.message || 'Password reset link dispatched!');
      setShowResetModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch reset link');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (u) => {
    try {
      const res = await API.post(`/saas-admin/users/${u._id}/toggle-status`, {}, {
        headers: getAdminHeaders()
      });
      toast.success(res.data?.message || 'User status updated');
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Company Owner':
      case 'Owner':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30 font-black';
      case 'Branch Manager':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold';
      case 'Pharmacist':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold';
      case 'Inventory Manager':
      case 'Inventory Staff':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-semibold';
      case 'Accountant':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-semibold';
      case 'Sales Staff':
      case 'Cashier':
        return 'bg-slate-800 text-slate-300 border-slate-700 font-medium';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never';
  const formatDateTime = (d) => d ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Toolbar */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              SaaS Cross-Company Staff Directory & Support
            </h3>
            <p className="text-xs text-slate-400">
              Inspect tenant users, manage staff access status, and trigger secure verification flows without exposing raw passwords.
            </p>
          </div>

          <button
            onClick={() => fetchUsers(1)}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer self-start sm:self-auto"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Name, Email, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="all">All Company Staff Roles</option>
              <option value="Company Owner">Company Owner</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Inventory Manager">Inventory Manager</option>
              <option value="Sales Staff">Sales Staff</option>
              <option value="Cashier">Cashier</option>
              <option value="Accountant">Accountant</option>
            </select>
          </div>

          {/* Account Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="all">All Account Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="inactive">Deactivated Accounts</option>
              <option value="locked">Brute Force Locked</option>
            </select>
          </div>

        </div>

        {/* 2. 8-Column Company Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Email Address</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Company</th>
                <th className="px-4 py-3.5">Branch</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-4 py-3.5">Last Login</th>
                <th className="px-4 py-3.5">Created Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-400 mb-2" />
                    Loading staff directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    No company staff accounts found matching your filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition">
                    
                    {/* Name */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-white block">{u.name}</span>
                      <span className="text-[10px] text-slate-500">ID: {u._id.slice(-6)}</span>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {u.email}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] border ${getRoleBadgeClass(u.role)}`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-white block">{u.companyName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{u.companyCode}</span>
                    </td>

                    {/* Branch */}
                    <td className="px-4 py-3">
                      <span className="text-slate-300 block">{u.branchName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{u.branchCode}</span>
                    </td>

                    {/* Account Status */}
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-300 border border-red-500/30 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3 text-red-400" /> Deactivated
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {formatDateTime(u.lastLogin)}
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {formatDate(u.createdDate)}
                    </td>

                    {/* Actions: Send Reset Link, Toggle Active */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Secure Reset Flow (Zero Password Exposure) */}
                        <button
                          onClick={() => handleOpenResetModal(u)}
                          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg transition cursor-pointer text-[11px] font-semibold flex items-center gap-1"
                          title="Trigger Secure Password Reset Link"
                        >
                          <KeyRound className="w-3 h-3" /> Reset Link
                        </button>

                        {/* Toggle Account Status */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            u.isActive
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                          title={u.isActive ? 'Deactivate Staff Account' : 'Reactivate Staff Account'}
                        >
                          {u.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Total Staff Accounts: <strong>{pagination.total}</strong></span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {pagination.page} of {pagination.pages || 1}</span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* SECURE PASSWORD RESET INVITATION MODAL */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                Dispatch Secure Password Reset
              </h3>
              <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block">Target Staff User:</span>
                <span className="font-bold text-white text-sm">{selectedUser.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Registered Email:</span>
                <span className="font-mono text-indigo-300 font-bold">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Assigned Pharmacy:</span>
                <span className="text-slate-300 font-semibold">{selectedUser.companyName} ({selectedUser.branchName})</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-[11px] text-indigo-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Passwords are <strong>never shown or handled in plaintext</strong>. An encrypted single-use verification token will be dispatched directly to the staff member.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSendResetLink}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-lg shadow-indigo-600/20 text-xs"
              >
                {submitting ? 'Dispatching...' : 'Confirm & Send Reset Link'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
