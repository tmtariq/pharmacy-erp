import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import DashboardKPICard from '../../components/dashboard/DashboardKPICard';
import DashboardTable from '../../components/dashboard/DashboardTable';
import {
  DollarSign, ShoppingCart, Users, Package,
  Target, Clock, PlusCircle, Search,
  RefreshCw, FileText, ArrowRight
} from 'lucide-react';

export default function SalesStaffDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({});

  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/reports/sales-dashboard');
      setData(res.data || {});
    } catch (err) {
      console.error('Sales dashboard error:', err);
      setError('Failed to load sales workstation data. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fmtCurrency = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtNum = (val) => Number(val || 0).toLocaleString();

  const recentSales = (data.recentSales || []).map(s => ({
    invoiceNumber: s.invoiceNumber || '—',
    customerName: s.customer?.name || s.patientName || 'Walk-in Customer',
    totalAmount: s.grandTotal || 0,
    paymentMethod: s.paymentMethod || 'cash',
    itemsCount: s.items?.length || 1,
    date: s.createdAt
  }));

  const recentCustomers = (data.recentCustomers || []).map(c => ({
    name: c.name || '—',
    phone: c.phone || '—',
    creditBalance: c.creditBalance || 0,
    loyaltyPoints: c.loyaltyPoints || 0
  }));

  const progressPercent = Math.min(100, Math.round(((data.todaySalesRevenue || 0) / (data.salesTarget || 1500)) * 100));

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Sales Staff Workstation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-5 md:p-6 rounded-2xl border border-slate-800/60 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#3B8FC4]/15 text-[#72D6C1] border border-[#3B8FC4]/30 text-xs font-semibold uppercase tracking-wider">
                Cashier & POS Workstation
              </span>
              <span className="text-slate-400 text-xs">• {user?.branch?.name || 'Assigned Branch'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Cashier'}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Rapid POS checkout, customer search, inventory lookup, and shift totals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/pos"
              className="px-5 py-2.5 bg-[#0B5E8E] hover:bg-[#08476B] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#0B5E8E]/25 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Open POS Billing
            </Link>
            <Link
              to="/customers"
              className="px-4 py-2 bg-[#168A8A] hover:bg-[#127272] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#168A8A]/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              New Customer
            </Link>
            <button
              onClick={fetchSalesData}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer disabled:opacity-50 border border-slate-700/60"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[#D95353] flex items-center justify-between text-sm">
            <span>{error}</span>
            <button onClick={fetchSalesData} className="font-semibold underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* Row 1 — Sales KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardKPICard
            title="Today's Sales Revenue"
            value={fmtCurrency(data.todaySalesRevenue)}
            icon={DollarSign}
            color="primary"
            loading={loading}
          />
          <DashboardKPICard
            title="Completed Invoices"
            value={fmtNum(data.todayTransactionsCount)}
            icon={ShoppingCart}
            color="emerald"
            loading={loading}
          />
          <DashboardKPICard
            title="Pending Prescription Orders"
            value={fmtNum(data.pendingOrdersCount)}
            icon={Clock}
            color="amber"
            loading={loading}
          />
          <DashboardKPICard
            title="Available Stock Units"
            value={fmtNum(data.totalAvailableStockUnits)}
            icon={Package}
            color="secondary"
            loading={loading}
          />
        </div>

        {/* Sales Target Daily Progress Bar */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Target className="w-4 h-4 text-[#72D6C1]" />
              <span>Daily Sales Target Progress</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {fmtCurrency(data.todaySalesRevenue)} / {fmtCurrency(data.salesTarget || 1500)} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0B5E8E] to-[#72D6C1] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Recent Invoices & Customers Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardTable
            title="Today's Recent Invoices"
            data={recentSales}
            loading={loading}
            emptyMessage="No sales recorded today yet"
            columns={[
              { key: 'invoiceNumber', label: 'Invoice' },
              { key: 'customerName', label: 'Customer' },
              { key: 'totalAmount', label: 'Amount', render: (val) => fmtCurrency(val) },
              {
                key: 'paymentMethod',
                label: 'Method',
                render: (val) => (
                  <span className="px-2 py-0.5 rounded-full bg-[#0B5E8E]/15 text-[#0B5E8E] dark:text-[#72D6C1] border border-[#0B5E8E]/30 text-xs font-medium uppercase font-mono">
                    {val}
                  </span>
                )
              },
              {
                key: 'date',
                label: 'Time',
                render: (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
              }
            ]}
          />

          <DashboardTable
            title="Registered Patients & Customers"
            data={recentCustomers}
            loading={loading}
            emptyMessage="No customers registered"
            columns={[
              { key: 'name', label: 'Customer Name' },
              { key: 'phone', label: 'Contact Phone' },
              {
                key: 'loyaltyPoints',
                label: 'Points',
                render: (val) => (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-xs">
                    {val} pts
                  </span>
                )
              },
              {
                key: 'creditBalance',
                label: 'Credit Due',
                render: (val) => val > 0 ? (
                  <span className="text-[#D95353] font-semibold">${Number(val).toFixed(2)}</span>
                ) : (
                  <span className="text-slate-500">$0.00</span>
                )
              }
            ]}
          />
        </div>

        {/* Cashier Operational Shortcuts Footer */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-[#72D6C1]" />
            <div>
              <h4 className="text-sm font-semibold text-white">Sales & POS Shortcuts</h4>
              <p className="text-xs text-slate-400">Rapid price check, customer lookup, and active stock levels.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="/pos" className="px-3.5 py-1.5 rounded-xl bg-[#0B5E8E] hover:bg-[#08476B] text-xs font-semibold text-white flex items-center gap-1.5 shadow-md">
              <PlusCircle className="w-3.5 h-3.5" /> Start New Sale
            </Link>
            <Link to="/inventory" className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1">
              <Search className="w-3.5 h-3.5" /> Check Price & Stock
            </Link>
            <Link to="/customers" className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1">
              Customer Directory <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
