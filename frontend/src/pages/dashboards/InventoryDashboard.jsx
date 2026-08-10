import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import DashboardKPICard from '../../components/dashboard/DashboardKPICard';
import DashboardTable from '../../components/dashboard/DashboardTable';
import {
  Package, AlertTriangle, Clock, Truck,
  ArrowLeftRight, Boxes, RefreshCw,
  PlusCircle, Search, Calendar, FileText, CheckCircle
} from 'lucide-react';

export default function InventoryDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({});

  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/reports/inventory-dashboard');
      setData(res.data || {});
    } catch (err) {
      console.error('Inventory dashboard error:', err);
      setError('Failed to load inventory operations data. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fmtNum = (val) => Number(val || 0).toLocaleString();
  const fmtCurrency = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const recentTransfers = (data.recentTransfers || []).map(tr => ({
    transferNumber: tr.transferNumber || '—',
    fromBranch: tr.fromBranch?.name || 'Main',
    toBranch: tr.toBranch?.name || 'Branch',
    itemsCount: tr.items?.length || 1,
    status: tr.status || 'pending',
    date: tr.createdAt
  }));

  const recentPurchases = (data.recentPurchases || []).map(po => ({
    poNumber: po.purchaseOrderNumber || '—',
    supplier: po.supplier?.name || 'General Supplier',
    totalAmount: po.grandTotal || 0,
    status: po.status || 'pending',
    date: po.createdAt
  }));

  const recentMovements = (data.recentMovements || []).map(log => ({
    action: log.action || 'STOCK_UPDATE',
    details: log.details || 'Stock modified',
    userName: log.userName || 'Staff',
    date: log.createdAt
  }));

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Inventory Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-5 md:p-6 rounded-2xl border border-slate-800/60 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#168A8A]/15 text-[#72D6C1] border border-[#168A8A]/30 text-xs font-semibold uppercase tracking-wider">
                Supply Chain & Stock Control
              </span>
              <span className="text-slate-400 text-xs">• {user?.branch?.name || 'Warehouse / Branch'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Inventory Manager'}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              FEFO batch tracking, procurement orders, warehouse levels, and inter-branch logistics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/inventory"
              className="px-4 py-2 bg-[#0B5E8E] hover:bg-[#08476B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#0B5E8E]/20 transition-all cursor-pointer"
            >
              <Boxes className="w-4 h-4" />
              Manage Batches
            </Link>
            <Link
              to="/purchases"
              className="px-4 py-2 bg-[#168A8A] hover:bg-[#127272] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#168A8A]/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              New Purchase Order
            </Link>
            <Link
              to="/transfers"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Transfer Stock
            </Link>
            <button
              onClick={fetchInventoryData}
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
            <button onClick={fetchInventoryData} className="font-semibold underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* Row 1 — Primary Stock Valuation & Level KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardKPICard
            title="Total Stock Value"
            value={fmtCurrency(data.totalStockValue)}
            icon={Package}
            color="primary"
            loading={loading}
          />
          <DashboardKPICard
            title="Total Active Stock Units"
            value={fmtNum(data.totalStockUnits)}
            icon={Boxes}
            color="secondary"
            loading={loading}
          />
          <DashboardKPICard
            title="Low-Stock Alerts"
            value={fmtNum(data.lowStockCount)}
            icon={AlertTriangle}
            color="amber"
            loading={loading}
          />
          <DashboardKPICard
            title="Out-of-Stock Items"
            value={fmtNum(data.outOfStockCount)}
            icon={AlertTriangle}
            color="red"
            loading={loading}
          />
        </div>

        {/* Row 2 — Expiry & Logistics KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardKPICard
            title="Expiring Batches (60d)"
            value={fmtNum(data.expiringCount)}
            icon={Clock}
            color="amber"
            loading={loading}
          />
          <DashboardKPICard
            title="Expired Batches"
            value={fmtNum(data.expiredCount)}
            icon={AlertTriangle}
            color="red"
            loading={loading}
          />
          <DashboardKPICard
            title="Pending Purchase Orders"
            value={fmtNum(data.pendingPurchasesCount)}
            icon={Truck}
            color="primary"
            loading={loading}
          />
          <DashboardKPICard
            title="Pending Stock Transfers"
            value={fmtNum(data.pendingTransfersCount)}
            icon={ArrowLeftRight}
            color="secondary"
            loading={loading}
          />
        </div>

        {/* Procurement & Logistics Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardTable
            title="Recent Purchase Orders (Procurement)"
            data={recentPurchases}
            loading={loading}
            emptyMessage="No purchase orders created yet"
            columns={[
              { key: 'poNumber', label: 'PO Number' },
              { key: 'supplier', label: 'Supplier' },
              { key: 'totalAmount', label: 'Total', render: (val) => fmtCurrency(val) },
              {
                key: 'status',
                label: 'Status',
                render: (val) => (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase font-mono ${
                    val === 'received'
                      ? 'bg-[#249B72]/20 text-[#249B72]'
                      : val === 'partially_received'
                      ? 'bg-[#168A8A]/20 text-[#72D6C1]'
                      : 'bg-[#D99A2B]/20 text-[#D99A2B]'
                  }`}>
                    {val?.replace('_', ' ')}
                  </span>
                )
              },
              {
                key: 'date',
                label: 'Date',
                render: (val) => val ? new Date(val).toLocaleDateString() : '—'
              }
            ]}
          />

          <DashboardTable
            title="Stock Transfers & Branch Logistics"
            data={recentTransfers}
            loading={loading}
            emptyMessage="No stock transfers recorded"
            columns={[
              { key: 'transferNumber', label: 'Transfer ID' },
              { key: 'fromBranch', label: 'From' },
              { key: 'toBranch', label: 'To' },
              { key: 'itemsCount', label: 'Items', render: (val) => `${val} batch(es)` },
              {
                key: 'status',
                label: 'Status',
                render: (val) => (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase font-mono ${
                    val === 'received'
                      ? 'bg-[#249B72]/20 text-[#249B72]'
                      : val === 'dispatched'
                      ? 'bg-[#0B5E8E]/20 text-[#72D6C1]'
                      : 'bg-[#D99A2B]/20 text-[#D99A2B]'
                  }`}>
                    {val}
                  </span>
                )
              }
            ]}
          />
        </div>

        {/* Stock Movement Audit Log Stream */}
        <DashboardTable
          title="Stock Movement & Inventory Audit Trail"
          data={recentMovements}
          loading={loading}
          emptyMessage="No recent stock movements recorded"
          columns={[
            {
              key: 'action',
              label: 'Action',
              render: (val) => (
                <span className="text-xs font-mono text-[#0B5E8E] dark:text-[#72D6C1] font-semibold">{val}</span>
              )
            },
            { key: 'details', label: 'Details' },
            { key: 'userName', label: 'Performed By' },
            {
              key: 'date',
              label: 'Timestamp',
              render: (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : '—'
            }
          ]}
        />

        {/* Inventory Management Shortcuts Footer */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Boxes className="w-5 h-5 text-[#72D6C1]" />
            <div>
              <h4 className="text-sm font-semibold text-white">Stock Control Shortcuts</h4>
              <p className="text-xs text-slate-400">Generate barcodes, track expiry dates, and conduct stock audits.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="/barcode-labels" className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Barcode & Shelf Labels
            </Link>
            <Link to="/expiry" className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> FEFO Expiry Matrix
            </Link>
            <Link to="/purchases" className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Suppliers & POs
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
