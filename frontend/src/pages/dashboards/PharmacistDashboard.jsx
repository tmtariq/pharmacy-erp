import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import DashboardKPICard from '../../components/dashboard/DashboardKPICard';
import DashboardTable from '../../components/dashboard/DashboardTable';
import {
  FileText, Clock, CheckCircle2, AlertTriangle,
  Calendar, ShieldAlert, ShoppingCart, RefreshCw,
  PlusCircle, Search, Pill, ArrowRight
} from 'lucide-react';

export default function PharmacistDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({});

  const fetchPharmacistData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/reports/pharmacist-dashboard');
      setData(res.data || {});
    } catch (err) {
      console.error('Pharmacist dashboard error:', err);
      setError('Failed to load pharmacist operational data. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacistData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fmtNum = (val) => Number(val || 0).toLocaleString();

  const recentSales = (data.recentSales || []).map(s => ({
    invoiceNumber: s.invoiceNumber || '—',
    customerName: s.customer?.name || s.patientName || 'Walk-in Patient',
    totalAmount: s.grandTotal || 0,
    itemsCount: s.items?.length || 1,
    date: s.createdAt
  }));

  const recentPrescriptions = (data.recentPrescriptions || []).map(rx => ({
    id: rx._id,
    patientName: rx.patientName || rx.patient?.name || 'Walk-in Patient',
    doctorName: rx.doctorName || rx.doctor?.name || 'General Practitioner',
    status: rx.status || 'pending',
    date: rx.createdAt
  }));

  const recentAlerts = data.recentAlerts || [];

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950 text-slate-100 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Pharmacist Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-5 md:p-6 rounded-2xl border border-slate-800/60 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#249B72]/15 text-[#249B72] border border-[#249B72]/30 text-xs font-semibold uppercase tracking-wider">
                Pharmacist Workstation
              </span>
              <span className="text-slate-400 text-xs">• {user?.branch?.name || 'Assigned Branch'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Pharmacist'}
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Prescription verification, dispensing control, and medicine safety monitor.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/prescriptions"
              className="px-4 py-2 bg-[#0B5E8E] hover:bg-[#08476B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#0B5E8E]/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Process Rx
            </Link>
            <Link
              to="/pos"
              className="px-4 py-2 bg-[#168A8A] hover:bg-[#127272] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#168A8A]/20 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Open POS
            </Link>
            <button
              onClick={fetchPharmacistData}
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
            <button onClick={fetchPharmacistData} className="font-semibold underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* Row 1 — Core Prescription & Dispensing KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardKPICard
            title="Today's Prescriptions"
            value={fmtNum(data.todayPrescriptionsCount)}
            icon={FileText}
            color="primary"
            loading={loading}
          />
          <DashboardKPICard
            title="Pending Prescriptions"
            value={fmtNum(data.pendingPrescriptionsCount)}
            icon={Clock}
            color="amber"
            loading={loading}
          />
          <DashboardKPICard
            title="Dispensed Today"
            value={fmtNum(data.dispensedTodayCount)}
            icon={CheckCircle2}
            color="emerald"
            loading={loading}
          />
          <DashboardKPICard
            title="Medicine Safety Alerts"
            value={fmtNum(recentAlerts.length)}
            icon={ShieldAlert}
            color="red"
            loading={loading}
          />
        </div>

        {/* Row 2 — Inventory Health (Low Stock & Expiry) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardKPICard
            title="Low-Stock Medicines"
            value={fmtNum(data.lowStockCount)}
            icon={AlertTriangle}
            color="amber"
            loading={loading}
          />
          <DashboardKPICard
            title="Expiring Soon (60d)"
            value={fmtNum(data.expiringCount)}
            icon={Calendar}
            color="secondary"
            loading={loading}
          />
          <DashboardKPICard
            title="Expired Batches"
            value={fmtNum(data.expiredCount)}
            icon={AlertTriangle}
            color="red"
            loading={loading}
          />
        </div>

        {/* Drug Safety & Interaction Alert Banner (If Any) */}
        {recentAlerts.length > 0 && (
          <div className="bg-[#D95353]/10 border border-[#D95353]/30 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[#D95353] font-bold text-sm mb-3">
              <ShieldAlert className="w-5 h-5" />
              <span>Active Drug Interaction & Clinical Alerts ({recentAlerts.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentAlerts.slice(0, 4).map((alert, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-white">{alert.patientName}</span>
                    <p className="text-slate-400 mt-0.5">Doctor: {alert.doctorName}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {alert.drugInteractionAlerts?.map((dia, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[10px]">
                          {dia.pair?.join(' + ') || dia.warningMessage || 'Interaction Alert'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link to="/prescriptions" className="text-[#72D6C1] hover:underline shrink-0 font-medium">Review</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prescriptions & Sales Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DashboardTable
            title="Recent Prescriptions Queue"
            data={recentPrescriptions}
            loading={loading}
            emptyMessage="No pending prescriptions in queue"
            columns={[
              { key: 'patientName', label: 'Patient' },
              { key: 'doctorName', label: 'Doctor' },
              {
                key: 'status',
                label: 'Status',
                render: (val) => (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase font-mono ${
                    val === 'approved' || val === 'fulfilled'
                      ? 'bg-[#249B72]/20 text-[#249B72]'
                      : val === 'rejected'
                      ? 'bg-[#D95353]/20 text-[#D95353]'
                      : 'bg-[#D99A2B]/20 text-[#D99A2B]'
                  }`}>
                    {val}
                  </span>
                )
              },
              {
                key: 'date',
                label: 'Received',
                render: (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
              }
            ]}
          />

          <DashboardTable
            title="Recent Dispensed Sales"
            data={recentSales}
            loading={loading}
            emptyMessage="No dispensing sales recorded today"
            columns={[
              { key: 'invoiceNumber', label: 'Invoice' },
              { key: 'customerName', label: 'Customer/Patient' },
              { key: 'itemsCount', label: 'Items', render: (val) => `${val} med(s)` },
              { key: 'totalAmount', label: 'Total', render: (val) => `$${Number(val).toFixed(2)}` },
              {
                key: 'date',
                label: 'Time',
                render: (val) => val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
              }
            ]}
          />
        </div>

        {/* Quick Operational Actions Footer */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Pill className="w-5 h-5 text-[#72D6C1]" />
            <div>
              <h4 className="text-sm font-semibold text-white">Pharmacist Quick Shortcuts</h4>
              <p className="text-xs text-slate-400">Search stock, check dosage rules, and view batch expiry.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="/inventory" className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1">
              <Search className="w-3.5 h-3.5" /> Search Medicine Stock
            </Link>
            <Link to="/expiry" className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Check FEFO Batches
            </Link>
            <Link to="/customers" className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1">
              Patient History <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
