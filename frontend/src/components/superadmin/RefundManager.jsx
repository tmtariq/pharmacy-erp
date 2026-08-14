import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  RotateCcw, Search, RefreshCw, CheckCircle2, XCircle,
  Clock, AlertTriangle, ShieldCheck, Filter, ChevronLeft,
  ChevronRight, ArrowUpRight, FileText, Check, Ban,
  CreditCard, Sparkles, Building2
} from 'lucide-react';
import { useToast } from '../ui';

export default function RefundManager() {
  const toast = useToast();
  const [refunds, setRefunds] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');

  // Decision Modal State
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionAction, setDecisionAction] = useState('approve_and_process'); // approve_and_process | reject_refund | mark_processing | retry_provider
  const [rejectionReason, setRejectionReason] = useState('Terms and conditions guarantee period expired');
  const [internalNote, setInternalNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchRefunds = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        provider: providerFilter !== 'all' ? providerFilter : undefined
      };
      const res = await API.get('/saas-admin/refunds', {
        headers: getAdminHeaders(),
        params
      });
      setRefunds(res.data.refunds || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch {
      toast.error('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders, search, statusFilter, providerFilter, toast]);

  useEffect(() => {
    fetchRefunds(1);
  }, [fetchRefunds]);

  const handleOpenDecision = (refund, action = 'approve_and_process') => {
    setSelectedRefund(refund);
    setDecisionAction(action);
    setRejectionReason('Terms and conditions guarantee period expired');
    setInternalNote(refund.internalAdminNotes || '');
    setShowDecisionModal(true);
  };

  const handleExecuteDecision = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post(`/saas-admin/refunds/${selectedRefund.refundId}/decision`, {
        action: decisionAction,
        rejectionReason,
        internalNote
      }, { headers: getAdminHeaders() });

      toast.success(res.data?.message || 'Refund decision processed successfully!');
      setShowDecisionModal(false);
      fetchRefunds(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund decision');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    switch (s) {
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'approved':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'processing':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'requested':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse';
      case 'rejected':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
      case 'failed':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Toolbar */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-400" />
              SaaS Refund Management & Provider Settlement Center
            </h3>
            <p className="text-xs text-slate-400">
              Audit refund requests, trigger payment gateway reversals, and resolve tenant disputes.
            </p>
          </div>

          <button
            onClick={() => fetchRefunds(1)}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer self-start sm:self-auto"
            title="Refresh Refunds"
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
              placeholder="Search Refund ID, Txn, Company, Invoice, Requester..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 outline-none focus:border-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
            >
              <option value="all">All Refund Statuses</option>
              <option value="Requested">Requested (Pending Review)</option>
              <option value="Approved">Approved</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed (Reversed via Gateway)</option>
              <option value="Rejected">Rejected</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          {/* Provider Filter */}
          <div>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
            >
              <option value="all">All Payment Providers</option>
              <option value="Stripe">Stripe</option>
              <option value="PayPal">PayPal</option>
              <option value="Authorize.Net">Authorize.Net</option>
              <option value="Manual Wire">Manual Wire</option>
            </select>
          </div>

        </div>

        {/* 2. 10-Column Refunds Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Refund ID</th>
                <th className="px-4 py-3.5">Transaction ID</th>
                <th className="px-4 py-3.5">Company</th>
                <th className="px-4 py-3.5">Invoice</th>
                <th className="px-4 py-3.5">Original Amount</th>
                <th className="px-4 py-3.5">Refund Amount</th>
                <th className="px-4 py-3.5">Reason</th>
                <th className="px-4 py-3.5">Requested By</th>
                <th className="px-4 py-3.5">Requested Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-purple-400 mb-2" />
                    Loading refund records...
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-500">
                    No refund records found matching your filters.
                  </td>
                </tr>
              ) : (
                refunds.map((ref) => (
                  <tr key={ref._id} className="hover:bg-slate-800/30 transition">
                    
                    {/* Refund ID */}
                    <td className="px-4 py-3 font-mono font-bold text-purple-300">
                      {ref.refundId}
                    </td>

                    {/* Transaction ID */}
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {ref.transactionId}
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-white block">{ref.companyName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{ref.companyCode}</span>
                    </td>

                    {/* Invoice */}
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {ref.invoiceNumber}
                    </td>

                    {/* Original Amount */}
                    <td className="px-4 py-3 font-mono text-slate-400">
                      ${ref.originalAmount}
                    </td>

                    {/* Refund Amount */}
                    <td className="px-4 py-3 font-mono font-bold text-rose-400">
                      ${ref.refundAmount} {ref.currency}
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-3 max-w-[200px] truncate text-slate-300" title={ref.reason}>
                      {ref.reason}
                    </td>

                    {/* Requested By */}
                    <td className="px-4 py-3 text-slate-300">
                      {ref.requestedBy}
                    </td>

                    {/* Requested Date */}
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {formatDate(ref.requestedDate)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(ref.status)}`}>
                        {ref.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {(String(ref.status).toLowerCase() === 'requested' || String(ref.status).toLowerCase() === 'approved') && (
                          <>
                            <button
                              onClick={() => handleOpenDecision(ref, 'approve_and_process')}
                              className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg transition cursor-pointer text-[10px] flex items-center gap-1 shadow-md shadow-purple-600/20"
                              title="Process Provider Refund"
                            >
                              <Check className="w-3 h-3" />
                              Process
                            </button>
                            <button
                              onClick={() => handleOpenDecision(ref, 'reject_refund')}
                              className="p-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition cursor-pointer"
                              title="Reject Refund"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {String(ref.status).toLowerCase() === 'failed' && (
                          <button
                            onClick={() => handleOpenDecision(ref, 'retry_provider')}
                            className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold rounded-lg transition cursor-pointer text-[10px] flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Retry
                          </button>
                        )}

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
          <span>Total Refunds: <strong>{pagination.total}</strong></span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchRefunds(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {pagination.page} of {pagination.pages || 1}</span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchRefunds(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* PROVIDER REFUND DECISION & DISPATCH MODAL */}
      {showDecisionModal && selectedRefund && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-400" />
                Process Payment Gateway Refund Reversal
              </h3>
              <button onClick={() => setShowDecisionModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            {/* Context Summary */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 text-[11px] block">Refund ID:</span>
                  <span className="font-mono font-bold text-purple-300">{selectedRefund.refundId}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Company:</span>
                  <span className="font-bold text-white">{selectedRefund.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Original Amount:</span>
                  <span className="font-mono text-slate-300 font-bold">${selectedRefund.originalAmount}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Reversal Amount:</span>
                  <span className="font-mono text-rose-400 font-black text-sm">${selectedRefund.refundAmount} {selectedRefund.currency}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-900">
                <span className="text-slate-500 text-[11px] block">Tenant Reason:</span>
                <span className="text-slate-300 italic">{selectedRefund.reason}</span>
              </div>
            </div>

            {/* Decision Form */}
            <form onSubmit={handleExecuteDecision} className="space-y-3.5 text-xs">
              
              {/* Decision Action Tabs */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Decision Action *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionAction('approve_and_process')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                      decisionAction === 'approve_and_process'
                        ? 'border-purple-500 bg-purple-950/40 text-purple-300 ring-2 ring-purple-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Execute via {selectedRefund.paymentProvider}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecisionAction('reject_refund')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                      decisionAction === 'reject_refund'
                        ? 'border-red-500 bg-red-950/40 text-red-300 ring-2 ring-red-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Reject Refund Request
                  </button>
                </div>
              </div>

              {decisionAction === 'reject_refund' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rejection Reason *</label>
                  <input
                    type="text"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Internal Admin Note (Immutable Audit)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Authorized under 7-day money-back satisfaction guarantee."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl text-[11px] text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Refund will be dispatched directly to <strong>{selectedRefund.paymentProvider}</strong> for settlement reversal.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDecisionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl font-bold text-white shadow-lg cursor-pointer ${
                    decisionAction === 'approve_and_process'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/20'
                      : 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                  }`}
                >
                  {submitting ? 'Executing via Provider...' : 'Confirm Decision & Dispatch'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
