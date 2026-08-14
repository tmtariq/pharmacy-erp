import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  MapPin, Search, RefreshCw, Eye, ShieldCheck,
  Building2, Users, Layers, DollarSign, CheckCircle2,
  XCircle, ChevronLeft, ChevronRight, Activity, Clock
} from 'lucide-react';
import { useToast } from '../ui';

export default function BranchManager() {
  const toast = useToast();
  const [branches, setBranches] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchBranches = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      const res = await API.get('/saas-admin/branches', {
        headers: getAdminHeaders(),
        params
      });
      setBranches(res.data.branches || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch {
      toast.error('Failed to load company branches');
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders, search, statusFilter, toast]);

  useEffect(() => {
    fetchBranches(1);
  }, [fetchBranches]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Toolbar */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              SaaS Cross-Company Branch Outlets Directory
            </h3>
            <p className="text-xs text-slate-400">
              Audit and inspect branch locations, managers, user counts, SKU allocations, and live POS sales volume.
            </p>
          </div>

          <button
            onClick={() => fetchBranches(1)}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer self-start sm:self-auto"
            title="Refresh Branches"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Branch Name, ID/Code, Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-semibold"
            >
              <option value="all">All Branch Statuses</option>
              <option value="active">Active Dispensaries</option>
              <option value="suspended">Suspended Branches</option>
              <option value="closed">Closed Outlets</option>
            </select>
          </div>

        </div>

        {/* 2. 8-Column Branches Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Branch Name</th>
                <th className="px-4 py-3.5">Branch ID / Code</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Manager</th>
                <th className="px-4 py-3.5">Number of Users</th>
                <th className="px-4 py-3.5">Number of Medicines</th>
                <th className="px-4 py-3.5">Sales</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-400 mb-2" />
                    Loading branches directory...
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No pharmacy branch outlets found matching your query.
                  </td>
                </tr>
              ) : (
                branches.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/30 transition">
                    
                    {/* Branch Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white block">{b.name}</span>
                        {b.isHeadquarter && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold">
                            HQ
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{b.companyName}</span>
                    </td>

                    {/* Branch ID */}
                    <td className="px-4 py-3 font-mono font-bold text-indigo-300">
                      {b.code}
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate" title={b.address}>
                      {b.address}
                    </td>

                    {/* Manager */}
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-200 block">{b.managerName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{b.managerEmail}</span>
                    </td>

                    {/* Number of Users */}
                    <td className="px-4 py-3 font-mono font-bold text-purple-300">
                      {b.userCount} staff
                    </td>

                    {/* Number of Medicines */}
                    <td className="px-4 py-3 font-mono text-emerald-400">
                      {b.medicineCount.toLocaleString()} SKUs
                    </td>

                    {/* Sales */}
                    <td className="px-4 py-3 font-mono font-black text-white">
                      ${b.salesTotal.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {b.status === 'active' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-amber-400" /> {b.status}
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Total Branches: <strong>{pagination.total}</strong></span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchBranches(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {pagination.page} of {pagination.pages || 1}</span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchBranches(pagination.page + 1)}
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
