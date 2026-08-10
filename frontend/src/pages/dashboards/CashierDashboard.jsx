import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import DashboardKPICard from '../../components/dashboard/DashboardKPICard';
import DashboardTable from '../../components/dashboard/DashboardTable';
import {
  Banknote, CreditCard, Smartphone, RotateCcw,
  ShoppingCart, RefreshCw, Lock, Unlock,
  PlusCircle, AlertCircle, CheckCircle2, DollarSign
} from 'lucide-react';

export default function CashierDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({});

  // Cash Register State & Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isClosingRegister, setIsClosingRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ openingBalance: 100, actualCashCount: 0, notes: '' });

  // Refund Request State & Modal
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({ saleId: '', invoiceNumber: '', refundAmount: '', reason: '' });
  const [submittingRefund, setSubmittingRefund] = useState(false);

  const fetchCashierData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/reports/cashier-dashboard');
      setData(res.data || {});
    } catch (err) {
      console.error('Cashier dashboard error:', err);
      setError('Failed to load cashier station metrics. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashierData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fmtCurrency = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtNum = (val) => Number(val || 0).toLocaleString();

  const isRegisterOpen = data.activeRegister && data.activeRegister.status === 'open';

  const handleOpenRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post('/pos/register/open', {
        openingBalance: Number(registerForm.openingBalance) || 0,
        notes: registerForm.notes
      });
      setShowRegisterModal(false);
      fetchCashierData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open cash register');
    }
  };

  const handleCloseRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/pos/register/close', {
        actualCashCount: Number(registerForm.actualCashCount) || 0,
        notes: registerForm.notes
      });
      alert(`Register closed successfully!\nExpected: $${res.data.expectedClosing?.toFixed(2)}\nActual Count: $${Number(registerForm.actualCashCount).toFixed(2)}\nDifference: $${res.data.register?.cashDifference?.toFixed(2)}`);
      setShowRegisterModal(false);
      setIsClosingRegister(false);
      fetchCashierData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close cash register');
    }
  };

  const handleRequestRefund = async (e) => {
    e.preventDefault();
    setSubmittingRefund(true);
    try {
      await API.post('/pos/refunds/request', {
        saleId: refundForm.saleId || undefined,
        invoiceNumber: refundForm.invoiceNumber,
        refundAmount: Number(refundForm.refundAmount),
        reason: refundForm.reason
      });
      alert('Refund request submitted! Awaiting Manager/Admin approval.');
      setShowRefundModal(false);
      setRefundForm({ saleId: '', invoiceNumber: '', refundAmount: '', reason: '' });
      fetchCashierData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit refund request');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const recentTransactions = (data.recentTransactions || []).map(t => ({
    invoiceNumber: t.invoiceNumber || '—',
    customerName: t.customerName || 'Walk-in Patient',
    grandTotal: t.grandTotal || 0,
    paymentMethod: t.paymentMethod || 'cash',
    time: t.time
  }));

  const recentRefunds = (data.recentRefunds || []).map(rf => ({
    invoiceNumber: rf.invoiceNumber || '—',
    refundAmount: rf.refundAmount || 0,
    reason: rf.reason || 'Patient return',
    status: rf.status || 'pending_approval',
    time: rf.createdAt
  }));

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Cashier Station Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-5 md:p-6 rounded-2xl border border-slate-800/60 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0B5E8E]/15 text-[#72D6C1] border border-[#0B5E8E]/30 text-xs font-semibold uppercase tracking-wider">
                Payment & Register Counter
              </span>
              <span className="text-slate-400 text-xs">• {user?.branch?.name || 'Cashier Counter'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Cashier'}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Cash register drawer, tender verification, payments breakdown, and manager-approved refunds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isRegisterOpen ? (
              <button
                onClick={() => { setIsClosingRegister(true); setShowRegisterModal(true); }}
                className="px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Close Register
              </button>
            ) : (
              <button
                onClick={() => { setIsClosingRegister(false); setShowRegisterModal(true); }}
                className="px-4 py-2.5 bg-[#249B72] hover:bg-[#1E8260] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#249B72]/20 transition-all cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                Open Shift Register
              </button>
            )}

            <Link
              to="/pos"
              className="px-5 py-2.5 bg-[#0B5E8E] hover:bg-[#08476B] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#0B5E8E]/25 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Open POS Cart
            </Link>

            <button
              onClick={() => setShowRefundModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-red-400" />
              Request Refund
            </button>

            <button
              onClick={fetchCashierData}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer disabled:opacity-50 border border-slate-700/60"
              title="Refresh Counter Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[#D95353] flex items-center justify-between text-sm">
            <span>{error}</span>
            <button onClick={fetchCashierData} className="font-semibold underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* Cash Register Status Bar Banner */}
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md ${
          isRegisterOpen
            ? 'bg-[#249B72]/10 border-[#249B72]/30 text-emerald-300'
            : 'bg-[#D99A2B]/10 border-[#D99A2B]/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {isRegisterOpen ? <CheckCircle2 className="w-5 h-5 text-[#249B72]" /> : <AlertCircle className="w-5 h-5 text-[#D99A2B]" />}
            <div>
              <span className="font-bold text-sm">
                {isRegisterOpen ? 'Shift Cash Register ACTIVE & OPEN' : 'Cash Register CLOSED'}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                {isRegisterOpen
                  ? `Opened with ${fmtCurrency(data.activeRegister?.openingBalance)} at ${new Date(data.activeRegister?.openedAt).toLocaleTimeString()}`
                  : 'Open the register to begin recording cash payments and shift reconciliations.'}
              </p>
            </div>
          </div>
          <div className="text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            Cashier: <span className="text-white font-bold">{user?.name}</span>
          </div>
        </div>

        {/* Row 1 — Tender / Payment Method Breakdown KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardKPICard
            title="Cash Received"
            value={fmtCurrency(data.cashReceived)}
            icon={Banknote}
            color="emerald"
            loading={loading}
          />
          <DashboardKPICard
            title="Card Payments"
            value={fmtCurrency(data.cardPayments)}
            icon={CreditCard}
            color="primary"
            loading={loading}
          />
          <DashboardKPICard
            title="Digital Wallets / Online"
            value={fmtCurrency(data.digitalPayments)}
            icon={Smartphone}
            color="secondary"
            loading={loading}
          />
          <DashboardKPICard
            title="Pending Refund Requests"
            value={fmtNum(data.pendingRefundsCount)}
            icon={RotateCcw}
            color="red"
            loading={loading}
          />
        </div>

        {/* Today's Transactions & Refund Requests Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardTable
            title="Today's Shift Payment Receipts"
            data={recentTransactions}
            loading={loading}
            emptyMessage="No payments received on this shift yet"
            columns={[
              { key: 'invoiceNumber', label: 'Invoice' },
              { key: 'customerName', label: 'Patient' },
              { key: 'grandTotal', label: 'Amount', render: (val) => fmtCurrency(val) },
              {
                key: 'paymentMethod',
                label: 'Tender',
                render: (val) => (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase font-mono ${
                    val === 'cash'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : val === 'card'
                      ? 'bg-blue-500/15 text-blue-400'
                      : 'bg-purple-500/15 text-purple-400'
                  }`}>
                    {val}
                  </span>
                )
              },
              {
                key: 'time',
                label: 'Time',
                render: (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
              }
            ]}
          />

          <DashboardTable
            title="Refund Approval Pipeline"
            data={recentRefunds}
            loading={loading}
            emptyMessage="No active refund requests"
            columns={[
              { key: 'invoiceNumber', label: 'Invoice' },
              { key: 'refundAmount', label: 'Refund', render: (val) => fmtCurrency(val) },
              { key: 'reason', label: 'Reason' },
              {
                key: 'status',
                label: 'Status',
                render: (val) => (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase font-mono ${
                    val === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : val === 'processed'
                      ? 'bg-blue-500/20 text-blue-400'
                      : val === 'rejected'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {val?.replace('_', ' ')}
                  </span>
                )
              }
            ]}
          />
        </div>

      </div>

      {/* OPEN / CLOSE CASH REGISTER MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {isClosingRegister ? <Lock className="w-5 h-5 text-amber-400" /> : <Unlock className="w-5 h-5 text-emerald-400" />}
              {isClosingRegister ? 'Close Shift Cash Register' : 'Open Shift Cash Register'}
            </h3>
            <p className="text-xs text-slate-400">
              {isClosingRegister
                ? 'Enter your physical cash drawer count to compare against expected sales totals.'
                : 'Enter your opening float amount to track cash transactions accurately.'}
            </p>

            <form onSubmit={isClosingRegister ? handleCloseRegister : handleOpenRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isClosingRegister ? 'Physical Cash Drawer Count ($) *' : 'Opening Float Balance ($) *'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={isClosingRegister ? registerForm.actualCashCount : registerForm.openingBalance}
                  onChange={(e) => isClosingRegister
                    ? setRegisterForm({ ...registerForm, actualCashCount: e.target.value })
                    : setRegisterForm({ ...registerForm, openingBalance: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-[#0B5E8E] outline-none"
                  placeholder="100.00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes (Optional)</label>
                <textarea
                  value={registerForm.notes}
                  onChange={(e) => setRegisterForm({ ...registerForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs h-20 outline-none"
                  placeholder="Shift notes or cashier handoff details..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B5E8E] hover:bg-[#08476B] text-xs font-bold text-white cursor-pointer shadow-lg shadow-[#0B5E8E]/20"
                >
                  {isClosingRegister ? 'Submit & Close Drawer' : 'Open Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST REFUND MODAL */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-400" />
              Request Customer Refund
            </h3>
            <p className="text-xs text-slate-400">
              Submit refund request for Manager approval before returning cash or processing tender.
            </p>

            <form onSubmit={handleRequestRefund} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice Number *</label>
                <input
                  type="text"
                  required
                  value={refundForm.invoiceNumber}
                  onChange={(e) => setRefundForm({ ...refundForm, invoiceNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-[#0B5E8E] outline-none"
                  placeholder="INV-10492"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Refund Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={refundForm.refundAmount}
                  onChange={(e) => setRefundForm({ ...refundForm, refundAmount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-[#0B5E8E] outline-none"
                  placeholder="24.50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Return Reason *</label>
                <textarea
                  required
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs h-20 outline-none"
                  placeholder="e.g. Unopened medicine returned with original receipt."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="px-5 py-2 rounded-xl bg-[#D95353] hover:bg-[#C24141] text-xs font-bold text-white cursor-pointer shadow-lg shadow-red-500/20"
                >
                  {submittingRefund ? 'Submitting...' : 'Send for Manager Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
