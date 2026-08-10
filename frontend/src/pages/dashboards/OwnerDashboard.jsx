import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import DashboardKPICard from '../../components/dashboard/DashboardKPICard';
import DashboardChart from '../../components/dashboard/DashboardChart';
import DashboardTable from '../../components/dashboard/DashboardTable';
import { canSeeWidget } from '../../constants/permissions';
import {
  DollarSign, TrendingUp, ShoppingCart, PieChart,
  Package, AlertTriangle, Clock, CreditCard,
  Truck, Users, Building2, UserCheck, RefreshCw
} from 'lucide-react';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [ownerData, setOwnerData] = useState({});

  const fetchDashboardData = async () => {
    setLoading(true); setError(null);
    try {
      const [metricsRes, ownerRes] = await Promise.allSettled([
        API.get('/reports/dashboard-metrics'),
        API.get('/reports/owner-dashboard')
      ]);

      if (metricsRes.status === 'fulfilled') {
        setMetrics(metricsRes.value.data || {});
      } else {
        throw new Error('Failed to fetch primary metrics');
      }

      if (ownerRes.status === 'fulfilled') setOwnerData(ownerRes.value.data || {});
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fmt = (val) => Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtNum = (val) => Number(val || 0).toLocaleString();

  // Chart data transformation
  const dailyChartData = (metrics.dailySalesChart || []).map(d => ({
    label: d.day || d.date, value: d.revenue || 0
  }));

  const branchChartData = (metrics.branchComparison || ownerData.branchComparison || []).map(b => ({
    label: b.branchCode || b.branchName, value: b.totalRevenue || 0
  }));

  // Table data transformation
  const recentSales = (ownerData.recentSales || []).map(s => ({
    invoiceNumber: s.invoiceNumber || '—',
    customerName: s.customer?.name || s.customerName || 'Walk-in',
    totalAmount: s.grandTotal || s.totalAmount || 0,
    paymentMethod: s.paymentMethod || 'cash',
    date: s.createdAt || s.date
  }));

  const staffActivity = (metrics.recentActivities || ownerData.staffActivity || []).slice(0, 20).map(a => ({
    userName: a.userName || a.user?.name || '—',
    action: a.action || '—',
    module: a.module || '—',
    timestamp: a.createdAt || a.timestamp
  }));

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950 text-slate-100">
      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-5 md:p-6 rounded-2xl border border-slate-800/50 backdrop-blur-md">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Owner'}
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wide">
                {user?.role || 'Owner'}
              </span>
              <span className="text-slate-500 text-xs mt-1">{user?.pharmacy?.name || 'All Branches'}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer border border-slate-700/50"
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center justify-between text-sm">
            <span>{error}</span>
            <button onClick={fetchDashboardData} className="font-medium hover:underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* Row 1 — Financial KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardKPICard title="Today's Sales" value={fmt(metrics.todaySales)} icon={DollarSign} color="blue" prefix="$" loading={loading} />
          <DashboardKPICard title="Monthly Sales" value={fmt(metrics.monthlySales)} icon={TrendingUp} color="emerald" prefix="$" loading={loading} />
          <DashboardKPICard title="Total Purchases" value={fmt(ownerData.totalPurchases || metrics.supplierDues)} icon={ShoppingCart} color="amber" prefix="$" loading={loading} />
          <DashboardKPICard title="Net Profit/Loss" value={fmt(metrics.totalProfit)} icon={PieChart} color={metrics.totalProfit >= 0 ? 'emerald' : 'red'} prefix="$" loading={loading} />
        </div>

        {/* Row 2 — Inventory Health */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardKPICard title="Stock Value" value={fmt(ownerData.totalStockValue)} icon={Package} color="blue" prefix="$" loading={loading} />
          <DashboardKPICard title="Low Stock Alerts" value={fmtNum(metrics.lowStockCount)} icon={AlertTriangle} color="amber" loading={loading} />
          <DashboardKPICard title="Expiring (30d)" value={fmtNum(metrics.expiringSoonCount)} icon={Clock} color="red" loading={loading} />
          <DashboardKPICard title="Outstanding Payments" value={fmt(metrics.pendingPayments)} icon={CreditCard} color="amber" prefix="$" loading={loading} />
        </div>

        {/* Row 3 — Entity Counts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardKPICard title="Supplier Payable" value={fmt(metrics.supplierDues)} icon={Truck} color="red" prefix="$" loading={loading} />
          <DashboardKPICard title="Active Customers" value={fmtNum(ownerData.customerCount)} icon={Users} color="emerald" loading={loading} />
          {canSeeWidget(user?.role, 'branches') ? (
            <DashboardKPICard title="Active Branches" value={fmtNum(ownerData.branchCount)} icon={Building2} color="blue" loading={loading} />
          ) : (
            <DashboardKPICard title="Assigned Branch" value={user?.branch?.name || 'My Branch'} icon={Building2} color="blue" loading={loading} />
          )}
          <DashboardKPICard title="Staff Count" value={fmtNum(ownerData.staffCount)} icon={UserCheck} color="purple" loading={loading} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardChart title="Daily Revenue (7 Days)" data={dailyChartData} type="bar" color="#0B5E8E" loading={loading} />
          <DashboardChart title="Branch Performance" data={branchChartData} type="bar" color="#168A8A" loading={loading} />
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardTable
            title="Recent Sales" data={recentSales} loading={loading}
            columns={[
              { key: 'invoiceNumber', label: 'Invoice' },
              { key: 'customerName', label: 'Customer' },
              { key: 'totalAmount', label: 'Amount', render: (val) => `$${fmt(val)}` },
              { key: 'paymentMethod', label: 'Method', render: (val) => (
                <span className="px-2 py-0.5 rounded-full bg-[#0B5E8E]/10 text-[#0B5E8E] dark:text-[#72D6C1] border border-[#0B5E8E]/20 text-xs font-medium capitalize">{val}</span>
              )},
              { key: 'date', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—' }
            ]}
          />
          <DashboardTable
            title="Staff Activity" data={staffActivity} loading={loading}
            columns={[
              { key: 'userName', label: 'User' },
              { key: 'action', label: 'Action', render: (val) => (
                <span className="text-xs font-mono text-[#0B5E8E] dark:text-[#72D6C1] font-semibold">{val}</span>
              )},
              { key: 'module', label: 'Module' },
              { key: 'timestamp', label: 'Time', render: (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' }
            ]}
          />
        </div>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Medicines', value: fmtNum(metrics.totalMedicines) },
            { label: 'Active Medicines', value: fmtNum(metrics.activeMedicines) },
            { label: 'Expired Batches', value: fmtNum(metrics.expiredMedicinesCount) },
            { label: 'Out of Stock', value: fmtNum(metrics.outOfStockCount) },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800/40 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="text-lg font-bold text-slate-200 mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
