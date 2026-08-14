import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  CreditCard, Plus, Edit3, Archive, CheckCircle2,
  XCircle, AlertCircle, Sparkles, Server, ShieldCheck,
  RefreshCw, Layers, DollarSign, Clock, Users, MapPin,
  FileText, Check, Database, Zap
} from 'lucide-react';
import { useToast } from '../ui';

export default function SubscriptionPlanManager() {
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [planForm, setPlanForm] = useState({
    name: '',
    planType: 'Professional', // Basic | Professional | Enterprise | Custom
    description: '',
    monthlyPrice: 99,
    yearlyPrice: 990,
    trialDurationDays: 14,
    supportLevel: 'Standard (Email)',
    status: 'active', // active | inactive | archived
    limits: {
      maxUsers: 5,
      maxBranches: 1,
      maxMedicines: 5000,
      maxStorageGB: 10,
      maxMonthlyTransactions: 10000,
      maxApiRequests: 25000
    },
    features: {
      pos: true,
      inventory: true,
      medicines: true,
      expiry: true,
      barcode: true,
      qrScanner: true,
      apiAccess: false,
      advancedReporting: false,
      accountingAccess: false,
      multiBranchSupport: false,
      analytics: false,
      aiForecast: false,
      smsNotifications: false,
      emailNotifications: true,
      auditLogs: false,
      automatedBackups: false
    }
  });

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/saas-admin/plans', { headers: getAdminHeaders() });
      setPlans(res.data || []);
    } catch {
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders, toast]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleOpenCreate = () => {
    setSelectedPlan(null);
    setPlanForm({
      name: '',
      planType: 'Professional',
      description: '',
      monthlyPrice: 99,
      yearlyPrice: 990,
      trialDurationDays: 14,
      supportLevel: 'Standard (Email)',
      status: 'active',
      limits: {
        maxUsers: 5,
        maxBranches: 1,
        maxMedicines: 5000,
        maxStorageGB: 10,
        maxMonthlyTransactions: 10000,
        maxApiRequests: 25000
      },
      features: {
        pos: true,
        inventory: true,
        medicines: true,
        expiry: true,
        barcode: true,
        qrScanner: true,
        apiAccess: false,
        advancedReporting: false,
        accountingAccess: false,
        multiBranchSupport: false,
        analytics: false,
        aiForecast: false,
        smsNotifications: false,
        emailNotifications: true,
        auditLogs: false,
        automatedBackups: false
      }
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name || '',
      planType: plan.planType || 'Professional',
      description: plan.description || '',
      monthlyPrice: plan.monthlyPrice ?? plan.price ?? 99,
      yearlyPrice: plan.yearlyPrice ?? (plan.monthlyPrice ? plan.monthlyPrice * 10 : 990),
      trialDurationDays: plan.trialDurationDays ?? 14,
      supportLevel: plan.supportLevel || 'Standard (Email)',
      status: plan.status || 'active',
      limits: {
        maxUsers: plan.limits?.maxUsers ?? 5,
        maxBranches: plan.limits?.maxBranches ?? 1,
        maxMedicines: plan.limits?.maxMedicines ?? 5000,
        maxStorageGB: plan.limits?.maxStorageGB ?? 10,
        maxMonthlyTransactions: plan.limits?.maxMonthlyTransactions ?? 10000,
        maxApiRequests: plan.limits?.maxApiRequests ?? 25000
      },
      features: {
        pos: plan.features?.pos ?? true,
        inventory: plan.features?.inventory ?? true,
        medicines: plan.features?.medicines ?? true,
        expiry: plan.features?.expiry ?? true,
        barcode: plan.features?.barcode ?? true,
        qrScanner: plan.features?.qrScanner ?? true,
        apiAccess: plan.features?.apiAccess ?? false,
        advancedReporting: plan.features?.advancedReporting ?? false,
        accountingAccess: plan.features?.accountingAccess ?? false,
        multiBranchSupport: plan.features?.multiBranchSupport ?? plan.features?.multiBranch ?? false,
        analytics: plan.features?.analytics ?? false,
        aiForecast: plan.features?.aiForecast ?? false,
        smsNotifications: plan.features?.smsNotifications ?? plan.features?.sms ?? false,
        emailNotifications: plan.features?.emailNotifications ?? plan.features?.email ?? true,
        auditLogs: plan.features?.auditLogs ?? false,
        automatedBackups: plan.features?.automatedBackups ?? plan.features?.backups ?? false
      }
    });
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedPlan) {
        await API.put(`/saas-admin/plans/${selectedPlan._id}`, planForm, { headers: getAdminHeaders() });
        toast.success(`Plan "${planForm.name}" updated successfully!`);
      } else {
        await API.post('/saas-admin/plans/create', planForm, { headers: getAdminHeaders() });
        toast.success(`Plan "${planForm.name}" created successfully!`);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchivePlan = async (planId, planName) => {
    if (!window.confirm(`Archive plan "${planName}"? Existing subscriptions and historical billing records will remain intact.`)) return;
    try {
      await API.post(`/saas-admin/plans/${planId}/archive`, {}, { headers: getAdminHeaders() });
      toast.success(`Plan "${planName}" archived. Historical billing preserved.`);
      fetchPlans();
    } catch {
      toast.error('Failed to archive plan');
    }
  };

  // Global Trial Settings State
  const [showTrialSettingsModal, setShowTrialSettingsModal] = useState(false);
  const [trialSettings, setTrialSettings] = useState({
    defaultTrialLengthDays: 14,
    trialEligibility: 'all_new_companies',
    allowSelfServeExtension: false,
    maxExtensionDays: 30,
    trialExpirationBehavior: 'block_access',
    gracePeriodAfterTrialDays: 7,
    sendReminderDaysBeforeExpiry: 3
  });

  const fetchTrialSettings = useCallback(async () => {
    try {
      const res = await API.get('/saas-admin/trials/settings', { headers: getAdminHeaders() });
      if (res.data) setTrialSettings(res.data);
    } catch {
      // ignore
    }
  }, [getAdminHeaders]);

  // Expiration & Grace Period Lifecycle State
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [expirationSettings, setExpirationSettings] = useState({
    enableAutomatedLifecycle: true,
    firstReminderDaysBeforeExpiry: 7,
    secondReminderDaysBeforeExpiry: 3,
    gracePeriodDurationDays: 7,
    gracePeriodAccessMode: 'restricted_access', // full_access | read_only | restricted_access | suspended_access
    postGraceExpirationBehavior: 'suspended_access', // suspended_access | read_only | restricted_access
    preventDataDeletion: true,
    notifyOwnerViaEmail: true,
    notifyOwnerViaSms: false
  });
  const [runningRoutine, setRunningRoutine] = useState(false);

  const fetchExpirationSettings = useCallback(async () => {
    try {
      const res = await API.get('/saas-admin/lifecycle/expiration-settings', { headers: getAdminHeaders() });
      if (res.data) setExpirationSettings(res.data);
    } catch {
      // ignore
    }
  }, [getAdminHeaders]);

  useEffect(() => {
    fetchTrialSettings();
    fetchExpirationSettings();
  }, [fetchTrialSettings, fetchExpirationSettings]);

  const handleSaveExpirationSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.put('/saas-admin/lifecycle/expiration-settings', expirationSettings, { headers: getAdminHeaders() });
      toast.success('Expiration & Grace Period policy saved successfully!');
      setShowExpirationModal(false);
    } catch {
      toast.error('Failed to save expiration policy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunLifecycleRoutine = async () => {
    setRunningRoutine(true);
    try {
      const res = await API.post('/saas-admin/lifecycle/run-routine', {}, { headers: getAdminHeaders() });
      toast.success(res.data?.message || 'Lifecycle evaluation worker completed!');
    } catch {
      toast.error('Failed to run lifecycle worker');
    } finally {
      setRunningRoutine(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            SaaS Subscription Tier Governance & Limits
          </h3>
          <p className="text-xs text-slate-400">
            Define pricing, branch/user quotas, storage limits, and feature access flags.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowExpirationModal(true)}
            className="px-3.5 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            Expiration & Grace Policy
          </button>
          <button
            onClick={() => setShowTrialSettingsModal(true)}
            className="px-3.5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/10"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            Trial Controls
          </button>
          <button
            onClick={fetchPlans}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 cursor-pointer"
            title="Refresh Plans"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Plan
          </button>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`rounded-3xl border p-6 flex flex-col justify-between transition relative overflow-hidden backdrop-blur-md ${
              plan.status === 'archived'
                ? 'bg-slate-950/60 border-slate-800 opacity-60'
                : plan.planType === 'Enterprise'
                ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950/20 border-purple-500/40 shadow-xl shadow-purple-950/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-xl'
            }`}
          >
            {/* Header Badge */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                  plan.status === 'archived'
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : plan.status === 'inactive'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                }`}>
                  {plan.status === 'archived' ? 'Archived' : plan.planType}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
                    title="Edit Plan"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {plan.status !== 'archived' && (
                    <button
                      onClick={() => handleArchivePlan(plan._id, plan.name)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition cursor-pointer"
                      title="Archive Plan"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-white">{plan.name}</h4>
                <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description || 'Standard pharmacy SaaS plan'}</p>
              </div>

              {/* Price Row */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white font-mono">${plan.monthlyPrice ?? plan.price}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-medium mt-1">
                  ${plan.yearlyPrice || (plan.monthlyPrice ? plan.monthlyPrice * 10 : 990)} / billed yearly • {plan.trialDurationDays || 14}-day free trial
                </div>
              </div>

              {/* Quotas & Capacity Limits */}
              <div className="space-y-2 text-xs pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quota Limits</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Users</span>
                    <span className="font-bold text-white font-mono">{plan.limits?.maxUsers === -1 ? 'Unlimited' : plan.limits?.maxUsers || 5}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Branches</span>
                    <span className="font-bold text-white font-mono">{plan.limits?.maxBranches === -1 ? 'Unlimited' : plan.limits?.maxBranches || 1}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Medicines</span>
                    <span className="font-bold text-white font-mono">{plan.limits?.maxMedicines === -1 ? 'Unlimited' : plan.limits?.maxMedicines || 1000}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Storage</span>
                    <span className="font-bold text-white font-mono">{plan.limits?.maxStorageGB || 5} GB</span>
                  </div>
                </div>
              </div>

              {/* Feature Matrix Highlights */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Feature Highlights</span>
                
                {[
                  { label: 'POS & Billing Suite', enabled: plan.features?.pos ?? true },
                  { label: 'Multi-Branch Support', enabled: plan.features?.multiBranchSupport ?? plan.features?.multiBranch ?? false },
                  { label: 'Accounting & Invoicing Access', enabled: plan.features?.accountingAccess ?? false },
                  { label: 'AI Demand Forecasting', enabled: plan.features?.aiForecast ?? false },
                  { label: 'Developer API Access', enabled: plan.features?.apiAccess ?? false },
                  { label: 'Audit Log Trail', enabled: plan.features?.auditLogs ?? false }
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px]">
                    {feat.enabled ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                    <span className={feat.enabled ? 'text-slate-200' : 'text-slate-500 line-through'}>
                      {feat.label}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Bottom Support Level */}
            <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
              <span>Support:</span>
              <span className="font-semibold text-purple-300">{plan.supportLevel || 'Standard (Email)'}</span>
            </div>

          </div>
        ))}
      </div>

      {/* CREATE / EDIT PLAN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                {selectedPlan ? `Edit Subscription Plan: ${selectedPlan.name}` : 'Create New Subscription Plan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              
              {/* 1. Basic Plan Attributes */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">1. Plan Identity & Pricing</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Plan Name *</label>
                    <input
                      type="text"
                      required
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      placeholder="e.g. Professional Plus"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Plan Category</label>
                    <select
                      value={planForm.planType}
                      onChange={(e) => setPlanForm({ ...planForm, planType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Professional">Professional</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Plan Status</label>
                    <select
                      value={planForm.status}
                      onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    >
                      <option value="active">Active (Available for Assignment)</option>
                      <option value="inactive">Inactive</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Monthly Price ($) *</label>
                    <input
                      type="number"
                      required
                      value={planForm.monthlyPrice}
                      onChange={(e) => setPlanForm({ ...planForm, monthlyPrice: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Yearly Price ($)</label>
                    <input
                      type="number"
                      value={planForm.yearlyPrice}
                      onChange={(e) => setPlanForm({ ...planForm, yearlyPrice: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Trial Duration (Days)</label>
                    <input
                      type="number"
                      value={planForm.trialDurationDays}
                      onChange={(e) => setPlanForm({ ...planForm, trialDurationDays: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Description</label>
                  <input
                    type="text"
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    placeholder="Short description of who this plan is tailored for..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* 2. Quota Limits */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">2. Resource & Quota Limits (-1 for Unlimited)</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Max Users</label>
                    <input
                      type="number"
                      value={planForm.limits.maxUsers}
                      onChange={(e) => setPlanForm({ ...planForm, limits: { ...planForm.limits, maxUsers: Number(e.target.value) } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Max Branches</label>
                    <input
                      type="number"
                      value={planForm.limits.maxBranches}
                      onChange={(e) => setPlanForm({ ...planForm, limits: { ...planForm.limits, maxBranches: Number(e.target.value) } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Max Medicines</label>
                    <input
                      type="number"
                      value={planForm.limits.maxMedicines}
                      onChange={(e) => setPlanForm({ ...planForm, limits: { ...planForm.limits, maxMedicines: Number(e.target.value) } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Storage Limit (GB)</label>
                    <input
                      type="number"
                      value={planForm.limits.maxStorageGB}
                      onChange={(e) => setPlanForm({ ...planForm, limits: { ...planForm.limits, maxStorageGB: Number(e.target.value) } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Monthly Transactions</label>
                    <input
                      type="number"
                      value={planForm.limits.maxMonthlyTransactions}
                      onChange={(e) => setPlanForm({ ...planForm, limits: { ...planForm.limits, maxMonthlyTransactions: Number(e.target.value) } })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Support Level</label>
                    <select
                      value={planForm.supportLevel}
                      onChange={(e) => setPlanForm({ ...planForm, supportLevel: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                    >
                      <option value="Community">Community</option>
                      <option value="Standard (Email)">Standard (Email)</option>
                      <option value="Priority (24/7 Phone & Email)">Priority (24/7 Phone & Email)</option>
                      <option value="Dedicated Account Manager">Dedicated Account Manager</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Feature Flags Matrix */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">3. SaaS Feature Availability Matrix</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'pos', label: 'POS & Cash Register' },
                    { key: 'inventory', label: 'Batch Inventory Control' },
                    { key: 'multiBranchSupport', label: 'Multi-Branch Transfers' },
                    { key: 'accountingAccess', label: 'Accounting Access' },
                    { key: 'advancedReporting', label: 'Advanced Reporting' },
                    { key: 'analytics', label: 'Revenue Analytics' },
                    { key: 'apiAccess', label: 'Developer REST API' },
                    { key: 'aiForecast', label: 'AI Demand Forecast' },
                    { key: 'smsNotifications', label: 'SMS Provider Gateway' },
                    { key: 'emailNotifications', label: 'SMTP Email Delivery' },
                    { key: 'auditLogs', label: 'Audit Log History' },
                    { key: 'automatedBackups', label: 'Automated Cloud Backups' }
                  ].map((feat) => (
                    <label key={feat.key} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300 font-medium text-[11px]">{feat.label}</span>
                      <input
                        type="checkbox"
                        checked={planForm.features[feat.key] ?? false}
                        onChange={(e) => setPlanForm({
                          ...planForm,
                          features: { ...planForm.features, [feat.key]: e.target.checked }
                        })}
                        className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  {submitting ? 'Saving...' : selectedPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* GLOBAL TRIAL CONTROLS CONFIGURATION MODAL */}
      {showTrialSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Global Platform Trial Controls & Policy
              </h3>
              <button onClick={() => setShowTrialSettingsModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveTrialSettings} className="space-y-4 text-xs">
              
              {/* 1. Default Trial Length */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Default Trial Length (Days) *</label>
                  <input
                    type="number"
                    required
                    value={trialSettings.defaultTrialLengthDays}
                    onChange={(e) => setTrialSettings({ ...trialSettings, defaultTrialLengthDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Assigned on new registration</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Extension Limit (Days)</label>
                  <input
                    type="number"
                    value={trialSettings.maxExtensionDays}
                    onChange={(e) => setTrialSettings({ ...trialSettings, maxExtensionDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Maximum total trial allowance</span>
                </div>
              </div>

              {/* 2. Trial Eligibility */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trial Eligibility Rule *</label>
                <select
                  value={trialSettings.trialEligibility}
                  onChange={(e) => setTrialSettings({ ...trialSettings, trialEligibility: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="all_new_companies">All New Registered Pharmacies (Auto-Grant)</option>
                  <option value="verified_companies_only">Verified Organizations Only (Post-Document Review)</option>
                  <option value="manual_approval_only">Super Admin Manual Approval Only</option>
                  <option value="disabled">Disabled (Immediate Paid Subscription Required)</option>
                </select>
              </div>

              {/* 3. Trial Expiration Behavior */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trial Expiration Behavior *</label>
                <select
                  value={trialSettings.trialExpirationBehavior}
                  onChange={(e) => setTrialSettings({ ...trialSettings, trialExpirationBehavior: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 font-semibold text-amber-300"
                >
                  <option value="block_access">Completely Block ERP Access Upon Expiry</option>
                  <option value="read_only">Allow Read-Only Access (View Receipts & Catalog, No Sales)</option>
                  <option value="grace_period">Grant Automatic Grace Period (7 Days Buffer)</option>
                  <option value="auto_convert_paid">Auto-Convert to Invoiced Paid Subscription</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">Executed automatically when days remaining reaches 0.</span>
              </div>

              {/* 4. Reminder Notification Cadence */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Grace Period Buffer (Days)</label>
                  <input
                    type="number"
                    value={trialSettings.gracePeriodAfterTrialDays}
                    onChange={(e) => setTrialSettings({ ...trialSettings, gracePeriodAfterTrialDays: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Email Reminder (Days Before)</label>
                  <input
                    type="number"
                    value={trialSettings.sendReminderDaysBeforeExpiry}
                    onChange={(e) => setTrialSettings({ ...trialSettings, sendReminderDaysBeforeExpiry: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTrialSettingsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer shadow-lg shadow-blue-600/20"
                >
                  {submitting ? 'Saving Policy...' : 'Save Trial Controls'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* AUTOMATED EXPIRATION & GRACE PERIOD POLICY MODAL */}
      {showExpirationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Subscription Expiration & Grace Period Lifecycle Policy
              </h3>
              <button onClick={() => setShowExpirationModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            {/* Lifecycle Flow Visual Diagram */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Automated SaaS Expiration Lifecycle Timeline:</span>
              <div className="flex items-center justify-between text-[11px] text-slate-300 gap-1 overflow-x-auto py-1">
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-center">
                  <span className="font-bold text-blue-300 block">{expirationSettings.firstReminderDaysBeforeExpiry}d Before</span>
                  <span className="text-[10px] text-slate-500">1st Reminder</span>
                </div>
                <span>➔</span>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-center">
                  <span className="font-bold text-blue-300 block">{expirationSettings.secondReminderDaysBeforeExpiry}d Before</span>
                  <span className="text-[10px] text-slate-500">2nd Reminder</span>
                </div>
                <span>➔</span>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-center">
                  <span className="font-bold text-amber-300 block">Expiry Date</span>
                  <span className="text-[10px] text-amber-400">Grace Starts</span>
                </div>
                <span>➔</span>
                <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-center">
                  <span className="font-bold text-red-400 block">Grace Ends</span>
                  <span className="text-[10px] text-red-500">Post-Grace Policy</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveExpirationSettings} className="space-y-4 text-xs">
              
              {/* 1. Reminder Schedule Cadence */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">First Expiry Reminder (Days Before) *</label>
                  <input
                    type="number"
                    required
                    value={expirationSettings.firstReminderDaysBeforeExpiry}
                    onChange={(e) => setExpirationSettings({ ...expirationSettings, firstReminderDaysBeforeExpiry: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Sends proactive renewal alert</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Final Expiry Reminder (Days Before) *</label>
                  <input
                    type="number"
                    required
                    value={expirationSettings.secondReminderDaysBeforeExpiry}
                    onChange={(e) => setExpirationSettings({ ...expirationSettings, secondReminderDaysBeforeExpiry: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Urgent payment reminder</span>
                </div>
              </div>

              {/* 2. Grace Period Duration */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Grace Period Buffer Duration (Days) *</label>
                <input
                  type="number"
                  required
                  value={expirationSettings.gracePeriodDurationDays}
                  onChange={(e) => setExpirationSettings({ ...expirationSettings, gracePeriodDurationDays: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-500 font-bold text-sm"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Allows pharmacy uninterrupted dispensing while wire clears.</span>
              </div>

              {/* 3. Configurable Access Modes */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                
                {/* Grace Period Access Mode */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Access Mode During Grace Period *</label>
                  <select
                    value={expirationSettings.gracePeriodAccessMode}
                    onChange={(e) => setExpirationSettings({ ...expirationSettings, gracePeriodAccessMode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-semibold"
                  >
                    <option value="full_access">Full Access (Unrestricted POS & Cloud Sync)</option>
                    <option value="restricted_access">Restricted Access (POS Sales Permitted, Inventory Edits Blocked)</option>
                    <option value="read_only">Read-Only Access (View Receipts & Catalog Only, Dispensing Disabled)</option>
                    <option value="suspended_access">Suspended Access (Lock Staff Accounts)</option>
                  </select>
                </div>

                {/* Post-Grace Expiration Behavior */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Post-Grace Expiration Behavior (When Grace Ends) *</label>
                  <select
                    value={expirationSettings.postGraceExpirationBehavior}
                    onChange={(e) => setExpirationSettings({ ...expirationSettings, postGraceExpirationBehavior: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-red-500 font-semibold text-red-300"
                  >
                    <option value="suspended_access">Suspended Access (Lockout Cashier/POS & Block Tenant Access)</option>
                    <option value="read_only">Read-Only Access (Preserve Tenant Reporting & Historical Audit)</option>
                    <option value="restricted_access">Restricted Access (Emergency Dispensing Only)</option>
                  </select>
                </div>
              </div>

              {/* Strict Data Preservation Guarantee */}
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Strict Enterprise Data Preservation Guarantee:
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Under no circumstances will pharmacy catalog, customer prescriptions, batch inventory, or sales history ever be deleted due to subscription expiration or account suspension.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  disabled={runningRoutine}
                  onClick={handleRunLifecycleRoutine}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${runningRoutine ? 'animate-spin' : ''}`} />
                  Run Evaluation Worker Now
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExpirationModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer shadow-lg shadow-amber-600/20"
                  >
                    {submitting ? 'Saving Policy...' : 'Save Expiration Policy'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
