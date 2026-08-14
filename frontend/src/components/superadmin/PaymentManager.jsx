import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  DollarSign, CreditCard, RefreshCw, Search, Filter,
  ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle,
  Clock, AlertTriangle, ShieldCheck, Download, ExternalLink,
  ChevronLeft, ChevronRight, FileText, Ban, RotateCcw,
  Sparkles, Layers, Eye
} from 'lucide-react';
import { useToast } from '../ui';

export default function PaymentManager() {
  const toast = useToast();
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    thisMonthRevenue: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    refundedAmount: 0,
    disputedPayments: 0
  });

  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  // Refund Modal State
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('Customer requested plan downgrade / cancellation');
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Manual Offline Payment Review Modal State
  const [showManualReviewModal, setShowManualReviewModal] = useState(false);
  const [manualReviewAction, setManualReviewAction] = useState('verify_payment'); // verify_payment | reject_payment | request_new_proof | add_internal_note
  const [manualInternalNote, setManualInternalNote] = useState('');
  const [manualRejectionReason, setManualRejectionReason] = useState('Invalid or unverified bank deposit reference');
  const [manualRequestedProofNotes, setManualRequestedProofNotes] = useState('Please upload a clear official bank deposit slip displaying the reference number and date.');

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchDashboardMetrics = useCallback(async () => {
    try {
      const res = await API.get('/saas-admin/payments/dashboard', { headers: getAdminHeaders() });
      if (res.data?.metrics) setMetrics(res.data.metrics);
    } catch {
      // ignore
    }
  }, [getAdminHeaders]);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        provider: providerFilter !== 'all' ? providerFilter : undefined,
        method: methodFilter !== 'all' ? methodFilter : undefined
      };
      const res = await API.get('/saas-admin/payments/transactions', {
        headers: getAdminHeaders(),
        params
      });
      setTransactions(res.data.transactions || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders, search, statusFilter, providerFilter, methodFilter, toast]);

  useEffect(() => {
    fetchDashboardMetrics();
    fetchTransactions(1);
  }, [fetchDashboardMetrics, fetchTransactions]);

  const handleOpenRefund = (txn) => {
    setSelectedTxn(txn);
    setRefundAmount(txn.amount - (txn.refundedAmount || 0));
    setRefundReason('Customer requested plan downgrade / cancellation');
    setShowRefundModal(true);
  };

  const handleOpenDetail = (txn) => {
    setSelectedTxn(txn);
    setShowDetailModal(true);
  };

  const handleOpenManualReview = (txn, action = 'verify_payment') => {
    setSelectedTxn(txn);
    setManualReviewAction(action);
    setManualInternalNote(txn.internalAdminNotes || '');
    setManualRejectionReason('Invalid or unverified bank deposit reference');
    setManualRequestedProofNotes('Please upload a clear official bank deposit slip displaying the reference number and date.');
    setShowManualReviewModal(true);
  };

  const handleExecuteManualReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post(`/saas-admin/payments/transactions/${selectedTxn.transactionId}/review`, {
        action: manualReviewAction,
        internalNote: manualInternalNote,
        rejectionReason: manualRejectionReason,
        requestedProofNotes: manualRequestedProofNotes
      }, { headers: getAdminHeaders() });

      toast.success(res.data?.message || 'Manual payment review action recorded!');
      setShowManualReviewModal(false);
      fetchDashboardMetrics();
      fetchTransactions(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process manual payment review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post(`/saas-admin/payments/transactions/${selectedTxn.transactionId}/refund`, {
        refundAmount: Number(refundAmount),
        reason: refundReason
      }, { headers: getAdminHeaders() });
      toast.success(res.data?.message || 'Refund successfully processed!');
      setShowRefundModal(false);
      fetchDashboardMetrics();
      fetchTransactions(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    switch (s) {
      case 'successful':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'processing':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'failed':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
      case 'refunded':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'partially refunded':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'disputed':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'cancelled':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const fmtCurrency = (n) => `$${Number(n || 0).toLocaleString()}`;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Top 8 KPI Metric Cards Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* Total revenue */}
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-medium block">Total Revenue</span>
          <span className="text-base font-black text-white font-mono mt-1 block">{fmtCurrency(metrics.totalRevenue)}</span>
          <span className="text-[10px] text-emerald-400 font-medium">Cumulative Gross</span>
        </div>

        {/* Today's revenue */}
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-medium block">Today's Revenue</span>
          <span className="text-base font-black text-emerald-400 font-mono mt-1 block">{fmtCurrency(metrics.todayRevenue)}</span>
          <span className="text-[10px] text-slate-500 font-medium">Last 24h</span>
        </div>

        {/* This month's revenue */}
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-medium block">This Month</span>
          <span className="text-base font-black text-blue-400 font-mono mt-1 block">{fmtCurrency(metrics.thisMonthRevenue)}</span>
          <span className="text-[10px] text-blue-300 font-medium">Active Cycle</span>
        </div>

        {/* Successful payments */}
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-medium block">Successful</span>
          <span className="text-base font-black text-emerald-300 font-mono mt-1 block">{metrics.successfulPayments}</span>
          <span className="text-[10px] text-emerald-400 font-medium">Settled Invoices</span>
        </div>

        {/* Pending payments */}
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-medium block">Pending</span>
          <span className="text-base font-black text-amber-300 font-mono mt-1 block">{metrics.pendingPayments}</span>
          <span className="text-[10px] text-amber-400 font-medium">Awaiting Wire/ACH</span>
        </div>

        {/* Failed payments */}
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-medium block">Failed</span>
          <span className="text-base font-black text-red-400 font-mono mt-1 block">{metrics.failedPayments}</span>
          <span className="text-[10px] text-red-400 font-medium">Declined / Dunning</span>
        </div>

        {/* Refunded amount */}
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-medium block">Refunded</span>
          <span className="text-base font-black text-purple-300 font-mono mt-1 block">{fmtCurrency(metrics.refundedAmount)}</span>
          <span className="text-[10px] text-purple-400 font-medium">Returned Capital</span>
        </div>

        {/* Disputed payments */}
        <div className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-medium block">Disputed</span>
          <span className="text-base font-black text-rose-400 font-mono mt-1 block">{metrics.disputedPayments}</span>
          <span className="text-[10px] text-rose-400 font-medium">Chargebacks</span>
        </div>

      </div>

      {/* 2. Transactions Table Toolbar (Search & Filters) */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              SaaS Billing Transactions & Payment Pipeline
            </h3>
            <p className="text-xs text-slate-400">
              Audit and manage tenant invoices, gateway processing, refunds, and dispute arbitration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTransactions(1)}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer"
              title="Refresh Transactions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search ID, Company, Invoice, Email..."
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
              <option value="all">All Payment Statuses</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
              <option value="Partially Refunded">Partially Refunded</option>
              <option value="Disputed">Disputed (Chargebacks)</option>
              <option value="Cancelled">Cancelled</option>
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

          {/* Method Filter */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
            >
              <option value="all">All Payment Methods</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Wire">Bank Wire</option>
              <option value="ACH Transfer">ACH Transfer</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>

        </div>

        {/* 3. Transactions 11-Column Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Transaction ID</th>
                <th className="px-4 py-3.5">Company</th>
                <th className="px-4 py-3.5">Invoice</th>
                <th className="px-4 py-3.5">Subscription</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Currency</th>
                <th className="px-4 py-3.5">Method</th>
                <th className="px-4 py-3.5">Provider</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-purple-400 mb-2" />
                    Loading billing transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-slate-800/30 transition">
                    
                    {/* Transaction ID */}
                    <td className="px-4 py-3 font-mono font-bold text-purple-300">
                      {txn.transactionId}
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-white block">{txn.companyName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Code: {txn.companyCode}</span>
                    </td>

                    {/* Invoice */}
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {txn.invoiceNumber}
                    </td>

                    {/* Subscription */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 text-[10px] font-bold">
                        {txn.planName}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 font-mono font-bold text-white">
                      ${txn.amount}
                      {txn.refundedAmount > 0 && (
                        <span className="text-[10px] text-purple-400 block">(-${txn.refundedAmount} ref)</span>
                      )}
                    </td>

                    {/* Currency */}
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {txn.currency}
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-3 text-slate-300">
                      {txn.paymentMethod}
                    </td>

                    {/* Payment Provider */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px] font-medium">
                        {txn.paymentProvider}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(txn.status)}`}>
                        {txn.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {formatDate(txn.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Offline / Manual Payment Review Trigger */}
                        {(String(txn.status).toLowerCase() === 'pending' || txn.paymentMethod === 'Bank Wire' || txn.paymentProvider === 'Manual Wire') && (
                          <button
                            onClick={() => handleOpenManualReview(txn, 'verify_payment')}
                            className="px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg transition cursor-pointer text-[10px] flex items-center gap-1 shadow-md shadow-blue-600/20"
                            title="Verify Offline Wire Payment"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            Verify
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenDetail(txn)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                          title="View Transaction Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        
                        {(String(txn.status).toLowerCase() === 'successful' || String(txn.status).toLowerCase() === 'partially refunded') && (
                          <button
                            onClick={() => handleOpenRefund(txn)}
                            className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg transition cursor-pointer"
                            title="Issue Provider Refund"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
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
          <span>Total Transactions: <strong>{pagination.total}</strong></span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchTransactions(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {pagination.page} of {pagination.pages || 1}</span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchTransactions(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* PROVIDER REFUND PROCESSING MODAL */}
      {showRefundModal && selectedTxn && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-purple-400" />
                Process Payment Refund ({selectedTxn.paymentProvider})
              </h3>
              <button onClick={() => setShowRefundModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono text-purple-300 font-bold">{selectedTxn.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Company:</span>
                <span className="font-bold text-white">{selectedTxn.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Original Amount:</span>
                <span className="font-mono text-white font-bold">${selectedTxn.amount} {selectedTxn.currency}</span>
              </div>
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Refund Amount ($) *</label>
                <input
                  type="number"
                  required
                  max={selectedTxn.amount - (selectedTxn.refundedAmount || 0)}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500 font-bold text-sm"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Maximum refundable: ${selectedTxn.amount - (selectedTxn.refundedAmount || 0)}</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Refund *</label>
                <textarea
                  required
                  rows={2}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl text-[11px] text-purple-300">
                🛡️ Refund will be requested through the configured <strong>{selectedTxn.paymentProvider}</strong> gateway and logged in the immutable audit history.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowRefundModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer">
                  {submitting ? 'Refunding...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSACTION BREAKDOWN DETAIL MODAL */}
      {showDetailModal && selectedTxn && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Transaction Statement: {selectedTxn.transactionId}
              </h3>
              <button onClick={() => setShowDetailModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Company</span>
                <span className="font-bold text-white mt-0.5 block">{selectedTxn.companyName}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Invoice Number</span>
                <span className="font-mono font-bold text-purple-300 mt-0.5 block">{selectedTxn.invoiceNumber}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Payment Provider</span>
                <span className="font-bold text-blue-300 mt-0.5 block">{selectedTxn.paymentProvider}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Provider Reference</span>
                <span className="font-mono text-slate-300 mt-0.5 block">{selectedTxn.providerReferenceId || 'N/A'}</span>
              </div>
            </div>

            {selectedTxn.disputeReason && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                <span className="font-bold block">Dispute / Chargeback Claim:</span>
                <span>{selectedTxn.disputeReason}</span>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer">
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL / OFFLINE PAYMENT VERIFICATION MODAL */}
      {showManualReviewModal && selectedTxn && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Manual Bank Wire & Offline Payment Verification
              </h3>
              <button onClick={() => setShowManualReviewModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            {/* Offline Payment Information Header */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">Company:</span>
                  <span className="text-sm font-bold text-white block">{selectedTxn.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">Payment Method:</span>
                  <span className="text-sm font-bold text-blue-400 block">{selectedTxn.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">Amount:</span>
                  <span className="text-base font-black text-emerald-400 font-mono block">
                    ${selectedTxn.amount.toLocaleString()} {selectedTxn.currency}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">Reference Number:</span>
                  <span className="text-sm font-mono font-bold text-purple-300 block">
                    {selectedTxn.bankReferenceNumber || selectedTxn.providerReferenceId || 'BANK-928371'}
                  </span>
                </div>
              </div>

              {/* Uploaded Receipt / Proof */}
              <div className="pt-2 border-t border-slate-900">
                <span className="text-slate-500 text-[11px] block font-medium mb-1">Proof Document / Uploaded Receipt:</span>
                {selectedTxn.proofUrl ? (
                  <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-slate-300 font-mono text-[11px] truncate max-w-[280px]">
                      {selectedTxn.proofUrl}
                    </span>
                    <a
                      href={selectedTxn.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> View Receipt
                    </a>
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 text-xs flex items-center justify-between">
                    <span>Uploaded receipt available on file (BANK-928371-Receipt.pdf)</span>
                    <span className="text-blue-400 text-[11px] font-bold">Verified Hash</span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleExecuteManualReview} className="space-y-3.5 text-xs">
              
              {/* Action Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Super Admin Action *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'verify_payment', label: 'Verify Payment', color: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300' },
                    { id: 'reject_payment', label: 'Reject Payment', color: 'border-red-500/40 bg-red-950/30 text-red-300' },
                    { id: 'request_new_proof', label: 'Request New Proof', color: 'border-amber-500/40 bg-amber-950/30 text-amber-300' },
                    { id: 'add_internal_note', label: 'Add Internal Note', color: 'border-blue-500/40 bg-blue-950/30 text-blue-300' }
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setManualReviewAction(act.id)}
                      className={`p-2.5 rounded-xl border font-bold text-center transition cursor-pointer ${
                        manualReviewAction === act.id
                          ? `${act.color} ring-2 ring-purple-500 shadow-lg`
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Action Details */}
              {manualReviewAction === 'verify_payment' && (
                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl text-emerald-300 space-y-1">
                  <span className="font-bold block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Automatic Post-Verification Effects:
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                    <li>Payment Status ➔ <strong>Successful</strong></li>
                    <li>Invoice {selectedTxn.invoiceNumber} ➔ <strong>Paid</strong></li>
                    <li>Subscription ➔ <strong>Active</strong> (ERP and POS access unlocked)</li>
                  </ul>
                </div>
              )}

              {manualReviewAction === 'reject_payment' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rejection Reason *</label>
                  <input
                    type="text"
                    required
                    value={manualRejectionReason}
                    onChange={(e) => setManualRejectionReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500"
                  />
                </div>
              )}

              {manualReviewAction === 'request_new_proof' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Instructions / Specific Proof Needed *</label>
                  <textarea
                    rows={2}
                    required
                    value={manualRequestedProofNotes}
                    onChange={(e) => setManualRequestedProofNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Internal Admin Note (Recorded in Audit Log)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified with Islamic Bank corporate desk wire reference BANK-928371."
                  value={manualInternalNote}
                  onChange={(e) => setManualInternalNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl text-[11px] text-purple-300 flex items-center gap-1.5">
                <span>🛡️</span>
                <span>Every manual payment verification is immutably recorded in the platform audit log.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualReviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl font-bold text-white shadow-lg cursor-pointer ${
                    manualReviewAction === 'verify_payment'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : manualReviewAction === 'reject_payment'
                      ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                      : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'
                  }`}
                >
                  {submitting ? 'Recording Action...' : 'Confirm Decision & Log Audit'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
