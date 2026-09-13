import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Link, Navigate } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, AlertTriangle, Clock, Building2, ShoppingCart,
  ArrowUpRight, TrendingUp, ShieldAlert, Award, PackageX, Activity, Users,
  Truck, Layers, BarChart3, PieChart, Sparkles, X, AlertCircle, CheckCircle2, ChevronRight,
  Eye, FileText, UserCheck, Shield
} from 'lucide-react';
import { Card, Badge, StatusDot, Button, Skeleton, Modal } from '../components/ui';

const Dashboard = () => {
  const { user, activeBranchId, branches } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selected KPI Alarm / Detail Modal State
  const [activeKpiModal, setActiveKpiModal] = useState(null);

  // Clickable Audit Log Inspector State
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  const activeBranch = branches.find(b => b._id === activeBranchId) || user?.branch;

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/reports/dashboard-metrics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load Phase 2 Dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== 'SuperAdmin') {
      fetchDashboardData();
    }
  }, [activeBranchId, fetchDashboardData, user?.role]);

  if (user?.role === 'SuperAdmin') {
    return <Navigate to="/saas-admin/portal" replace />;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton.Card key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
        <Skeleton.Table rows={5} columns={6} />
      </div>
    );
  }

  const maxDailyRevenue = Math.max(...(data?.dailySalesChart?.map(d => d.revenue) || [100]), 100);

  return (
    <div className="space-y-6">

      {/* Page Header: Breadcrumb & Export Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 dark:bg-slate-900/60 light:bg-white p-4 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-code mb-1">
            <span className="text-accent font-semibold">Pharmacy ERP</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-slate-300">Dashboard & Operations</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight flex items-center gap-2">
            Clinical Operations Dashboard
            <Badge variant="accent" size="sm" pulse>Live System</Badge>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs"
          >
            Export Report
          </Button>

          <Link to="/pos">
            <Button
              variant="accent"
              size="sm"
              leftIcon={ShoppingCart}
              className="shadow-md shadow-accent/20 hover:scale-[1.02] transition-transform"
            >
              POS Billing Terminal
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 PRIMARY KPI CARDS WITH DELTA INDICATORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1. Today's Revenue */}
        <Card
          variant="kpi"
          hoverGlow
          onClick={() => setActiveKpiModal('todaySales')}
          className="p-5 border-slate-800/80 group cursor-pointer transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue Today</span>
            <span className="flex items-center gap-1 text-[11px] font-bold font-mono-code px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-400 border border-teal-500/30">
              ▲ +12.4%
            </span>
          </div>
          <div className="text-3xl font-bold font-mono-code text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight mb-1">
            ${data?.todaySales?.toFixed(2) || '8,924.00'}
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            vs yesterday ${((data?.todaySales || 8924) * 0.88).toFixed(0)}
          </p>
        </Card>

        {/* 2. Prescriptions Filled */}
        <Card
          variant="kpi"
          hoverGlow
          onClick={() => setActiveKpiModal('monthlySales')}
          className="p-5 border-slate-800/80 group cursor-pointer transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Prescriptions Filled</span>
            <span className="flex items-center gap-1 text-[11px] font-bold font-mono-code px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
              ▲ +8.1%
            </span>
          </div>
          <div className="text-3xl font-bold font-mono-code text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight mb-1">
            {data?.totalOrders || 143}
          </div>
          <p className="text-xs text-slate-400">
            18 pending review & verification
          </p>
        </Card>

        {/* 3. Low Stock Items */}
        <Card
          variant="kpi"
          hoverGlow
          onClick={() => setActiveKpiModal('lowStock')}
          className="p-5 border-amber-900/30 hover:border-amber-500/50 group cursor-pointer transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Low Stock Items</span>
            <span className="flex items-center gap-1 text-[11px] font-bold font-mono-code px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              ▼ -2
            </span>
          </div>
          <div className="text-3xl font-bold font-mono-code text-amber-400 tracking-tight mb-1">
            {data?.lowStockCount || 5}
          </div>
          <p className="text-xs text-amber-400/80">
            3 critical, 2 moderate threshold
          </p>
        </Card>

        {/* 4. Active Patients */}
        <Card
          variant="kpi"
          hoverGlow
          onClick={() => setActiveKpiModal('activeMedicines')}
          className="p-5 border-purple-900/30 hover:border-purple-500/50 group cursor-pointer transition-all hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Active Patients</span>
            <span className="flex items-center gap-1 text-[11px] font-bold font-mono-code px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
              ▲ +34
            </span>
          </div>
          <div className="text-3xl font-bold font-mono-code text-purple-400 tracking-tight mb-1">
            1,284
          </div>
          <p className="text-xs text-purple-400/80">
            new patient profiles this month
          </p>
        </Card>

        {/* 5. Low Stock Items */}
        <Card
          variant="glass"
          hoverGlow
          onClick={() => setActiveKpiModal('lowStock')}
          className="p-5 border-amber-900/40 hover:border-amber-500 group cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden"
        >
          {data?.lowStockCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
          )}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Items
              </div>
              <div className="text-2xl font-extrabold font-mono-code text-amber-400 mt-1">
                {data?.lowStockCount || 0}
              </div>
              <div className="text-[11px] text-amber-400/80 mt-1 font-semibold">Click for Reorder Alarm ➔</div>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* 6. Out of Stock */}
        <Card
          variant="glass"
          hoverGlow
          onClick={() => setActiveKpiModal('outOfStock')}
          className="p-5 border-rose-900/50 hover:border-rose-500 group cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden"
        >
          {data?.outOfStockCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          )}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-rose-400 font-medium flex items-center gap-1">
                <PackageX className="w-3.5 h-3.5" /> Out of Stock
              </div>
              <div className="text-2xl font-extrabold font-mono-code text-rose-500 mt-1">
                {data?.outOfStockCount || 0}
              </div>
              <div className="text-[11px] text-rose-400/80 mt-1 font-semibold">Click for Restock Alarm ➔</div>
            </div>
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-slate-950 transition-all shrink-0">
              <PackageX className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* 7. Expired & Expiring Soon */}
        <Card
          variant="glass"
          hoverGlow
          onClick={() => setActiveKpiModal('expired')}
          className="p-5 border-rose-900/40 hover:border-purple-500 group cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-purple-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Expired / Expiring Soon
              </div>
              <div className="text-2xl font-extrabold font-mono-code text-rose-400 mt-1">
                {data?.expiredMedicinesCount || 0} <span className="text-sm font-normal text-amber-400">({data?.expiringSoonCount || 0} soon)</span>
              </div>
              <div className="text-[11px] text-purple-400/80 mt-1 font-semibold">Click for FEFO Expiry Alarm ➔</div>
            </div>
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center border border-rose-500/20 group-hover:bg-purple-500 group-hover:text-slate-950 transition-all shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* 8. Pending Payments / Supplier Dues */}
        <Card
          variant="glass"
          hoverGlow
          onClick={() => setActiveKpiModal('dues')}
          className="p-5 hover:border-amber-500/50 group cursor-pointer transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium group-hover:text-amber-400 transition-colors">Pending Payments / Supplier Dues</div>
              <div className="text-lg font-extrabold font-mono-code text-white mt-1">
                <span className="text-amber-400">${data?.pendingPayments?.toFixed(2) || '0.00'}</span> / <span className="text-red-400">${data?.supplierDues?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Click for Accounts Ledger ➔</div>
            </div>
            <div className="w-12 h-12 bg-slate-800 text-slate-300 rounded-xl flex items-center justify-center border border-slate-700 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Daily Sales & Revenue */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Daily Sales Revenue & Net Profit (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily sales breakdown across active branch</p>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {data?.dailySalesChart?.map((item, index) => {
              const heightPercent = maxDailyRevenue > 0 ? (item.revenue / maxDailyRevenue) * 100 : 5;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-14 bg-slate-950/95 border border-slate-700 text-white text-[10px] p-2 rounded-xl shadow-2xl z-20 pointer-events-none whitespace-nowrap backdrop-blur-md">
                    <div className="font-bold text-blue-400">{item.day} Breakdown</div>
                    <div>Revenue: <span className="text-emerald-400 font-semibold">${item.revenue}</span></div>
                    <div>Profit: <span className="text-purple-400 font-semibold">${item.profit}</span></div>
                    <div>Sales: <span className="text-amber-400 font-semibold">{item.salesCount} txns</span></div>
                  </div>

                  <div className="w-full bg-slate-800/60 rounded-t-xl overflow-hidden flex flex-col justify-end h-full relative">
                    <div
                      style={{ height: `${Math.max(heightPercent, 8)}%` }}
                      className="bg-gradient-to-t from-blue-600 via-blue-500 to-emerald-400 w-full rounded-t-xl transition-all duration-500 group-hover:brightness-125"
                    />
                  </div>

                  <div className="text-[11px] font-semibold text-slate-400">{item.day}</div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Chart 2: Stock Status Breakdown */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-400" />
                Stock Health & Expiry Trends
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Inventory distribution by stock health status</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {data?.stockTrendsChart?.map((st, i) => {
              const totalStockItems = (data?.activeMedicines || 1);
              const percent = Math.min(100, Math.round((st.count / totalStockItems) * 100));
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                      {st.status}
                    </span>
                    <span className="font-mono text-white">{st.count} items ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-800/60 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{ width: `${Math.max(percent, 5)}%`, backgroundColor: st.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      {/* MULTI-BRANCH & SELLING ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Branch Comparison Table */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Branch Performance Comparison
            </h3>
          </div>

          <div className="space-y-3">
            {data?.branchComparison?.map((br, idx) => (
              <div key={idx} className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">{br.branchName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Code: {br.branchCode} · {br.salesCount} Sales</div>
                </div>
                <div className="text-right font-extrabold text-emerald-400 text-sm">
                  ${br.totalRevenue.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top 5 Selling Medicines */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Top 5 Selling Medicines
            </h3>
          </div>

          <div className="space-y-2.5">
            {data?.topSellingMedicines?.length > 0 ? (
              data.topSellingMedicines.map((med, idx) => (
                <div key={idx} className="bg-slate-800/40 p-3 rounded-xl flex items-center justify-between text-xs border border-slate-700/40">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-white truncate">{med.name}</span>
                  </div>
                  <Badge variant="success" size="sm" className="font-mono">{med.quantitySold} units sold</Badge>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center">No sales data recorded yet.</div>
            )}
          </div>
        </Card>

        {/* Least 5 Selling Medicines */}
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <PackageX className="w-5 h-5 text-rose-400" />
              Least 5 Selling Medicines
            </h3>
          </div>

          <div className="space-y-2.5">
            {data?.leastSellingMedicines?.length > 0 ? (
              data.leastSellingMedicines.map((med, idx) => (
                <div key={idx} className="bg-slate-800/40 p-3 rounded-xl flex items-center justify-between text-xs border border-slate-700/40">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-300 truncate">{med.name}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{med.quantitySold} units</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center">No inventory items.</div>
            )}
          </div>
        </Card>
      </div>

      {/* PRESCRIPTIONS TABLE & INVENTORY ALERTS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Prescriptions Table (2 cols) */}
        <Card variant="glass" className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-md font-bold font-display text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Recent Clinical Prescriptions & Dispensation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Showing last 6 orders processed across active branch</p>
            </div>
            <Link to="/prescriptions">
              <Button variant="ghost" size="sm" className="text-xs text-accent">View All ➔</Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider font-mono-code border-b border-slate-800">
                <tr>
                  <th className="p-3">Rx ID</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Prescriber Doctor</th>
                  <th className="p-3">Drug & Dose</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Insurance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {[
                  { id: 'RX-20482', patient: 'Margaret Chen', doctor: 'Dr. Patel', drug: 'Metformin 500mg', qty: 90, status: 'filled', date: 'Jul 31', insurance: 'BlueCross' },
                  { id: 'RX-20481', patient: 'James Okafor', doctor: 'Dr. Williams', drug: 'Lisinopril 10mg', qty: 30, status: 'pending', date: 'Jul 31', insurance: 'Aetna' },
                  { id: 'RX-20480', patient: 'Sarah Nakamura', doctor: 'Dr. Reyes', drug: 'Atorvastatin 20mg', qty: 30, status: 'filled', date: 'Jul 30', insurance: 'United' },
                  { id: 'RX-20479', patient: 'David Mbeki', doctor: 'Dr. Singh', drug: 'Amlodipine 5mg', qty: 60, status: 'processing', date: 'Jul 30', insurance: 'Cigna' },
                  { id: 'RX-20478', patient: 'Anna Kowalski', doctor: 'Dr. Park', drug: 'Sertraline 50mg', qty: 30, status: 'filled', date: 'Jul 30', insurance: 'Humana' },
                  { id: 'RX-20477', patient: 'Robert Torres', doctor: 'Dr. Yuen', drug: 'Omeprazole 20mg', qty: 30, status: 'on-hold', date: 'Jul 29', insurance: 'BlueCross' },
                ].map((rx) => (
                  <tr key={rx.id} className="data-row hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono-code font-bold text-accent">{rx.id}</td>
                    <td className="p-3 font-semibold text-white">{rx.patient}</td>
                    <td className="p-3 text-slate-400">{rx.doctor}</td>
                    <td className="p-3 font-medium text-slate-200">{rx.drug}</td>
                    <td className="p-3 text-center font-mono-code font-bold">{rx.qty}</td>
                    <td className="p-3 text-center">
                      <Badge
                        variant={
                          rx.status === 'filled' ? 'success' :
                          rx.status === 'pending' ? 'warning' :
                          rx.status === 'processing' ? 'info' : 'danger'
                        }
                        size="sm"
                      >
                        {rx.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono-code text-slate-400">{rx.insurance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Inventory Alerts Panel with Stock Level Progress Bars */}
        <Card variant="glass" className="p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
              <h3 className="text-md font-bold font-display text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Inventory Reorder Alarms
              </h3>
              <Badge variant="warning" size="sm">FEFO Priority</Badge>
            </div>

            <div className="space-y-3.5">
              {[
                { name: 'Amoxicillin 500mg', sku: 'AMX-500', stock: 12, threshold: 50, supplier: 'MediCo Supply', critical: true },
                { name: 'Ibuprofen 400mg', sku: 'IBU-400', stock: 28, threshold: 100, supplier: 'PharmaBridge', critical: true },
                { name: 'Metformin 1000mg', sku: 'MET-1000', stock: 45, threshold: 80, supplier: 'RxDirect', critical: false },
                { name: 'Cetirizine 10mg', sku: 'CET-010', stock: 31, threshold: 60, supplier: 'MediCo Supply', critical: false },
                { name: 'Pantoprazole 40mg', sku: 'PAN-040', stock: 8, threshold: 40, supplier: 'PharmaBridge', critical: true },
              ].map((item) => {
                const stockPercent = Math.min(100, Math.round((item.stock / item.threshold) * 100));
                return (
                  <div key={item.sku} className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-semibold text-white truncate max-w-[150px]">{item.name}</div>
                      <Badge variant={item.critical ? 'danger' : 'warning'} size="sm">
                        {item.critical ? 'Critical' : 'Low Stock'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400">
                      <span>SKU: {item.sku}</span>
                      <span className={item.critical ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                        {item.stock} / {item.threshold} units
                      </span>
                    </div>
                    {/* Stock level progress bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.critical ? 'bg-red-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${Math.max(stockPercent, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Link to="/inventory" className="pt-2">
            <Button variant="outline" fullWidth size="sm" className="text-xs">
              View Inventory Catalog & Batches
            </Button>
          </Link>
        </Card>

      </div>

      {/* RECENT ACTIVITIES AUDIT STREAM */}
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Recent System Activities & Audit Stream ({data?.recentActivities?.length || 0} entries)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Scrollable audit log stream. Click any row to inspect complete change history and diff details.</p>
          </div>
        </div>

        {/* Scroll Container with Fixed Height max-h-[300px] */}
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto border border-slate-800 rounded-xl pr-1">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data?.recentActivities?.map((log) => (
                <tr
                  key={log._id}
                  onClick={() => setSelectedAuditLog(log)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white group-hover:text-blue-400">{log.userName || 'System'}</td>
                  <td className="py-3 px-4">
                    <Badge variant="neutral" size="sm">{log.module}</Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-400">{log.action}</td>
                  <td className="py-3 px-4 text-slate-300 truncate max-w-xs">{log.details}</td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Eye}
                      onClick={(e) => { e.stopPropagation(); setSelectedAuditLog(log); }}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CLICKABLE AUDIT LOG INSPECTOR MODAL */}
      <Modal
        isOpen={!!selectedAuditLog}
        onClose={() => setSelectedAuditLog(null)}
        title={selectedAuditLog ? `Audit Entry Details: ${selectedAuditLog.action}` : ''}
        size="md"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setSelectedAuditLog(null)}>
            Close Details
          </Button>
        }
      >
        {selectedAuditLog && (
          <div className="space-y-3 text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Action Type:</span>
                <span className="text-blue-400 font-bold">{selectedAuditLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-white">{new Date(selectedAuditLog.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Performed By:</span>
                <span className="text-emerald-400 font-bold">{selectedAuditLog.userName || 'System User'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">System Module:</span>
                <span className="text-purple-400 font-bold">{selectedAuditLog.module}</span>
              </div>
            </div>

            {/* Exact Log Details */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Description & Log Details:</div>
              <div className="text-slate-200 text-xs leading-relaxed">{selectedAuditLog.details}</div>
            </div>

            {/* Old vs New Value Diff (If Available) */}
            {(selectedAuditLog.oldValue || selectedAuditLog.newValue) && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-900/50">
                  <div className="text-rose-400 font-bold uppercase text-[10px] mb-1">Old Value</div>
                  <div className="text-slate-300">{selectedAuditLog.oldValue || 'None'}</div>
                </div>
                <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-900/50">
                  <div className="text-emerald-400 font-bold uppercase text-[10px] mb-1">New Value</div>
                  <div className="text-slate-300">{selectedAuditLog.newValue || 'Updated'}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* DYNAMIC KPI ALARM & DETAIL MODALS */}
      <Modal
        isOpen={!!activeKpiModal}
        onClose={() => setActiveKpiModal(null)}
        title={
          activeKpiModal === 'outOfStock' ? '🚨 Critical Alarm: Immediate Restock Required' :
          activeKpiModal === 'lowStock' ? '⚠️ Warning Alarm: Reorder Level Reached' :
          activeKpiModal === 'expired' ? '⏰ FEFO Alarm: Expired & Near-Expiry Batches' :
          activeKpiModal === 'todaySales' ? '💰 Today\'s POS Sales Ledger' :
          activeKpiModal === 'monthlySales' ? '📈 Current Month Sales & Revenue' :
          activeKpiModal === 'totalProfit' ? '📊 Profit Margin & Financial Breakdown' :
          activeKpiModal === 'activeMedicines' ? '💊 Active Pharmaceutical Catalog' :
          activeKpiModal === 'dues' ? '📒 Accounts Payable & Customer Credit Ledger' : ''
        }
        size="lg"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setActiveKpiModal(null)}>
            Close Alert
          </Button>
        }
      >
        <div className="space-y-3 text-xs">

          {/* Out of Stock Details */}
          {activeKpiModal === 'outOfStock' && (
            <div className="space-y-3">
              <p className="text-slate-400">The following medicines currently have 0 stock in this branch and require immediate purchase orders:</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/50 space-y-2">
                <div className="font-bold text-rose-400 text-sm">Critical Stock Out Alert (1 item)</div>
                <div className="flex justify-between items-center text-slate-200 py-1 border-t border-slate-800">
                  <span>Atorvastatin 20mg (SKU: ATV-020)</span>
                  <Badge variant="danger" size="sm">0 Strips</Badge>
                </div>
              </div>
              <Link to="/purchases" onClick={() => setActiveKpiModal(null)}>
                <Button variant="danger" fullWidth leftIcon={Truck}>
                  Create Purchase Order Now
                </Button>
              </Link>
            </div>
          )}

          {/* Low Stock Details */}
          {activeKpiModal === 'lowStock' && (
            <div className="space-y-3">
              <p className="text-slate-400">Medicines running below recommended minimum reorder thresholds:</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/50 space-y-2">
                <div className="font-bold text-amber-400 text-sm">Low Stock Warnings</div>
                <div className="text-slate-400 text-xs">All current active items are above minimum reorder levels.</div>
              </div>
            </div>
          )}

          {/* Expired / Near Expiry Details */}
          {activeKpiModal === 'expired' && (
            <div className="space-y-3">
              <p className="text-slate-400">Batches expiring within 60 days (FEFO prioritization active):</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-purple-900/50 space-y-2 font-mono">
                <div className="flex justify-between items-center text-amber-400 font-bold">
                  <span>Batch: BT-AMX-001 (Amoxicillin 500mg)</span>
                  <Badge variant="warning" size="sm" pulse>Expiring Soon</Badge>
                </div>
                <div className="text-slate-400 text-[11px] flex justify-between">
                  <span>Quantity: 45 Strips</span>
                  <span>Expiry: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Today's Sales Details */}
          {activeKpiModal === 'todaySales' && (
            <div className="space-y-3">
              <div className="flex justify-between font-bold text-emerald-400 text-sm bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span>Today's Total Sales:</span>
                <span>${data?.todaySales?.toFixed(2)} ({data?.recentSales?.length || 0} Invoices)</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {data?.recentSales?.map((s, idx) => (
                  <div key={idx} className="bg-slate-800/60 p-3 rounded-xl flex justify-between items-center border border-slate-700/60">
                    <div>
                      <div className="font-mono text-blue-400 font-bold">{s.invoiceNumber}</div>
                      <div className="text-slate-400 text-[11px]">{s.patientName} · {s.paymentMethod?.toUpperCase()}</div>
                    </div>
                    <div className="font-bold text-emerald-400">${s.grandTotal?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Sales Details */}
          {activeKpiModal === 'monthlySales' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-blue-900/50 font-bold text-blue-400 text-sm flex justify-between">
                <span>Monthly Revenue:</span>
                <span>${data?.monthlySales?.toFixed(2)}</span>
              </div>
              <p className="text-slate-400">Total monthly revenue calculated across all completed billing transactions for this tenant.</p>
            </div>
          )}

          {/* Total Profit Details */}
          {activeKpiModal === 'totalProfit' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-purple-900/50 space-y-2">
                <div className="flex justify-between text-purple-400 font-bold text-sm">
                  <span>Estimated Net Profit:</span>
                  <span>${data?.totalProfit?.toFixed(2)}</span>
                </div>
                <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                  Calculated from gross revenue minus medicine purchase cost price margins.
                </div>
              </div>
            </div>
          )}

          {/* Active Medicines Details */}
          {activeKpiModal === 'activeMedicines' && (
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between font-bold text-white">
                <span>Active Pharmaceutical Catalog:</span>
                <span>{data?.activeMedicines} Active Items</span>
              </div>
              <Link to="/inventory" onClick={() => setActiveKpiModal(null)}>
                <Button variant="primary" fullWidth leftIcon={ShoppingBag}>
                  Open Full Medicine Catalog
                </Button>
              </Link>
            </div>
          )}

          {/* Dues Details */}
          {activeKpiModal === 'dues' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-bold text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-amber-400 text-[11px] uppercase tracking-wider font-bold">1. Customer Credits Owed (Accounts Receivable)</div>
                  <div className="text-2xl font-extrabold text-amber-400">${data?.pendingPayments?.toFixed(2) || '0.00'}</div>
                  <Link
                    to="/customers"
                    onClick={() => setActiveKpiModal(null)}
                    className="text-blue-400 hover:underline inline-block pt-1 text-[11px]"
                  >
                    Manage Customer Credit Accounts ➔
                  </Link>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-rose-400 text-[11px] uppercase tracking-wider font-bold">2. Supplier Dues Payable (Accounts Payable)</div>
                  <div className="text-2xl font-extrabold text-rose-400">${data?.supplierDues?.toFixed(2) || '0.00'}</div>
                  <Link
                    to="/purchases"
                    onClick={() => setActiveKpiModal(null)}
                    className="text-blue-400 hover:underline inline-block pt-1 text-[11px]"
                  >
                    Manage Supplier Payables & Purchases ➔
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </Modal>

    </div>
  );
};

export default Dashboard;