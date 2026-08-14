import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Search, Filter, Plus, Clock, Lock,
  Unlock, Trash2, Edit3, Eye, ShieldCheck,
  Calendar, Phone, Mail, User, CheckCircle2,
  AlertTriangle, XCircle, ChevronRight, Download,
  ExternalLink
} from 'lucide-react';

export default function SuperAdminCompanyTable({
  companies = [],
  loading = false,
  onOpenCreate,
  onToggleSuspend,
  onRenew,
  onDelete
}) {
  const navigate = useNavigate();
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, pending, trial, suspended, expired, cancelled, rejected
  const [planFilter, setPlanFilter] = useState('all'); // all, Starter, Professional, Enterprise, Unlimited
  const [regDateSort, setRegDateSort] = useState('desc'); // desc, asc
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Multi-Field Search & Granular Filtering
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((item) => {
        // 1. Search Query Match (Company Name, ID/Code, Owner Name, Owner Email, Phone)
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.companyName?.toLowerCase().includes(q) ||
          item.companyId?.toLowerCase().includes(q) ||
          item.owner?.name?.toLowerCase().includes(q) ||
          item.owner?.email?.toLowerCase().includes(q) ||
          item.phone?.toLowerCase().includes(q) ||
          item.owner?.phone?.toLowerCase().includes(q);

        if (!matchesSearch) return false;

        // 2. Status Filter
        if (statusFilter !== 'all') {
          const cStatus = (item.companyStatus || '').toLowerCase();
          const sStatus = (item.subscriptionStatus || '').toLowerCase();
          const target = statusFilter.toLowerCase();

          if (target === 'active' && !(cStatus === 'active' && sStatus === 'active')) return false;
          if (target === 'pending' && !(cStatus === 'pending' || sStatus === 'pending')) return false;
          if (target === 'trial' && !(item.plan === 'Starter' || sStatus === 'trial')) return false;
          if (target === 'suspended' && !(cStatus === 'suspended' || sStatus === 'suspended')) return false;
          if (target === 'expired' && sStatus !== 'expired') return false;
          if (target === 'cancelled' && sStatus !== 'cancelled' && sStatus !== 'canceled') return false;
          if (target === 'rejected' && cStatus !== 'rejected') return false;
        }

        // 3. Subscription Plan Filter
        if (planFilter !== 'all') {
          if (item.plan !== planFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.registrationDate || 0).getTime();
        const dateB = new Date(b.registrationDate || 0).getTime();
        return regDateSort === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [companies, searchTerm, statusFilter, planFilter, regDateSort]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (companyStatus, subscriptionStatus) => {
    if (companyStatus === 'suspended' || subscriptionStatus === 'suspended') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-[11px] font-semibold">
          <Lock className="w-3 h-3" /> Suspended
        </span>
      );
    }
    if (subscriptionStatus === 'expired') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[11px] font-semibold">
          <AlertTriangle className="w-3 h-3" /> Expired
        </span>
      );
    }
    if (companyStatus === 'pending' || subscriptionStatus === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-semibold">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
        <CheckCircle2 className="w-3 h-3" /> Active
      </span>
    );
  };

  const getPlanBadge = (plan) => {
    switch (plan) {
      case 'Enterprise':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Unlimited':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'Starter':
        return 'bg-slate-700/30 text-slate-300 border-slate-600/40';
      default:
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-4 font-sans">
      
      {/* Top Search & Filter Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3 backdrop-blur-md">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Multi-field Search */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Company Name, ID, Owner, Email, Phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Plan Dropdown */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-500"
            >
              <option value="all">All Plan Tiers</option>
              <option value="Starter">Starter</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Unlimited">Unlimited</option>
            </select>

            {/* Registration Date Sort */}
            <button
              onClick={() => setRegDateSort(regDateSort === 'desc' ? 'asc' : 'desc')}
              className="bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl px-3 py-2 text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Sort by Registration Date"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Reg Date: {regDateSort === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>

            {/* Provision Button */}
            <button
              onClick={onOpenCreate}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </button>

          </div>

        </div>

        {/* Active Filter Chips & Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <span>Showing <strong className="text-white">{filteredCompanies.length}</strong> of {companies.length} companies</span>
          {(statusFilter !== 'all' || planFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => { setStatusFilter('all'); setPlanFilter('all'); setSearchTerm(''); }}
              className="text-purple-400 hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>

      </div>

      {/* Comprehensive 15-Column Enterprise Company Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Company Name & ID</th>
                <th className="px-4 py-3.5">Owner & Contact</th>
                <th className="px-4 py-3.5">Subscription Plan</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-3 py-3.5 text-center">Branches</th>
                <th className="px-3 py-3.5 text-center">Users</th>
                <th className="px-4 py-3.5">Registered</th>
                <th className="px-4 py-3.5">Start Date</th>
                <th className="px-4 py-3.5">Expiry Date</th>
                <th className="px-4 py-3.5">Last Activity</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-12 text-slate-400">Loading company directory...</td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-12 text-slate-400">
                    No matching pharmacy companies found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition group">
                    
                    {/* 1. Company Name & ID */}
                    <td className="px-4 py-3.5">
                      <div
                        onClick={() => navigate(`/saas-admin/company/${item._id}`)}
                        className="font-bold text-white text-sm flex items-center gap-1.5 hover:text-purple-400 cursor-pointer transition"
                      >
                        <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>{item.companyName}</span>
                      </div>
                      <div className="text-[11px] font-mono text-purple-300 font-semibold tracking-wider">
                        ID: {item.companyId}
                      </div>
                    </td>

                    {/* 2. Owner & Contact (Email + Phone) */}
                    <td className="px-4 py-3.5">
                      <div className="text-slate-200 font-medium">{item.owner?.name || 'Unassigned'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.owner?.email}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.phone || item.owner?.phone}</div>
                    </td>

                    {/* 3. Subscription Plan */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getPlanBadge(item.plan)}`}>
                        {item.plan}
                      </span>
                    </td>

                    {/* 4. Company & Subscription Status */}
                    <td className="px-4 py-3.5">
                      {getStatusBadge(item.companyStatus, item.subscriptionStatus)}
                    </td>

                    {/* 5. Number of Branches */}
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-200">
                      {item.branchCount || 1}
                    </td>

                    {/* 6. Number of Users */}
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-200">
                      {item.userCount || 1}
                    </td>

                    {/* 7. Registration Date */}
                    <td className="px-4 py-3.5 font-mono text-slate-400">
                      {formatDate(item.registrationDate)}
                    </td>

                    {/* 8. Subscription Start */}
                    <td className="px-4 py-3.5 font-mono text-slate-400">
                      {formatDate(item.subscriptionStartDate)}
                    </td>

                    {/* 9. Subscription Expiry */}
                    <td className="px-4 py-3.5 font-mono">
                      <span className={item.remainingDays <= 5 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                        {formatDate(item.subscriptionExpiryDate)}
                      </span>
                      <div className="text-[10px] text-slate-500">{item.remainingDays} days left</div>
                    </td>

                    {/* 10. Last Activity */}
                    <td className="px-4 py-3.5">
                      <div className="text-slate-300 font-mono text-[11px]">{formatDateTime(item.lastActivityAt)}</div>
                      <div className="text-[10px] text-slate-500">{item.lastActivityAction}</div>
                    </td>

                    {/* 11. Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Detail Center Trigger */}
                        <button
                          onClick={() => navigate(`/saas-admin/company/${item._id}`)}
                          className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg transition cursor-pointer"
                          title="Open Company Management Center"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Suspend / Activate Toggle */}
                        <button
                          onClick={() => onToggleSuspend(item._id)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            item.companyStatus === 'suspended' || item.subscriptionStatus === 'suspended'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                          title={item.companyStatus === 'suspended' ? 'Reactivate Company' : 'Suspend Company'}
                        >
                          {item.companyStatus === 'suspended' || item.subscriptionStatus === 'suspended' ? (
                            <Unlock className="w-3.5 h-3.5" />
                          ) : (
                            <Lock className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Renew 30 Days */}
                        <button
                          onClick={() => onRenew(item._id)}
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg transition cursor-pointer"
                          title="Renew 30 Days"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>

                        {/* Purge Company */}
                        <button
                          onClick={() => onDelete(item._id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition cursor-pointer"
                          title="Purge Company"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL COMPANY DETAIL DRAWER / MODAL */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  🏢
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedCompany.companyName}</h3>
                  <p className="text-xs font-mono text-purple-400">Company ID: {selectedCompany.companyId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Owner Name</span>
                <span className="font-bold text-white mt-0.5 block">{selectedCompany.owner?.name}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Owner Email</span>
                <span className="font-mono text-slate-200 mt-0.5 block">{selectedCompany.owner?.email}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Contact Phone</span>
                <span className="font-mono text-slate-200 mt-0.5 block">{selectedCompany.phone || selectedCompany.owner?.phone}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Subscription Plan</span>
                <span className="font-bold text-purple-400 mt-0.5 block">{selectedCompany.plan}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Total Branches</span>
                <span className="font-bold text-white mt-0.5 block">{selectedCompany.branchCount} outlets</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Total Staff Accounts</span>
                <span className="font-bold text-white mt-0.5 block">{selectedCompany.userCount} users</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Registration Date:</span>
                <span className="text-white font-mono">{formatDate(selectedCompany.registrationDate)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Subscription Expiry:</span>
                <span className="text-emerald-400 font-mono">{formatDate(selectedCompany.subscriptionExpiryDate)} ({selectedCompany.remainingDays} days remaining)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Last System Activity:</span>
                <span className="text-slate-300 font-mono">{formatDateTime(selectedCompany.lastActivityAt)} ({selectedCompany.lastActivityAction})</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
