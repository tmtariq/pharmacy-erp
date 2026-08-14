import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  FileText, Search, RefreshCw, Eye, Download,
  Send, Ban, CheckCircle2, Clock, AlertTriangle,
  ChevronLeft, ChevronRight, Building2, CreditCard,
  Printer, DollarSign, ShieldCheck, Mail
} from 'lucide-react';
import { useToast } from '../ui';

export default function InvoiceManager() {
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Invoice Modal States
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('Duplicate invoice / billing terms revised');
  const [submitting, setSubmitting] = useState(false);

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchInvoices = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      const res = await API.get('/saas-admin/invoices', {
        headers: getAdminHeaders(),
        params
      });
      setInvoices(res.data.invoices || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders, search, statusFilter, toast]);

  useEffect(() => {
    fetchInvoices(1);
  }, [fetchInvoices]);

  const handleOpenView = (inv) => {
    setSelectedInvoice(inv);
    setShowViewModal(true);
  };

  const handleOpenVoid = (inv) => {
    setSelectedInvoice(inv);
    setVoidReason('Duplicate invoice / billing terms revised');
    setShowVoidModal(true);
  };

  const handleResendInvoice = async (inv) => {
    try {
      const res = await API.post(`/saas-admin/invoices/${inv.invoiceNumber}/resend`, {}, { headers: getAdminHeaders() });
      toast.success(res.data?.message || 'Invoice dispatched to recipient email!');
      fetchInvoices(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend invoice');
    }
  };

  const handleExecuteVoid = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post(`/saas-admin/invoices/${selectedInvoice.invoiceNumber}/void`, {
        reason: voidReason
      }, { headers: getAdminHeaders() });
      toast.success(res.data?.message || 'Invoice voided successfully');
      setShowVoidModal(false);
      fetchInvoices(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to void invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintOrDownload = () => {
    window.print();
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status).toLowerCase();
    switch (s) {
      case 'paid':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'issued':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'unpaid':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'overdue':
        return 'bg-red-500/15 text-red-300 border-red-500/30 animate-pulse';
      case 'refunded':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'cancelled':
        return 'bg-slate-800 text-slate-400 border-slate-700 line-through';
      case 'draft':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const formatPeriod = (start, end) => `${formatDate(start)} – ${formatDate(end)}`;

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Top Header Toolbar */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              SaaS Invoices & Official Tax Statements
            </h3>
            <p className="text-xs text-slate-400">
              Tax invoices generated across all subscription renewals, checkouts, and corporate orders.
            </p>
          </div>

          <button
            onClick={() => fetchInvoices(1)}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer self-start sm:self-auto"
            title="Refresh Invoices"
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
              placeholder="Search Invoice #, Company, Email, Transaction ID..."
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
              <option value="all">All Invoice Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Issued">Issued</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled / Voided</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

        </div>

        {/* 2. Invoices 12-Column Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Invoice Number</th>
                <th className="px-4 py-3.5">Company</th>
                <th className="px-4 py-3.5">Billing Address</th>
                <th className="px-4 py-3.5">Subscription</th>
                <th className="px-4 py-3.5">Billing Period</th>
                <th className="px-4 py-3.5">Subtotal</th>
                <th className="px-4 py-3.5">Discount</th>
                <th className="px-4 py-3.5">Tax</th>
                <th className="px-4 py-3.5">Total</th>
                <th className="px-4 py-3.5">Payment Status</th>
                <th className="px-4 py-3.5">Payment Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-purple-400 mb-2" />
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-slate-500">
                    No invoices found matching your filters.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-800/30 transition">
                    
                    {/* Invoice number */}
                    <td className="px-4 py-3 font-mono font-bold text-blue-300">
                      {inv.invoiceNumber}
                    </td>

                    {/* Company */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-white block">{inv.companyName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{inv.companyCode}</span>
                    </td>

                    {/* Billing address */}
                    <td className="px-4 py-3 text-slate-400 max-w-[160px] truncate" title={`${inv.billingAddress?.address}, ${inv.billingAddress?.city}`}>
                      {inv.billingAddress?.city || 'Dallas'}, {inv.billingAddress?.country || 'USA'}
                    </td>

                    {/* Subscription */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold text-[10px] border border-purple-500/20">
                        {inv.planName} Tier
                      </span>
                    </td>

                    {/* Billing period */}
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {formatPeriod(inv.billingPeriod?.startDate, inv.billingPeriod?.endDate)}
                    </td>

                    {/* Subtotal */}
                    <td className="px-4 py-3 font-mono text-slate-300">
                      ${inv.subtotal}
                    </td>

                    {/* Discount */}
                    <td className="px-4 py-3 font-mono text-emerald-400">
                      {inv.discount > 0 ? `-$${inv.discount}` : '$0'}
                    </td>

                    {/* Tax */}
                    <td className="px-4 py-3 font-mono text-slate-400">
                      ${inv.tax}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 font-mono font-black text-white text-sm">
                      ${inv.total} {inv.currency}
                    </td>

                    {/* Payment status */}
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeClass(inv.paymentStatus)}`}>
                        {inv.paymentStatus}
                      </span>
                    </td>

                    {/* Payment date */}
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {formatDate(inv.paymentDate)}
                    </td>

                    {/* Actions: View, Download, Resend, Void, View payment */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Statement */}
                        <button
                          onClick={() => handleOpenView(inv)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                          title="View Official Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Download / Print */}
                        <button
                          onClick={() => { setSelectedInvoice(inv); setShowViewModal(true); }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                          title="Download / Print PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Resend Email */}
                        <button
                          onClick={() => handleResendInvoice(inv)}
                          className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg transition cursor-pointer"
                          title="Resend to Billing Email"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* Void According to Rules */}
                        {inv.paymentStatus !== 'Paid' && !inv.isVoided && (
                          <button
                            onClick={() => handleOpenVoid(inv)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition cursor-pointer"
                            title="Void Unpaid Invoice"
                          >
                            <Ban className="w-3.5 h-3.5" />
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
          <span>Total Invoices: <strong>{pagination.total}</strong></span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchInvoices(pagination.page - 1)}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {pagination.page} of {pagination.pages || 1}</span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchInvoices(pagination.page + 1)}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* OFFICIAL INVOICE VIEW & DOWNLOAD MODAL */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            
            {/* Modal Top Actions */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-white text-sm">Tax Invoice: {selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintOrDownload}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / PDF Export
                </button>
                <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
              </div>
            </div>

            {/* Printable Invoice Document Body */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 text-xs text-slate-300">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">SAAD ERP PLATFORM</h2>
                  <span className="text-[11px] text-slate-500 block">Global Healthcare & Pharmacy ERP SaaS</span>
                  <span className="text-[11px] text-slate-400 font-mono block mt-1">Tax ID: US-EIN-9482910</span>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full font-bold uppercase text-[11px] border ${getStatusBadgeClass(selectedInvoice.paymentStatus)}`}>
                    {selectedInvoice.paymentStatus}
                  </span>
                  <span className="text-[11px] font-mono text-purple-300 block mt-2 font-bold">{selectedInvoice.invoiceNumber}</span>
                  <span className="text-[10px] text-slate-500 block">Issued: {formatDate(selectedInvoice.createdAt)}</span>
                </div>
              </div>

              {/* Billed To vs Payment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 text-[11px] uppercase font-bold block mb-1">Billed To (Tenant):</span>
                  <span className="font-bold text-white block text-sm">{selectedInvoice.companyName}</span>
                  <span className="text-slate-400 block">{selectedInvoice.billingAddress?.address || '123 Medical Center Way'}</span>
                  <span className="text-slate-400 block">{selectedInvoice.billingAddress?.city || 'Dallas'}, {selectedInvoice.billingAddress?.country || 'USA'}</span>
                  <span className="text-slate-500 font-mono block mt-0.5">Tax Reg: {selectedInvoice.billingAddress?.taxId || 'N/A'}</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-slate-500 text-[11px] uppercase font-bold block mb-1">Billing Schedule:</span>
                  <span className="font-semibold text-slate-200 block">
                    {formatPeriod(selectedInvoice.billingPeriod?.startDate, selectedInvoice.billingPeriod?.endDate)}
                  </span>
                  <span className="text-slate-400 block">Method: {selectedInvoice.paymentMethod}</span>
                  {selectedInvoice.transactionId && (
                    <span className="text-purple-300 font-mono block font-bold">Txn: {selectedInvoice.transactionId}</span>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Cycle</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    <tr>
                      <td className="p-3">
                        <span className="font-bold text-white block">Saad ERP — {selectedInvoice.planName} Tier</span>
                        <span className="text-[11px] text-slate-400">Enterprise Pharmacy POS, Batch FEFO Inventory, Staff Governance</span>
                      </td>
                      <td className="p-3 text-center capitalize">{selectedInvoice.billingCycle}</td>
                      <td className="p-3 text-right font-mono">${selectedInvoice.subtotal}</td>
                      <td className="p-3 text-right font-mono font-bold text-white">${selectedInvoice.subtotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono">${selectedInvoice.subtotal}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promotional Discount:</span>
                      <span className="font-mono">-${selectedInvoice.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Sales Tax (8%):</span>
                    <span className="font-mono">${selectedInvoice.tax}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                    <span>Total Due / Paid:</span>
                    <span className="font-mono text-purple-400">${selectedInvoice.total} {selectedInvoice.currency}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer text-xs"
              >
                Close Statement
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VOID INVOICE MODAL */}
      {showVoidModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-400" />
                Void Unpaid Invoice ({selectedInvoice.invoiceNumber})
              </h3>
              <button onClick={() => setShowVoidModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to void invoice <strong>{selectedInvoice.invoiceNumber}</strong>? It will be marked as Cancelled in accordance with SaaS billing rules.
            </p>

            <form onSubmit={handleExecuteVoid} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Voiding *</label>
                <textarea
                  required
                  rows={2}
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVoidModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white shadow-lg cursor-pointer"
                >
                  {submitting ? 'Voiding...' : 'Confirm Void'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
