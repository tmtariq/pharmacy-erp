import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
  Building2, CreditCard, DollarSign, Users,
  MapPin, Activity, ShieldCheck, FileText,
  HelpCircle, Settings, ArrowLeft, RefreshCw,
  Lock, Unlock, Edit3, Clock, CheckCircle2,
  XCircle, AlertTriangle, ExternalLink, Calendar,
  TrendingUp, Download, Eye, Sparkles, Server,
  Sliders, Shield, Trash2, KeyRound
} from 'lucide-react';
import { useToast } from '../components/ui';

export default function CompanyDetailCenter() {
  const { pharmacyId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | subscription | billing | users | branches | usage | activity | invoices | support | settings

  // Modals & Action States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Suspend Form State
  const [suspendForm, setSuspendForm] = useState({
    reason: 'Non-payment / compliance review',
    effectiveMode: 'immediate', // 'immediate' | 'scheduled'
    effectiveDate: '',
    notifyOwner: true,
    accessMode: 'blocked' // 'blocked' | 'read_only'
  });

  // Reactivate Form State
  const [reactivateForm, setReactivateForm] = useState({
    restoreSubscription: true,
    extendDays: 30,
    gracePeriodDays: 7,
    notes: 'Account reactivated upon compliance clearance'
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    legalName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    licenseNumber: '',
    businessRegistrationNumber: '',
    taxNumber: '',
    logo: '',
    companyStatus: 'Active',
    internalAdminNotes: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: ''
  });

  // Plan / Extend form states
  const [newPlan, setNewPlan] = useState('Professional');
  const [extendDays, setExtendDays] = useState(30);

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchCompanyDetails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/saas-admin/companies/${pharmacyId}`, { headers: getAdminHeaders() });
      setData(res.data);
      const c = res.data.company;
      const o = res.data.owner;
      setEditForm({
        name: c?.name || '',
        legalName: c?.legalName || '',
        phone: c?.phone || '',
        email: c?.email || '',
        address: c?.address || '',
        city: c?.city || '',
        country: c?.country || '',
        licenseNumber: c?.licenseNumber || '',
        businessRegistrationNumber: c?.businessRegistrationNumber || '',
        taxNumber: c?.taxNumber || '',
        logo: c?.logo || '',
        companyStatus: c?.companyStatus || 'Active',
        internalAdminNotes: c?.internalAdminNotes || '',
        ownerName: o?.name || '',
        ownerEmail: o?.email || '',
        ownerPassword: ''
      });
      setNewPlan(res.data.subscription?.plan || 'Professional');
    } catch (err) {
      toast.error('Failed to load company management center data');
      navigate('/saas-admin/portal?tab=companies');
    } finally {
      setLoading(false);
    }
  }, [pharmacyId, getAdminHeaders, navigate, toast]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put(`/saas-admin/companies/${pharmacyId}`, editForm, { headers: getAdminHeaders() });
      toast.success('Company profile and credentials updated successfully!');
      setShowEditModal(false);
      fetchCompanyDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteSuspend = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post(`/saas-admin/subscriptions/suspend/${pharmacyId}`, suspendForm, { headers: getAdminHeaders() });
      toast.success(res.data?.message || 'Company suspended with recorded audit log.');
      setShowSuspendModal(false);
      fetchCompanyDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to suspend company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteReactivate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post(`/saas-admin/subscriptions/reactivate/${pharmacyId}`, reactivateForm, { headers: getAdminHeaders() });
      toast.success(res.data?.message || 'Company successfully reactivated.');
      setShowReactivateModal(false);
      fetchCompanyDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reactivate company');
    } finally {
      setSubmitting(false);
    }
  };

  // Subscription Action Engine State
  const [showSubActionModal, setShowSubActionModal] = useState(false);
  const [subActionType, setSubActionType] = useState('upgrade'); // 'upgrade' | 'downgrade' | 'change_plan' | 'extend' | 'add_trial' | 'add_grace' | 'apply_discount' | 'cancel' | 'reactivate'
  const [subActionForm, setSubActionForm] = useState({
    planName: 'Enterprise',
    billingCycle: 'monthly',
    extendDays: 30,
    trialDays: 14,
    graceDays: 7,
    discountPercent: 0,
    discountAmount: 0,
    customPrice: '',
    notes: ''
  });

  // Secure Support ERP Access Mode State
  const [showSupportAccessModal, setShowSupportAccessModal] = useState(false);
  const [supportReason, setSupportReason] = useState('Investigating batch inventory and dispensing discrepancy');
  const [supportRequestedBy, setSupportRequestedBy] = useState('Customer Support Ticket #8921');
  const [launchingSupport, setLaunchingSupport] = useState(false);

  const getSubActionTitle = () => {
    switch (subActionType) {
      case 'upgrade': return 'Upgrade Subscription Tier';
      case 'downgrade': return 'Downgrade Subscription Tier';
      case 'change_plan': return 'Change Subscription Plan';
      case 'extend': return 'Extend Subscription Duration';
      case 'add_trial': return 'Add Free Trial Days';
      case 'add_grace': return 'Add Grace Period Buffer';
      case 'apply_discount': return 'Apply Special Discount / Custom Rate';
      case 'cancel': return 'Cancel Subscription';
      case 'reactivate': return 'Reactivate Subscription Access';
      default: return 'Modify Subscription';
    }
  };

  const getSubActionEffectSummary = () => {
    switch (subActionType) {
      case 'upgrade':
      case 'downgrade':
      case 'change_plan':
        return `Will change tier from "${data?.subscription?.plan || 'Current'}" to "${subActionForm.planName}". All feature flags, quotas (branches, users, storage), and billing rate will immediately re-sync.`;
      case 'extend':
        return `Will add +${subActionForm.extendDays || 30} days to the expiration date. Current expiration (${data?.subscription?.expiresAt ? new Date(data.subscription.expiresAt).toLocaleDateString() : 'N/A'}) will be postponed.`;
      case 'add_trial':
        return `Will grant +${subActionForm.trialDays || 14} days of trial access. Status will update to "Trial" with zero billing charge required during this period.`;
      case 'add_grace':
        return `Will grant +${subActionForm.graceDays || 7} days grace period. Staff can continue accessing the ERP without lockout even if their standard renewal invoice is pending.`;
      case 'apply_discount':
        return subActionForm.discountPercent > 0
          ? `Will apply a ${subActionForm.discountPercent}% discount to standard price. Final billing amount will be adjusted automatically.`
          : subActionForm.discountAmount > 0
          ? `Will deduct $${subActionForm.discountAmount} from the base rate per ${subActionForm.billingCycle}.`
          : 'Will apply custom price adjustment to billing schedule.';
      case 'cancel':
        return 'Will mark the subscription as "Cancelled" at period end. Automatic renewals will stop, and ERP access will terminate upon cycle expiration.';
      case 'reactivate':
        return 'Will restore active subscription status, unlock all locked branch cashiers/pharmacists, and initialize a fresh 30-day billing cycle.';
      default:
        return 'Will apply changes to tenant subscription schedule and record an audit log.';
    }
  };

  const handleOpenSubAction = (actionType) => {
    setSubActionType(actionType);
    setSubActionForm({
      planName: actionType === 'upgrade' ? 'Enterprise' : actionType === 'downgrade' ? 'Basic' : (data?.subscription?.plan || 'Professional'),
      billingCycle: data?.subscription?.billingCycle || 'monthly',
      extendDays: 30,
      trialDays: 14,
      graceDays: 7,
      discountPercent: data?.subscription?.discountPercent || 0,
      discountAmount: data?.subscription?.discountAmount || 0,
      customPrice: data?.subscription?.price || '',
      notes: ''
    });
    setShowSubActionModal(true);
  };

  const handleExecuteSubAction = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        actionType: subActionType,
        ...subActionForm
      };
      const res = await API.post(`/saas-admin/subscriptions/modify/${pharmacyId}`, payload, { headers: getAdminHeaders() });
      toast.success(res.data?.message || 'Subscription successfully updated!');
      setShowSubActionModal(false);
      fetchCompanyDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to modify subscription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8 font-sans">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading Company Management Center...</p>
        </div>
      </div>
    );
  }

  const { company, subscription, owner, branches = [], users = [], usage = {}, invoices = [], supportTickets = [], auditLogs = [] } = data;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const formatDateTime = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-md shadow-2xl">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/saas-admin/portal?tab=companies')}
                className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Return to Company Directory"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold uppercase tracking-wider">
                    SaaS Company Detail & Control Center
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {company.code}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-0.5">
                  {company.name}
                </h1>
              </div>
            </div>

            {/* Top Operational Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowSupportAccessModal(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-purple-600/20"
                title="Secure Support ERP Access Mode"
              >
                <Eye className="w-3.5 h-3.5" />
                View Company ERP
              </button>

              <button
                onClick={() => setShowEditModal(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                Edit Company
              </button>

              <button
                onClick={() => setShowPlanModal(true)}
                className="px-3.5 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Change Plan
              </button>

              <button
                onClick={() => setShowExtendModal(true)}
                className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                Extend Subs
              </button>

              {String(company.companyStatus).toLowerCase() === 'suspended' ? (
                <button
                  onClick={() => setShowReactivateModal(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30 shadow-lg shadow-emerald-500/10"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Reactivate Company
                </button>
              ) : (
                <button
                  onClick={() => setShowSuspendModal(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30 shadow-lg shadow-amber-500/10"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Suspend Company
                </button>
              )}

              <button
                onClick={handleCancelSubscription}
                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Cancel Subscription"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel Subs
              </button>
            </div>
          </div>

          {/* Quick Header Information Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Company ID</span>
              <span className="font-mono font-bold text-purple-300 mt-0.5 block">{company.code}</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Current Status</span>
              <span className={`font-bold capitalize mt-0.5 block ${company.companyStatus === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {company.companyStatus}
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Subscription Plan</span>
              <span className="font-bold text-blue-400 mt-0.5 block">{subscription.plan}</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Subscription Expiry</span>
              <span className="font-mono font-bold text-slate-200 mt-0.5 block">{formatDate(subscription.expiresAt)}</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Authorized Owner</span>
              <span className="font-bold text-white mt-0.5 block truncate">{owner.name}</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Owner Email</span>
              <span className="font-mono text-slate-300 mt-0.5 block truncate">{owner.email}</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Total Branches</span>
              <span className="font-bold text-white mt-0.5 block font-mono">{branches.length} Outlets</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Total Staff Users</span>
              <span className="font-bold text-emerald-400 mt-0.5 block font-mono">{users.length} Active</span>
            </div>
          </div>

        </div>

        {/* 10 Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'subscription', label: 'Subscription', icon: CreditCard },
            { id: 'billing', label: 'Billing', icon: DollarSign },
            { id: 'users', label: `Users (${users.length})`, icon: Users },
            { id: 'branches', label: `Branches (${branches.length})`, icon: MapPin },
            { id: 'usage', label: 'Usage & Quotas', icon: Server },
            { id: 'activity', label: 'Activity Logs', icon: Activity },
            { id: 'invoices', label: 'Invoices', icon: FileText },
            { id: 'support', label: 'Support Tickets', icon: HelpCircle },
            { id: 'settings', label: 'Settings & Flags', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Organization Profile Details */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 lg:col-span-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Pharmacy Organization Profile
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Company Legal Name</span>
                  <span className="font-bold text-white mt-1 block">{company.name}</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Organization Code</span>
                  <span className="font-mono font-bold text-purple-300 mt-1 block">{company.code}</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">License Number</span>
                  <span className="font-mono text-slate-200 mt-1 block">{company.licenseNumber || 'LIC-USA-88219'}</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Tax ID / NTN</span>
                  <span className="font-mono text-slate-200 mt-1 block">{company.taxNumber || 'TAX-99210-NY'}</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Official Phone</span>
                  <span className="font-mono text-slate-200 mt-1 block">{company.phone || owner.phone || 'N/A'}</span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Registered Email</span>
                  <span className="font-mono text-slate-200 mt-1 block">{company.email || owner.email}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Headquarters Location</span>
                  <span className="font-medium text-slate-200">{company.address || 'Headquarters Office, 4th Avenue, NY'}</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 font-mono text-[11px] text-slate-400">
                  {company.city}, {company.country}
                </span>
              </div>
            </div>

            {/* Quick Actions & ERP Viewer Card */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Administrative Shortcuts
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('activity')}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-semibold text-slate-200 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    View Activity Log
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <button
                  onClick={() => setActiveTab('billing')}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-semibold text-slate-200 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    View Billing History
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-semibold text-slate-200 flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    View Staff Accounts ({users.length})
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: SUBSCRIPTION & TRIAL ================= */}
        {activeTab === 'subscription' && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
            
            {/* DEDICATED TRIAL STATUS & EXTENSION BANNER */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-950 to-purple-950/30 border border-blue-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">SaaS Trial Lifecycle & Governance</h4>
                    <span className="text-[11px] text-slate-400">Complimentary evaluation timeline and expiration policy</span>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenSubAction('add_trial')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-600/20 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Extend Trial Duration
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* 1. Trial Status */}
                <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block font-medium">Trial:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${data?.trial?.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span className={`text-sm font-bold ${data?.trial?.isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {data?.trial?.isActive ? 'Active' : 'Ended / Converted'}
                    </span>
                  </div>
                </div>

                {/* 2. Started */}
                <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block font-medium">Started:</span>
                  <span className="text-sm font-mono font-bold text-white mt-1 block">
                    {formatDate(data?.trial?.startedAt)}
                  </span>
                </div>

                {/* 3. Ends */}
                <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block font-medium">Ends:</span>
                  <span className="text-sm font-mono font-bold text-blue-400 mt-1 block">
                    {formatDate(data?.trial?.endsAt)}
                  </span>
                </div>

                {/* 4. Days remaining */}
                <div className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[11px] block font-medium">Days remaining:</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-xl font-black font-mono ${
                      (data?.trial?.daysRemaining || 0) <= 3 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {data?.trial?.daysRemaining ?? 14}
                    </span>
                    <span className="text-[11px] text-slate-400">days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  Subscription Schedule & Lifecycle Management
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive subscription matrix, billing cycles, auto-renewals, and administrative adjustments.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleOpenSubAction('upgrade')}
                  className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-1"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Upgrade Plan
                </button>
                <button
                  onClick={() => handleOpenSubAction('downgrade')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-700 cursor-pointer flex items-center gap-1"
                >
                  <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />
                  Downgrade
                </button>
                <button
                  onClick={() => handleOpenSubAction('change_plan')}
                  className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Change Plan
                </button>
                <button
                  onClick={() => handleOpenSubAction('extend')}
                  className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Extend (+Days)
                </button>
              </div>
            </div>

            {/* 9 Core Subscription Matrix Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 text-xs">
              
              {/* 1. Current Plan */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">1. Current Plan</span>
                  <span className="text-xl font-black text-white mt-1 block tracking-tight">{subscription.plan}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Tier Category</span>
                  <span className="font-bold text-purple-400">{subscription.plan} Edition</span>
                </div>
              </div>

              {/* 2. Subscription Status */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">2. Subscription Status</span>
                  <div className="mt-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      String(subscription.status).toLowerCase() === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : String(subscription.status).toLowerCase() === 'trial'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : String(subscription.status).toLowerCase() === 'suspended'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {subscription.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Access Gateway</span>
                  <span className="font-semibold text-slate-300">
                    {String(subscription.status).toLowerCase() === 'active' ? 'Full ERP & POS' : 'Restricted'}
                  </span>
                </div>
              </div>

              {/* 3. Start Date */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">3. Start Date</span>
                  <span className="text-base font-mono font-bold text-white mt-1 block">{formatDate(subscription.startDate)}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">First Provisioned</span>
                  <span className="font-mono text-slate-400">{formatDate(subscription.startDate)}</span>
                </div>
              </div>

              {/* 4. Renewal Date */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">4. Renewal Date</span>
                  <span className="text-base font-mono font-bold text-blue-400 mt-1 block">{formatDate(subscription.renewalDate || subscription.expiresAt)}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Upcoming Invoicing</span>
                  <span className="font-semibold text-blue-300">{subscription.remainingDays || 0} days remaining</span>
                </div>
              </div>

              {/* 5. Expiry Date */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">5. Expiry Date</span>
                  <span className="text-base font-mono font-bold text-emerald-400 mt-1 block">{formatDate(subscription.expiresAt)}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Grace Buffer</span>
                  <span className="font-semibold text-amber-400">+{subscription.gracePeriodDays || 0} Grace Days</span>
                </div>
              </div>

              {/* 6. Billing Cycle */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">6. Billing Cycle</span>
                  <span className="text-base font-bold capitalize text-purple-300 mt-1 block">{subscription.billingCycle || 'Monthly'}</span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Cadence</span>
                  <span className="font-semibold text-slate-300">{subscription.billingCycle === 'yearly' ? 'Annual Invoicing' : 'Monthly Recurring'}</span>
                </div>
              </div>

              {/* 7. Amount & Pricing */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">7. Amount / Rate</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black font-mono text-emerald-400">${subscription.amount ?? subscription.price}</span>
                    <span className="text-slate-500 text-[11px]">/ {subscription.billingCycle || 'mo'}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Discounts Applied</span>
                  <span className="font-semibold text-emerald-400">
                    {subscription.discountPercent > 0 ? `${subscription.discountPercent}% Off` : subscription.discountAmount > 0 ? `-$${subscription.discountAmount}` : 'Standard'}
                  </span>
                </div>
              </div>

              {/* 8. Payment Status */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">8. Payment Status</span>
                  <div className="mt-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      String(subscription.paymentStatus).toLowerCase() === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {subscription.paymentStatus || 'Paid'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Billing Channel</span>
                  <span className="font-semibold text-slate-300">Direct Gateway</span>
                </div>
              </div>

              {/* 9. Auto-Renewal Status */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">9. Auto-Renewal Status</span>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${subscription.autoRenew ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <span className="text-xs font-bold text-white">
                      {subscription.autoRenew ? 'Enabled (Automatic)' : 'Disabled (Manual Renewal)'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Recurring Invoicing</span>
                  <span className="font-semibold text-blue-300">{subscription.autoRenew ? 'Active' : 'Off'}</span>
                </div>
              </div>

            </div>

            {/* Secondary Action Toolbar */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                Administrative Adjustments:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleOpenSubAction('add_trial')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-300 border border-blue-500/30 font-semibold cursor-pointer"
                >
                  + Add Trial Days
                </button>

                <button
                  onClick={() => handleOpenSubAction('add_grace')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-semibold cursor-pointer"
                >
                  + Add Grace Period
                </button>

                <button
                  onClick={() => handleOpenSubAction('apply_discount')}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 font-semibold cursor-pointer"
                >
                  🏷️ Apply Discount
                </button>

                {String(subscription.status).toLowerCase() === 'cancelled' ? (
                  <button
                    onClick={() => handleOpenSubAction('reactivate')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold cursor-pointer"
                  >
                    Reactivate Subscription
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenSubAction('cancel')}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold cursor-pointer"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: BILLING ================= */}
        {activeTab === 'billing' && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              SaaS Billing & Payment Pipeline
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Monthly Rate</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">${subscription.price}.00</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Payment Gateway</span>
                <span className="text-xl font-bold text-slate-200 mt-1 block">Stripe / Wire</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Outstanding Balance</span>
                <span className="text-xl font-bold font-mono text-slate-200 mt-1 block">$0.00</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: USERS ================= */}
        {activeTab === 'users' && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Registered Employee & Staff Accounts ({users.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-bold text-white">{u.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          u.role === 'Owner' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-400 font-semibold">Active</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: BRANCHES ================= */}
        {activeTab === 'branches' && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              Configured Pharmacy Branch Outlets ({branches.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.map((b) => (
                <div key={b._id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{b.name}</span>
                    {b.isMain && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                        Main HQ
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 font-mono text-[11px]">Code: {b.code}</p>
                  <p className="text-slate-300">{b.address || 'Store Location'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: USAGE & LIMITS MONITORING ================= */}
        {activeTab === 'usage' && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  SaaS Quota & Resource Usage Monitor
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time resource consumption tracking against assigned <strong>{subscription?.plan || 'Professional'}</strong> plan tier limits.
                </p>
              </div>

              {/* Warning Thresholds Legend */}
              <div className="flex items-center gap-1.5 text-[10px] bg-slate-950 p-2 rounded-xl border border-slate-800 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">70% Info</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">85% Warning</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 animate-pulse">95% Critical</span>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">100% Limit</span>
              </div>
            </div>

            {/* 5 Core Resource Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* 1. Users Quota */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-400" /> Staff Users
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${usage.users?.status?.badge || 'bg-blue-500/20 text-blue-300'}`}>
                    {usage.users?.status?.label || '72% Info'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black font-mono text-white">
                    {usage.users?.current || 18} <span className="text-xs text-slate-500 font-normal">/ {usage.users?.max || 25}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-300">{usage.users?.percentage || 72}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (usage.users?.percentage || 72) >= 95 ? 'bg-rose-500' :
                      (usage.users?.percentage || 72) >= 85 ? 'bg-amber-500' :
                      (usage.users?.percentage || 72) >= 70 ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${usage.users?.percentage || 72}%` }}
                  />
                </div>
              </div>

              {/* 2. Branches Quota */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-400" /> Pharmacy Branches
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${usage.branches?.status?.badge || 'bg-amber-500/20 text-amber-300'}`}>
                    {usage.branches?.status?.label || '80% Info'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black font-mono text-white">
                    {usage.branches?.current || 4} <span className="text-xs text-slate-500 font-normal">/ {usage.branches?.max || 5}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-300">{usage.branches?.percentage || 80}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (usage.branches?.percentage || 80) >= 95 ? 'bg-rose-500' :
                      (usage.branches?.percentage || 80) >= 85 ? 'bg-amber-500' :
                      (usage.branches?.percentage || 80) >= 70 ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${usage.branches?.percentage || 80}%` }}
                  />
                </div>
              </div>

              {/* 3. Medicines SKU Catalog Quota */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" /> Medicine SKUs
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${usage.medicines?.status?.badge || 'bg-amber-500/20 text-amber-300'}`}>
                    {usage.medicines?.status?.label || '84% Warning'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black font-mono text-white">
                    {(usage.medicines?.current || 8420).toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ {(usage.medicines?.max || 10000).toLocaleString()}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300">{usage.medicines?.percentage || 84}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (usage.medicines?.percentage || 84) >= 95 ? 'bg-rose-500' :
                      (usage.medicines?.percentage || 84) >= 85 ? 'bg-amber-500' :
                      (usage.medicines?.percentage || 84) >= 70 ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${usage.medicines?.percentage || 84}%` }}
                  />
                </div>
              </div>

              {/* 4. Cloud Storage Quota */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-cyan-400" /> Cloud Storage
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${usage.storage?.status?.badge || 'bg-emerald-500/20 text-emerald-300'}`}>
                    {usage.storage?.status?.label || '32% Optimal'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black font-mono text-white">
                    {usage.storage?.current || '3.2'} GB <span className="text-xs text-slate-500 font-normal">/ {usage.storage?.max || 10} GB</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">{usage.storage?.percentage || 32}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (usage.storage?.percentage || 32) >= 95 ? 'bg-rose-500' :
                      (usage.storage?.percentage || 32) >= 85 ? 'bg-amber-500' :
                      (usage.storage?.percentage || 32) >= 70 ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${usage.storage?.percentage || 32}%` }}
                  />
                </div>
              </div>

              {/* 5. Monthly Transactions Quota */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-400" /> Monthly POS Sales
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${usage.transactions?.status?.badge || 'bg-amber-500/20 text-amber-300'}`}>
                    {usage.transactions?.status?.label || '84% Warning'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black font-mono text-white">
                    {(usage.transactions?.current || 8420).toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ {(usage.transactions?.max || 10000).toLocaleString()}</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">{usage.transactions?.percentage || 84}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (usage.transactions?.percentage || 84) >= 95 ? 'bg-rose-500' :
                      (usage.transactions?.percentage || 84) >= 85 ? 'bg-amber-500' :
                      (usage.transactions?.percentage || 84) >= 70 ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${usage.transactions?.percentage || 84}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Super Admin Resource Consumers Inspector */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Resource Consumption Inspector (Plan Allocation Breakdown)
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Resource Name</th>
                      <th className="px-4 py-2.5">Primary Active Consumer</th>
                      <th className="px-4 py-2.5">Allocated Usage</th>
                      <th className="px-4 py-2.5">Threshold Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {(usage.resourceConsumers || [
                      { resource: 'Staff Accounts', consumer: 'Active cashier & inventory manager logins across 4 branches', usage: '18 of 25 seats (72%)', status: { badge: 'bg-blue-500/20 text-blue-300', label: '72% Info' } },
                      { resource: 'Branch Outlets', consumer: 'Main HQ + 3 Retail Dispensaries (Downtown, North, West)', usage: '4 of 5 outlets (80%)', status: { badge: 'bg-blue-500/20 text-blue-300', label: '80% Info' } },
                      { resource: 'Medicine Catalog', consumer: 'Active pharmaceutical SKUs & FEFO batch inventories', usage: '8,420 of 10,000 SKUs (84%)', status: { badge: 'bg-amber-500/20 text-amber-300', label: '84% Warning' } },
                      { resource: 'Cloud Storage', consumer: 'Uploaded prescription images, scanned licenses & PDF documents', usage: '3.2 GB of 10 GB (32%)', status: { badge: 'bg-emerald-500/20 text-emerald-300', label: 'Optimal' } },
                      { resource: 'Monthly Transactions', consumer: 'Real-time POS checkout orders, sales receipts & dispensing logs', usage: '8,420 orders (84%)', status: { badge: 'bg-amber-500/20 text-amber-300', label: '84% Warning' } }
                    ]).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-bold text-white">{row.resource}</td>
                        <td className="px-4 py-3 text-slate-400">{row.consumer}</td>
                        <td className="px-4 py-3 font-mono font-bold text-purple-300">{row.usage}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${row.status?.badge || 'bg-blue-500/20 text-blue-300'}`}>
                            {row.status?.label || 'Healthy'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 7: ACTIVITY ================= */}
        {activeTab === 'activity' && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              System Audit & Action Logs ({auditLogs.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Operator</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono text-slate-400">{formatDateTime(log.createdAt)}</td>
                      <td className="px-4 py-3 font-bold text-white">{log.userName}</td>
                      <td className="px-4 py-3 font-mono text-purple-300">{log.action}</td>
                      <td className="px-4 py-3 text-slate-300">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 8: INVOICES ================= */}
        {activeTab === 'invoices' && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Generated SaaS Billing Invoices
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {invoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono font-bold text-purple-300">{inv.id}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{formatDate(inv.date)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">${inv.amount}.00</td>
                      <td className="px-4 py-3">{inv.plan}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 9: SUPPORT ================= */}
        {activeTab === 'support' && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              Customer Support History & Tickets
            </h3>

            <div className="space-y-2">
              {supportTickets.map((tck, idx) => (
                <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{tck.subject}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Ticket: {tck.id} • {formatDate(tck.createdAt)}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    {tck.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 10: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Tenant Feature Flags & Platform Settings
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {Object.entries(company.featureFlags || {}).map(([key, val]) => (
                <div key={key} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="capitalize text-slate-300 font-medium">{key}</span>
                  <span className={`font-bold ${val ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {val ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* EDIT COMPANY MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-400" />
                Edit Company Profile & Governance
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdateCompany} className="space-y-4 text-xs">
              
              {/* Section 1: Business Identity */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">1. Business Identity & Registration</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Company Trade Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Legal / Registered Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Al-Shifa Healthcare Group LLC"
                      value={editForm.legalName}
                      onChange={(e) => setEditForm({ ...editForm, legalName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Pharmacy License #</label>
                    <input
                      type="text"
                      value={editForm.licenseNumber}
                      onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Tax ID / NTN</label>
                    <input
                      type="text"
                      value={editForm.taxNumber}
                      onChange={(e) => setEditForm({ ...editForm, taxNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Business Reg #</label>
                    <input
                      type="text"
                      value={editForm.businessRegistrationNumber}
                      onChange={(e) => setEditForm({ ...editForm, businessRegistrationNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Location */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">2. Contact & Physical Address</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Official Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Official Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 font-semibold mb-1">Headquarters Street Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">City / Country</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Owner Credentials & Access */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">3. Authorized Owner Account</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Owner Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.ownerName}
                      onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Owner Email (Login Account) *</label>
                    <input
                      type="email"
                      required
                      value={editForm.ownerEmail}
                      onChange={(e) => setEditForm({ ...editForm, ownerEmail: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Reset Owner Password</label>
                  <input
                    type="password"
                    placeholder="Leave blank to preserve current password hash"
                    value={editForm.ownerPassword}
                    onChange={(e) => setEditForm({ ...editForm, ownerPassword: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Section 4: Governance & Internal Notes */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">4. Status Governance & Internal Admin Notes</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Company Status</label>
                    <select
                      value={editForm.companyStatus}
                      onChange={(e) => setEditForm({ ...editForm, companyStatus: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    >
                      <option value="active">Active (Full ERP Access)</option>
                      <option value="suspended">Suspended (Access Blocked)</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Logo URL</label>
                    <input
                      type="text"
                      placeholder="https://cloudinary.com/..."
                      value={editForm.logo}
                      onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Internal Admin Notes (Private to Super Admin)</label>
                  <textarea
                    rows={3}
                    placeholder="Document special compliance requirements, contract details, or administrative notes..."
                    value={editForm.internalAdminNotes}
                    onChange={(e) => setEditForm({ ...editForm, internalAdminNotes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <span className="text-[11px] text-slate-500">
                  🛡️ All modifications are recorded in the immutable audit log.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer shadow-lg shadow-purple-600/20"
                  >
                    {submitting ? 'Saving & Logging...' : 'Save & Record Audit Log'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE SUBSCRIPTION MODIFICATION & CONFIRMATION MODAL */}
      {showSubActionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                {getSubActionTitle()}
              </h3>
              <button onClick={() => setShowSubActionModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleExecuteSubAction} className="space-y-4 text-xs">
              
              {/* Context Header */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block">Target Pharmacy Tenant</span>
                  <span className="font-bold text-white text-sm">{company.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Current Active Plan</span>
                  <span className="font-bold text-purple-400">{subscription.plan} (${subscription.price}/mo)</span>
                </div>
              </div>

              {/* Conditional Action Controls */}
              {(subActionType === 'change_plan' || subActionType === 'upgrade' || subActionType === 'downgrade') && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Target Plan Tier *</label>
                      <select
                        value={subActionForm.planName}
                        onChange={(e) => setSubActionForm({ ...subActionForm, planName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500 font-bold"
                      >
                        <option value="Basic">Basic ($49/mo)</option>
                        <option value="Professional">Professional ($149/mo)</option>
                        <option value="Enterprise">Enterprise ($399/mo)</option>
                        <option value="Custom">Custom Plan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Billing Cycle</label>
                      <select
                        value={subActionForm.billingCycle}
                        onChange={(e) => setSubActionForm({ ...subActionForm, billingCycle: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                      >
                        <option value="monthly">Monthly Recurring</option>
                        <option value="yearly">Yearly Invoicing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Custom Rate Override ($ / optional)</label>
                    <input
                      type="number"
                      placeholder="Leave empty to use tier default standard rate"
                      value={subActionForm.customPrice}
                      onChange={(e) => setSubActionForm({ ...subActionForm, customPrice: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              {subActionType === 'extend' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Extend Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    value={subActionForm.extendDays}
                    onChange={(e) => setSubActionForm({ ...subActionForm, extendDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Adds to current expiration: {formatDate(subscription.expiresAt)}</span>
                </div>
              )}

              {subActionType === 'add_trial' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Trial Days to Grant *</label>
                  <input
                    type="number"
                    required
                    value={subActionForm.trialDays}
                    onChange={(e) => setSubActionForm({ ...subActionForm, trialDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              )}

              {subActionType === 'add_grace' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Grace Period Days to Add *</label>
                  <input
                    type="number"
                    required
                    value={subActionForm.graceDays}
                    onChange={(e) => setSubActionForm({ ...subActionForm, graceDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              )}

              {subActionType === 'apply_discount' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Discount Percentage (%)</label>
                    <input
                      type="number"
                      value={subActionForm.discountPercent}
                      onChange={(e) => setSubActionForm({ ...subActionForm, discountPercent: Number(e.target.value), discountAmount: 0 })}
                      placeholder="e.g. 20"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Or Fixed Deduction ($)</label>
                    <input
                      type="number"
                      value={subActionForm.discountAmount}
                      onChange={(e) => setSubActionForm({ ...subActionForm, discountAmount: Number(e.target.value), discountPercent: 0 })}
                      placeholder="e.g. 50"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Administrative Notes (Recorded in Audit)</label>
                <textarea
                  rows={2}
                  value={subActionForm.notes}
                  onChange={(e) => setSubActionForm({ ...subActionForm, notes: e.target.value })}
                  placeholder="e.g. Approved quarterly promotional discount by Super Admin."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 outline-none focus:border-purple-500"
                />
              </div>

              {/* ⚠️ LIVE CONFIRMATION EFFECT EXPLAINER SCREEN */}
              <div className="p-4 bg-purple-950/30 border border-purple-500/40 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Live Effect & Governance Impact Analysis:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {getSubActionEffectSummary()}
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-purple-500/20">
                  <span>🛡️</span>
                  <span>An immutable audit trail log will be generated upon confirmation.</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubActionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  {submitting ? 'Applying & Logging...' : 'Confirm & Apply Change'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONTROLLED SUSPEND COMPANY CONFIRMATION DIALOG */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                Suspend Company Account
              </h3>
              <button onClick={() => setShowSuspendModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                You are about to suspend <strong>{company.name}</strong> ({company.code}). Review all suspension parameters before confirming.
              </span>
            </div>

            <form onSubmit={handleExecuteSuspend} className="space-y-3.5 text-xs">
              
              {/* 1. Reason */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Suspension Reason *</label>
                <textarea
                  required
                  rows={2}
                  value={suspendForm.reason}
                  onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
                  placeholder="e.g. Overdue payment invoices / non-compliance with drug dispensing regulations"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 outline-none focus:border-amber-500"
                />
              </div>

              {/* 2. Effective Timing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Effective Timing</label>
                  <select
                    value={suspendForm.effectiveMode}
                    onChange={(e) => setSuspendForm({ ...suspendForm, effectiveMode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                  >
                    <option value="immediate">Effective Immediately</option>
                    <option value="scheduled">Scheduled Date</option>
                  </select>
                </div>

                {suspendForm.effectiveMode === 'scheduled' ? (
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Scheduled Date *</label>
                    <input
                      type="date"
                      required
                      value={suspendForm.effectiveDate}
                      onChange={(e) => setSuspendForm({ ...suspendForm, effectiveDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Effective Date</label>
                    <div className="p-2 bg-slate-950 rounded-xl text-slate-400 font-mono">Right Now</div>
                  </div>
                )}
              </div>

              {/* 3. Access Mode */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ERP Access Mode During Suspension</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    onClick={() => setSuspendForm({ ...suspendForm, accessMode: 'blocked' })}
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-0.5 ${
                      suspendForm.accessMode === 'blocked'
                        ? 'bg-red-500/15 border-red-500/40 text-red-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-bold text-white">Completely Block Access</span>
                    <span className="text-[10px]">Staff cannot log into POS or ERP</span>
                  </label>

                  <label
                    onClick={() => setSuspendForm({ ...suspendForm, accessMode: 'read_only' })}
                    className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-0.5 ${
                      suspendForm.accessMode === 'read_only'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-bold text-white">Allow Read-Only Access</span>
                    <span className="text-[10px]">Can view history, no new billing</span>
                  </label>
                </div>
              </div>

              {/* 4. Owner Notification Checkbox */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Notify Company Owner</span>
                  <span className="text-[10px] text-slate-400">Send suspension notice to {owner.email}</span>
                </div>
                <input
                  type="checkbox"
                  checked={suspendForm.notifyOwner}
                  onChange={(e) => setSuspendForm({ ...suspendForm, notifyOwner: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer shadow-lg shadow-amber-600/20"
                >
                  {submitting ? 'Suspending...' : 'Confirm Suspension & Record Audit'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONTROLLED REACTIVATE COMPANY DIALOG */}
      {showReactivateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-400" />
                Reactivate Company & Restore Access
              </h3>
              <button onClick={() => setShowReactivateModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleExecuteReactivate} className="space-y-3.5 text-xs">
              
              {/* 1. Restore Subscription Access */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Restore Subscription Access</span>
                  <span className="text-[10px] text-slate-400">Unlock all employee and pharmacist branch accounts</span>
                </div>
                <input
                  type="checkbox"
                  checked={reactivateForm.restoreSubscription}
                  onChange={(e) => setReactivateForm({ ...reactivateForm, restoreSubscription: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* 2. Subscription Duration Extension & Grace Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Extend Subscription (Days)</label>
                  <input
                    type="number"
                    value={reactivateForm.extendDays}
                    onChange={(e) => setReactivateForm({ ...reactivateForm, extendDays: e.target.value })}
                    placeholder="30"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Standard billing cycle</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Add Grace Period (Days)</label>
                  <input
                    type="number"
                    value={reactivateForm.gracePeriodDays}
                    onChange={(e) => setReactivateForm({ ...reactivateForm, gracePeriodDays: e.target.value })}
                    placeholder="7"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Complimentary extension</span>
                </div>
              </div>

              {/* 3. Reactivation Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reactivation Notes *</label>
                <textarea
                  required
                  rows={2}
                  value={reactivateForm.notes}
                  onChange={(e) => setReactivateForm({ ...reactivateForm, notes: e.target.value })}
                  placeholder="e.g. Cleared payment verification and updated regulatory license."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReactivateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  {submitting ? 'Reactivating...' : 'Reactivate & Restore Access'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SECURE SUPPORT ERP ACCESS MODE MODAL */}
      {showSupportAccessModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl shadow-purple-950/50">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                Initialize Super Admin Support ERP Access Mode
              </h3>
              <button onClick={() => setShowSupportAccessModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="p-4 bg-purple-950/20 rounded-2xl border border-purple-500/30 space-y-2 text-xs text-purple-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">Target Company:</span>
                  <span className="font-bold text-white text-sm">{company.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">Company Code:</span>
                  <span className="font-mono font-bold text-purple-300">{company.code}</span>
                </div>
              </div>
              <p className="text-[11px] text-purple-300/90 leading-relaxed pt-1 border-t border-purple-900/40">
                Allows a Super Admin to enter this pharmacy company's ERP for troubleshooting without knowing the owner's password. A prominent <strong>"Support Access Mode"</strong> banner will remain visible.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLaunchingSupport(true);
                try {
                  const res = await API.post(`/saas-admin/companies/${pharmacyId}/support-session/start`, {
                    reason: supportReason,
                    requestedBy: supportRequestedBy
                  }, { headers: getAdminHeaders() });

                  sessionStorage.setItem('supportSession', JSON.stringify(res.data.supportSessionData));
                  toast.success(`Support Access Mode initialized for ${company.name}`);
                  setShowSupportAccessModal(false);
                  navigate(res.data.redirectUrl || `/dashboard?support_access=true&pharmacyId=${pharmacyId}`);
                } catch (err) {
                  toast.error(err.response?.data?.message || 'Failed to start support session');
                } finally {
                  setLaunchingSupport(false);
                }
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mandatory Audit Reason *</label>
                <textarea
                  required
                  rows={2}
                  value={supportReason}
                  onChange={(e) => setSupportReason(e.target.value)}
                  placeholder="e.g. Investigating inventory sync discrepancy across branches..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reference Ticket / Requester *</label>
                <input
                  type="text"
                  required
                  value={supportRequestedBy}
                  onChange={(e) => setSupportRequestedBy(e.target.value)}
                  placeholder="e.g. Ticket #9283 / Dr. Alexander Wright"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSupportAccessModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={launchingSupport}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  {launchingSupport ? 'Launching Session...' : 'Enter ERP in Support Mode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
