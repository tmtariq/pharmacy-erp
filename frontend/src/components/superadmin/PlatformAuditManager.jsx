import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  FileSpreadsheet, Search, RefreshCw, Eye, Calendar,
  ShieldCheck, Building2, User, Layers, DollarSign,
  Activity, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useToast } from '../ui';

export default function PlatformAuditManager() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [adminFilter, setAdminFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        admin: adminFilter.trim() || undefined,
        company: companyFilter.trim() || undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        module: moduleFilter !== 'all' ? moduleFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };
      const res = await API.get('/saas-admin/audit-logs', {
        headers: getAdminHeaders(),
        params
      });
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch {
      toast.error('Failed to load platform audit logs');
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders, adminFilter, companyFilter, actionFilter, moduleFilter, startDate, endDate, toast]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  // Export to CSV Functionality
  const exportToCSV = () => {
    if (logs.length === 0) {
      toast.error('No logs available to export.');
      return;
    }
    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Target', 'Target ID', 'Old Value', 'New Value', 'Reason', 'IP Address'];
    const rows = logs.map(log => [
      new Date(log.createdAt).toISOString(),
      log.actor?.name || 'System',
      log.actor?.role || 'System',
      log.action,
      log.target,
      log.targetId || '',
      log.oldValue || '',
      log.newValue || '',
      log.reason || '',
      log.ipAddress || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `saas_platform_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit Log exported to CSV successfully');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Toolbar */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              SaaS Platform Immutable Audit Logs Directory
            </h3>
            <p className="text-xs text-slate-400">
              Complete chronological audit trail recording logins, approvals, subscription modifications, support sessions, and payment verifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => fetchLogs(1)}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer"
              title="Refresh Audit Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          
          {/* Search Admin */}
          <div>
            <label className="block text-[10px] text-slate-400 font-bold mb-1">Actor (Admin Name)</label>
            <input
              type="text"
              placeholder="e.g. Saad Super Admin"
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white placeholder-slate-650 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Search Company / Target ID */}
          <div>
            <label className="block text-[10px] text-slate-400 font-bold mb-1">Company / Target ID</label>
            <input
              type="text"
              placeholder="e.g. ABC01"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white placeholder-slate-650 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-[10px] text-slate-400 font-bold mb-1">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
            >
              <option value="all">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="FAILED_LOGIN">Failed Login</option>
              <option value="COMPANY_APPROVAL">Company Approval</option>
              <option value="COMPANY_REJECTION">Company Rejection</option>
              <option value="COMPANY_SUSPENSION">Company Suspension</option>
              <option value="COMPANY_REACTIVATION">Company Reactivation</option>
              <option value="PLAN_CHANGE">Plan Change</option>
              <option value="SUBSCRIPTION_EXTENSION">Subscription Extension</option>
              <option value="PAYMENT_VERIFICATION">Payment Verification</option>
              <option value="REFUND">Refund</option>
              <option value="INVOICE_ACTION">Invoice Action</option>
              <option value="USER_CHANGES">User Changes</option>
              <option value="FEATURE_CHANGES">Feature Changes</option>
              <option value="SUPPORT_ACCESS">Support Access</option>
              <option value="PLATFORM_SETTINGS_CHANGED">Settings Changes</option>
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <label className="block text-[10px] text-slate-400 font-bold mb-1">Module</label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
            >
              <option value="all">All Modules</option>
              <option value="Authentication">Authentication</option>
              <option value="Company Management">Company Management</option>
              <option value="Billing">Billing</option>
              <option value="Refunds">Refunds</option>
              <option value="Security">Security</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[10px] text-slate-400 font-bold mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] text-slate-400 font-bold mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
            />
          </div>

        </div>

        {/* 2. Audit Trail Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Actor (Admin)</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Module</th>
                <th className="px-4 py-3.5">Target</th>
                <th className="px-4 py-3.5">Target ID</th>
                <th className="px-4 py-3.5">Reason / Description</th>
                <th className="px-4 py-3.5">IP Address</th>
                <th className="px-4 py-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-400 mb-2" />
                    Loading audit directory...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No platform audit logs found matching your query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition">
                    
                    {/* Actor Details */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white block">{log.actor?.name}</span>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-semibold uppercase">{log.actor?.role}</span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>

                    {/* Module */}
                    <td className="px-4 py-3 font-semibold text-slate-300">
                      {log.module}
                    </td>

                    {/* Target */}
                    <td className="px-4 py-3 font-semibold text-slate-300">
                      {log.target}
                    </td>

                    {/* Target ID */}
                    <td className="px-4 py-3 font-mono font-bold text-purple-300">
                      {log.targetId || '—'}
                    </td>

                    {/* Reason / Details */}
                    <td className="px-4 py-3 max-w-[280px] truncate" title={log.reason}>
                      {log.reason || 'SaaS System administrative event'}
                    </td>

                    {/* IP Address */}
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {log.ipAddress || '::1 (Localhost)'}
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Total Records: <strong>{pagination.total}</strong></span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchLogs(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {pagination.page} of {pagination.pages || 1}</span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchLogs(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
