import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  FileSpreadsheet, Search, RefreshCw, BarChart3, TrendingUp,
  CreditCard, PieChart, Layers, DollarSign, Activity, FileText
} from 'lucide-react';
import { useToast } from '../ui';

export default function PlatformReportsManager() {
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/saas-admin/reports', { headers: getAdminHeaders() });
      setReport(res.data);
    } catch {
      toast.error('Failed to load platform reports');
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders, toast]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // CSV Export Utility for Revenue by Plan
  const exportRevenueCSV = () => {
    if (!report?.revenueReport?.byPlan) return;
    const headers = ['Subscription Plan', 'Company Count', 'Estimated MRR (USD)'];
    const rows = report.revenueReport.byPlan.map(plan => [
      plan.name,
      plan.count,
      plan.revenue
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `saas_revenue_plan_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Revenue Report exported successfully');
  };

  if (loading) {
    return (
      <div className="bg-slate-900/60 p-12 text-center rounded-3xl border border-slate-800 text-slate-500 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-400 mb-2" />
        Compiling platform analytical reports...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Toolbar */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            SaaS Platform Executive Reports & Analytics Pipeline
          </h3>
          <p className="text-xs text-slate-400">
            Generate, analyze, and export platform revenue, subscription retention, and tenant growth metrics.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Platform Revenue */}
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Cleared Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black text-white font-mono">
              ${(report?.revenueReport?.totalRevenue || 0).toLocaleString()}
            </h2>
            <p className="text-[10px] text-slate-500">Gross billing minus refunded transaction amounts</p>
          </div>
        </div>

        {/* Subscription Retention */}
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active Retained Tenants</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black text-white font-mono">
              {report?.subscriptionReport?.totalActive || 0} Retained
            </h2>
            <p className="text-[10px] text-slate-500">Currently active and paid pharmacy stores</p>
          </div>
        </div>

        {/* Successful Billing rate */}
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Successful Billing Rate</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black text-white font-mono">
              {report?.paymentReport?.successfulCount || 0} Successful
            </h2>
            <p className="text-[10px] text-slate-500">Failed / Declined: {report?.paymentReport?.failedCount || 0} dispatches</p>
          </div>
        </div>

      </div>

      {/* Analytics Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue by Plan Segment */}
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-purple-400" />
              Plan MRR Segments
            </h4>
            <button
              onClick={exportRevenueCSV}
              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3 h-3" />
              Export CSV
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {report?.revenueReport?.byPlan?.map((plan, idx) => (
              <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">{plan.name} Plan</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{plan.count} Active Stores</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 block">${(plan.revenue).toLocaleString()}</span>
                  <span className="text-[9px] text-slate-500">Projected Monthly Rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operations & Webhook Audit Report */}
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              Operational Webhook Audits
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-center space-y-1">
              <span className="text-slate-400 text-[10px] block">Pending Reviews</span>
              <span className="font-mono font-bold text-white text-lg">{report?.paymentReport?.pendingCount || 0}</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-center space-y-1">
              <span className="text-slate-400 text-[10px] block">Refund Dispatches</span>
              <span className="font-mono font-bold text-white text-lg">{report?.paymentReport?.refundsCount || 0}</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-center space-y-1">
              <span className="text-slate-400 text-[10px] block">Disputed Payments</span>
              <span className="font-mono font-bold text-white text-lg">{report?.paymentReport?.disputesCount || 0}</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-center space-y-1">
              <span className="text-slate-400 text-[10px] block">Trial Enrollments</span>
              <span className="font-mono font-bold text-white text-lg">{report?.subscriptionReport?.totalTrial || 0}</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
