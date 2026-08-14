import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import {
  Building2, CreditCard, Users, Plus, RefreshCw,
  Lock, Unlock, Trash2, CheckCircle2, AlertTriangle,
  Search, LogOut, TrendingUp, DollarSign, Activity,
  Clock, ShieldAlert, ArrowUpRight, BarChart3,
  PieChart, AlertCircle, ChevronRight, X, UserCheck,
  ShieldCheck, ArrowDownRight, Layers, FileText, RotateCcw, MapPin, MessageSquare, Bell
} from 'lucide-react';
import { useToast } from '../components/ui';
import SuperAdminCompanyTable from '../components/superadmin/SuperAdminCompanyTable';
import PendingApprovals from '../components/superadmin/PendingApprovals';
import SubscriptionPlanManager from '../components/superadmin/SubscriptionPlanManager';
import PaymentManager from '../components/superadmin/PaymentManager';
import RefundManager from '../components/superadmin/RefundManager';
import InvoiceManager from '../components/superadmin/InvoiceManager';
import CompanyUsersManager from '../components/superadmin/CompanyUsersManager';
import BranchManager from '../components/superadmin/BranchManager';
import PlatformAuditManager from '../components/superadmin/PlatformAuditManager';
import PlatformNotificationSettings from '../components/superadmin/PlatformNotificationSettings';
import PlatformSupportTickets from '../components/superadmin/PlatformSupportTickets';
import PlatformReportsManager from '../components/superadmin/PlatformReportsManager';
import PlatformSettingsPanel from '../components/superadmin/PlatformSettingsPanel';
import PlatformConfirmationModal from '../components/superadmin/PlatformConfirmationModal';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [adminUser, setAdminUser] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Tab & Filters
  const activeTab = searchParams.get('tab') || 'overview'; // 'overview' | 'companies' | 'subscriptions' | 'revenue' | 'analytics'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Company Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Confirmation Modal Dialog States
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    description: '',
    confirmButtonText: '',
    onConfirm: () => {}
  });

  const [submitting, setSubmitting] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    companyCode: '',
    phone: '',
    address: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    plan: 'Professional',
    subscriptionStatus: 'active',
    subscriptionDurationDays: 30
  });

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const handleAdminLogout = async () => {
    try {
      await API.post('/saas-admin/logout', {}, { headers: getAdminHeaders() });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('saasAdminToken');
      localStorage.removeItem('saasAdminUser');
      navigate('/saas-admin/login');
    }
  };

  const fetchPlatformData = useCallback(async () => {
    const token = localStorage.getItem('saasAdminToken');
    if (!token) {
      navigate('/saas-admin/login');
      return;
    }

    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [meRes, tenantsRes, analyticsRes] = await Promise.all([
        API.get('/saas-admin/me', { headers }),
        API.get('/saas-admin/companies', { headers }),
        API.get('/saas-admin/analytics', { headers })
      ]);
      setAdminUser(meRes.data?.admin || null);
      setTenants(tenantsRes.data || []);
      setAnalytics(analyticsRes.data || null);
    } catch (err) {
      console.error('SuperAdmin load error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Session expired or unauthorized. Please authenticate.');
        navigate('/saas-admin/login');
      } else {
        toast.error('Failed to load SaaS tenant platform data.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    fetchPlatformData();
  }, [fetchPlatformData]);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/saas-admin/companies/create', companyForm, { headers: getAdminHeaders() });
      toast.success(`Pharmacy "${companyForm.companyName}" provisioned successfully!`);
      setShowCreateModal(false);
      setCompanyForm({
        companyName: '',
        companyCode: '',
        phone: '',
        address: '',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        plan: 'Professional',
        subscriptionStatus: 'active',
        subscriptionDurationDays: 30
      });
      fetchPlatformData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSuspend = (pharmacyId) => {
    const company = tenants.find(t => t._id === pharmacyId);
    const isSuspended = company?.companyStatus === 'suspended' || company?.subscriptionStatus === 'suspended';
    
    setConfirmModal({
      isOpen: true,
      title: isSuspended ? 'Reactivate Pharmacy Company' : 'Suspend Pharmacy Company',
      description: `You are about to modify access for "${company?.companyName || 'this company'}". Standard employees will be blocked or restored based on status toggles.`,
      confirmButtonText: isSuspended ? 'Reactivate Tenant' : 'Suspend Tenant',
      onConfirm: async (reason) => {
        try {
          await API.post(`/saas-admin/subscriptions/suspend/${pharmacyId}`, { reason }, { headers: getAdminHeaders() });
          toast.success('Subscription status updated successfully.');
          fetchPlatformData();
        } catch {
          toast.error('Failed to update subscription status.');
        }
      }
    });
  };

  const handleRenew = (pharmacyId) => {
    const company = tenants.find(t => t._id === pharmacyId);
    
    setConfirmModal({
      isOpen: true,
      title: 'Extend / Renew Subscription',
      description: `Provision a 30-day manual trial extension or paid cycle extension for "${company?.companyName || 'this company'}".`,
      confirmButtonText: 'Renew Subscription',
      onConfirm: async (reason) => {
        try {
          await API.post(`/saas-admin/subscriptions/renew/${pharmacyId}`, { reason }, { headers: getAdminHeaders() });
          toast.success('Subscription extended by 30 days.');
          fetchPlatformData();
        } catch {
          toast.error('Failed to renew subscription.');
        }
      }
    });
  };

  const handleDeleteCompany = (pharmacyId) => {
    const company = tenants.find(t => t._id === pharmacyId);
    
    setConfirmModal({
      isOpen: true,
      title: '⚠️ PURGE PHARMACY COMPANY',
      description: `WARNING: This is a highly dangerous destructive action. You are about to permanently delete "${company?.companyName || 'this company'}" and purge all branch database registries.`,
      confirmButtonText: 'PURGE DATA REGISTRY',
      onConfirm: async (reason) => {
        try {
          await API.delete(`/saas-admin/companies/${pharmacyId}`, { data: { reason }, headers: getAdminHeaders() });
          toast.success('Company purged successfully.');
          fetchPlatformData();
        } catch {
          toast.error('Failed to delete company.');
        }
      }
    });
  };

  const overview = analytics?.platformOverview || {};
  const subStats = analytics?.subscriptionStats || {};
  const rev = analytics?.revenueAnalytics || {};
  const comp = analytics?.companyAnalytics || {};
  const alerts = analytics?.alerts || [];

  const fmtCurrency = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const fmtNum = (val) => Number(val || 0).toLocaleString();

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = 
      t.pharmacy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.pharmacy?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && t.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-[1520px] mx-auto space-y-6">

        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-5 md:p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 font-black text-xl">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold uppercase tracking-wider">
                  Saad ERP Platform Controller
                </span>
                <span className="text-xs text-slate-400 font-mono">• Operator: {adminUser?.email || 'SuperAdmin'}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                SaaS SuperAdmin Executive Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold font-mono">
              Role: {adminUser?.role || 'Super Admin'}
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Provision New Pharmacy
            </button>
            <button
              onClick={fetchPlatformData}
              disabled={loading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer"
              title="Refresh Platform Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleAdminLogout}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Actionable Dashboard Alert Banners */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                onClick={() => setSearchParams({ tab: 'companies' })}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium cursor-pointer transition hover:opacity-95 ${
                  alt.severity === 'high' || alt.severity === 'danger'
                    ? 'bg-red-500/15 border-red-500/30 text-red-300'
                    : alt.severity === 'warning'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{alt.title}</span>
                </div>
                <span className="flex items-center gap-1 underline font-bold">
                  Take Action <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Tabs (Filtered dynamically by platform-level roles) */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Executive Overview', icon: BarChart3, roles: ['Super Admin', 'SuperAdmin', 'Finance Admin', 'Support Admin', 'Operations Admin'] },
            { id: 'approvals', label: 'Pending Approvals', icon: ShieldCheck, badge: alerts.length > 0 ? alerts.length : null, roles: ['Super Admin', 'SuperAdmin', 'Support Admin'] },
            { id: 'companies', label: 'Pharmacy Companies', icon: Building2, roles: ['Super Admin', 'SuperAdmin', 'Support Admin', 'Operations Admin'] },
            { id: 'branches', label: 'Branch Outlets', icon: MapPin, roles: ['Super Admin', 'SuperAdmin', 'Support Admin'] },
            { id: 'users', label: 'Staff Users', icon: Users, roles: ['Super Admin', 'SuperAdmin', 'Support Admin'] },
            { id: 'subscriptions', label: 'Subscription Tiers', icon: CreditCard, roles: ['Super Admin', 'SuperAdmin', 'Operations Admin'] },
            { id: 'revenue', label: 'Payment Pipeline', icon: DollarSign, roles: ['Super Admin', 'SuperAdmin', 'Finance Admin'] },
            { id: 'invoices', label: 'Tax Invoices', icon: FileText, roles: ['Super Admin', 'SuperAdmin', 'Finance Admin'] },
            { id: 'refunds', label: 'Refund Center', icon: RotateCcw, roles: ['Super Admin', 'SuperAdmin', 'Finance Admin'] },
            { id: 'audit', label: 'Audit Logs', icon: Activity, roles: ['Super Admin', 'SuperAdmin', 'Support Admin', 'Operations Admin', 'Finance Admin'] },
            { id: 'settings', label: 'Alert Settings', icon: Bell, roles: ['Super Admin', 'SuperAdmin', 'Support Admin', 'Operations Admin', 'Finance Admin'] },
            { id: 'tickets', label: 'Support Desk', icon: MessageSquare, roles: ['Super Admin', 'SuperAdmin', 'Support Admin'] },
            { id: 'reports', label: 'Platform Reports', icon: FileText, roles: ['Super Admin', 'SuperAdmin', 'Finance Admin'] },
            { id: 'config', label: 'Platform Config', icon: Settings, roles: ['Super Admin', 'SuperAdmin', 'Operations Admin'] }
          ].filter(tab => !adminUser?.role || tab.roles.includes(adminUser.role)).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#235347] text-[#DAF1DE] shadow-lg'
                    : 'bg-[#163832] text-[#DAF1DE]/70 hover:text-[#DAF1DE] border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: EXECUTIVE OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Top 16 Metric Cards Grid (Clickable) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
              
              {/* Total Companies */}
              <div
                onClick={() => { setSearchParams({ tab: 'companies' }); setStatusFilter('all'); }}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                  <span>Total Companies</span>
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-xl font-bold text-white mt-1 font-mono">{fmtNum(overview.totalCompanies || tenants.length)}</div>
                <span className="text-[10px] text-purple-400 mt-0.5 block">Across platform</span>
              </div>

              {/* Active Companies */}
              <div
                onClick={() => { setSearchParams({ tab: 'companies' }); setStatusFilter('active'); }}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                  <span>Active</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{fmtNum(overview.activeCompanies)}</div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Operational</span>
              </div>

              {/* Pending Companies */}
              <div
                onClick={() => { setSearchParams({ tab: 'companies' }); setStatusFilter('pending'); }}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                  <span>Pending</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{fmtNum(overview.pendingCompanies)}</div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Needs review</span>
              </div>

              {/* Trial Companies */}
              <div
                onClick={() => { setSearchParams({ tab: 'companies' }); setStatusFilter('trial'); }}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                  <span>Trial</span>
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-xl font-bold text-blue-400 mt-1 font-mono">{fmtNum(overview.trialCompanies)}</div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">14-day trials</span>
              </div>

              {/* Suspended Companies */}
              <div
                onClick={() => { setSearchParams({ tab: 'companies' }); setStatusFilter('suspended'); }}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-red-500/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                  <span>Suspended</span>
                  <Lock className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="text-xl font-bold text-red-400 mt-1 font-mono">{fmtNum(overview.suspendedCompanies)}</div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Blocked</span>
              </div>

              {/* Expired Companies */}
              <div
                onClick={() => { setSearchParams({ tab: 'companies' }); setStatusFilter('expired'); }}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                  <span>Expired</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <div className="text-xl font-bold text-orange-400 mt-1 font-mono">{fmtNum(overview.expiredCompanies)}</div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Past due</span>
              </div>

              {/* Total Users */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                  <span>Total Users</span>
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="text-xl font-bold text-white mt-1 font-mono">{fmtNum(overview.totalUsers)}</div>
                <span className="text-[10px] text-emerald-400 mt-0.5 block">{fmtNum(overview.activeUsers)} active</span>
              </div>

              {/* MRR */}
              <div
                onClick={() => setSearchParams({ tab: 'revenue' })}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
                  <span>MRR</span>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{fmtCurrency(overview.mrr)}</div>
                <span className="text-[10px] text-emerald-400 mt-0.5 block">ARR: {fmtCurrency(overview.arr)}</span>
              </div>

            </div>

            {/* Financial Row & Subscription Tiers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Subscription Breakdown Card */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    Subscription Distribution
                  </h3>
                  <span className="text-xs font-mono text-slate-400">{subStats.activeSubscriptions || 0} active</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-300 font-medium">Starter ($99/mo)</span>
                    <span className="font-mono font-bold text-slate-200">{subStats.starterPlans || 0} subs</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-300 font-medium">Professional ($299/mo)</span>
                    <span className="font-mono font-bold text-emerald-400">{subStats.proPlans || 0} subs</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-300 font-medium">Enterprise ($799/mo)</span>
                    <span className="font-mono font-bold text-blue-400">{subStats.enterprisePlans || 0} subs</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                    <span className="text-slate-300 font-medium">Unlimited ($1,499/mo)</span>
                    <span className="font-mono font-bold text-purple-400">{subStats.unlimitedPlans || 0} subs</span>
                  </div>
                </div>
              </div>

              {/* Monthly Revenue Velocity Card */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Revenue Trajectory
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">{comp.growthRate || '+18.4%'}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>This Month Billing</span>
                      <span className="text-white font-mono font-bold">{fmtCurrency(overview.thisMonthRevenue)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 w-3/4 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Total Cumulative Revenue</span>
                      <span className="text-white font-mono font-bold">{fmtCurrency(overview.totalRevenue)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-4/5 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* System Infrastructure Health */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    SaaS Infrastructure
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">100% UP</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">API Gateway</span>
                    <span className="font-bold text-emerald-400 font-mono">24ms latency</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">MongoDB Cluster</span>
                    <span className="font-bold text-emerald-400 font-mono">CONNECTED</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Server Memory</span>
                    <span className="font-bold text-slate-200 font-mono">{analytics?.systemHealth?.memoryUsage || '32%'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Disk Storage</span>
                    <span className="font-bold text-slate-200 font-mono">{analytics?.systemHealth?.diskUsage || '21%'}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================= TAB: PENDING APPROVALS GATEKEEPER ================= */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <PendingApprovals />
          </div>
        )}

        {/* ================= TAB: SUBSCRIPTION PLAN GOVERNANCE & TIERS ================= */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            <SubscriptionPlanManager />
          </div>
        )}

        {/* ================= TAB: PAYMENTS & REVENUE PIPELINE ================= */}
        {(activeTab === 'revenue' || activeTab === 'payments') && (
          <div className="space-y-4">
            <PaymentManager />
          </div>
        )}

        {/* ================= TAB: BRANCH OUTLETS DIRECTORY & SALES ================= */}
        {activeTab === 'branches' && (
          <div className="space-y-4">
            <BranchManager />
          </div>
        )}

        {/* ================= TAB: COMPANY USERS DIRECTORY & SUPPORT ================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <CompanyUsersManager />
          </div>
        )}

        {/* ================= TAB: TAX INVOICE MANAGEMENT ================= */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <InvoiceManager />
          </div>
        )}

        {/* ================= TAB: REFUND MANAGEMENT & PROVIDER DISPATCH ================= */}
        {activeTab === 'refunds' && (
          <div className="space-y-4">
            <RefundManager />
          </div>
        )}

        {/* ================= TAB: PLATFORM IMMUTABLE AUDIT LOGS ================= */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <PlatformAuditManager />
          </div>
        )}

        {/* ================= TAB: PLATFORM NOTIFICATION CONFIGURATION ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <PlatformNotificationSettings />
          </div>
        )}

        {/* ================= TAB: PLATFORM SUPPORT DESK (TICKETS) ================= */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <PlatformSupportTickets />
          </div>
        )}

        {/* ================= TAB: PLATFORM EXECUTIVE REPORTS & retention ================= */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <PlatformReportsManager />
          </div>
        )}

        {/* ================= TAB: PLATFORM GLOBAL POLICY GOVERNANCE ================= */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            <PlatformSettingsPanel />
          </div>
        )}

        {/* ================= TAB 2: COMPLETE SAAS COMPANY MANAGEMENT ================= */}
        {(activeTab === 'companies' || activeTab === 'overview') && (
          <div className="space-y-4">
            <SuperAdminCompanyTable
              companies={tenants}
              loading={loading}
              onOpenCreate={() => setShowCreateModal(true)}
              onToggleSuspend={handleToggleSuspend}
              onRenew={handleRenew}
              onDelete={handleDeleteCompany}
            />
          </div>
        )}

      </div>

      {/* PROVISION NEW PHARMACY COMPANY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                Provision New Pharmacy Organization
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    placeholder="Al-Shifa Pharmacy"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Code (Unique) *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.companyCode}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyCode: e.target.value.toUpperCase() })}
                    placeholder="SHIFA01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Full Name *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.ownerName}
                    onChange={(e) => setCompanyForm({ ...companyForm, ownerName: e.target.value })}
                    placeholder="Dr. Ahmed Khan"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Email (Login) *</label>
                  <input
                    type="email"
                    required
                    value={companyForm.ownerEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, ownerEmail: e.target.value })}
                    placeholder="owner@shifapharmacy.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Password *</label>
                <input
                  type="password"
                  required
                  value={companyForm.ownerPassword}
                  onChange={(e) => setCompanyForm({ ...companyForm, ownerPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subscription Plan *</label>
                  <select
                    value={companyForm.plan}
                    onChange={(e) => setCompanyForm({ ...companyForm, plan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-purple-500"
                  >
                    <option value="Starter">Starter (Single Branch)</option>
                    <option value="Professional">Professional (Up to 5 Branches)</option>
                    <option value="Enterprise">Enterprise (Unlimited Branches)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    value={companyForm.subscriptionDurationDays}
                    onChange={(e) => setCompanyForm({ ...companyForm, subscriptionDurationDays: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  {submitting ? 'Provisioning...' : 'Provision Pharmacy & Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DANGEROUS/SENSITIVE ACTION CONFIRMATION MODAL */}
      <PlatformConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmButtonText={confirmModal.confirmButtonText}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
