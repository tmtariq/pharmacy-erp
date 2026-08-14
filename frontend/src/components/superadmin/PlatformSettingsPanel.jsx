import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  Settings, Building2, CreditCard, ShieldAlert, FileText,
  Sliders, ShieldCheck, Mail, Smartphone, RefreshCw
} from 'lucide-react';
import { useToast } from '../ui';

export default function PlatformSettingsPanel() {
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/saas-admin/settings', { headers: getAdminHeaders() });
      setSettings(res.data);
    } catch {
      toast.error('Failed to load platform settings configurations');
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleFieldChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleTemplateChange = (templateKey, field, value) => {
    setSettings(prev => ({
      ...prev,
      templates: {
        ...prev.templates,
        [templateKey]: {
          ...prev.templates[templateKey],
          [field]: value
        }
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await API.put('/saas-admin/settings', settings, { headers: getAdminHeaders() });
      toast.success('SaaS Platform configurations saved successfully!');
    } catch {
      toast.error('Failed to save SaaS settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/60 p-12 text-center rounded-3xl border border-slate-800 text-slate-500 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-400 mb-2" />
        Retrieving platform configuration policies...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Settings Top Controls */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            SaaS Platform Policy & Configuration Center
          </h3>
          <p className="text-xs text-slate-400">Configure core SaaS attributes, subscriptions, invoices, mail templates, and authentication locks.</p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/20 cursor-pointer"
        >
          {saving ? 'Saving Configs...' : 'Save All Settings'}
        </button>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-850 pb-3 overflow-x-auto text-xs">
        {[
          { id: 'general', label: 'General SaaS Profile', icon: Building2 },
          { id: 'subscription', label: 'Subscription & Lifecycle', icon: CreditCard },
          { id: 'billing', label: 'Billing & Payments', icon: Sliders },
          { id: 'templates', label: 'Email Templates', icon: Mail },
          { id: 'security', label: 'Platform Security', icon: ShieldCheck }
        ].map(subTab => {
          const Icon = subTab.icon;
          const isActive = activeSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-purple-600/15 text-purple-300 border border-purple-500/20'
                  : 'bg-slate-950/40 text-slate-450 border border-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {subTab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Subtab Form Panels */}
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-md text-xs text-slate-300">
        
        {/* PANEL: General */}
        {activeSubTab === 'general' && (
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm border-b border-slate-850 pb-2">General Platform Attributes</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">SaaS Legal/Trading Name</label>
                <input
                  type="text"
                  value={settings.general?.saasName || ''}
                  onChange={(e) => handleFieldChange('general', 'saasName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Support Endpoint Email</label>
                <input
                  type="email"
                  value={settings.general?.supportEmail || ''}
                  onChange={(e) => handleFieldChange('general', 'supportEmail', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Brand Logo Image Link</label>
                <input
                  type="text"
                  value={settings.general?.logo || ''}
                  onChange={(e) => handleFieldChange('general', 'logo', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={settings.general?.contactPhone || ''}
                  onChange={(e) => handleFieldChange('general', 'contactPhone', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Default Settlement Currency</label>
                <input
                  type="text"
                  value={settings.general?.defaultCurrency || ''}
                  onChange={(e) => handleFieldChange('general', 'defaultCurrency', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Platform Time Zone</label>
                <input
                  type="text"
                  value={settings.general?.timeZone || ''}
                  onChange={(e) => handleFieldChange('general', 'timeZone', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* PANEL: Subscriptions */}
        {activeSubTab === 'subscription' && (
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm border-b border-slate-850 pb-2">Global Subscription & Trial Policies</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Standard Trial Period (Days)</label>
                <input
                  type="number"
                  value={settings.trialSettings?.defaultTrialLengthDays || 14}
                  onChange={(e) => handleFieldChange('trialSettings', 'defaultTrialLengthDays', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Grace Period Buffer (Days)</label>
                <input
                  type="number"
                  value={settings.expirationAndGraceSettings?.gracePeriodDurationDays || 7}
                  onChange={(e) => handleFieldChange('expirationAndGraceSettings', 'gracePeriodDurationDays', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">First Expiration Notice reminder (Days before Expiry)</label>
                <input
                  type="number"
                  value={settings.expirationAndGraceSettings?.firstReminderDaysBeforeExpiry || 7}
                  onChange={(e) => handleFieldChange('expirationAndGraceSettings', 'firstReminderDaysBeforeExpiry', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Second Notice reminder (Days before Expiry)</label>
                <input
                  type="number"
                  value={settings.expirationAndGraceSettings?.secondReminderDaysBeforeExpiry || 3}
                  onChange={(e) => handleFieldChange('expirationAndGraceSettings', 'secondReminderDaysBeforeExpiry', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Trial Eligibility Mode</label>
                <select
                  value={settings.trialSettings?.trialEligibility || 'all_new_companies'}
                  onChange={(e) => handleFieldChange('trialSettings', 'trialEligibility', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="all_new_companies">all_new_companies</option>
                  <option value="verified_companies_only">verified_companies_only</option>
                  <option value="manual_approval_only">manual_approval_only</option>
                  <option value="disabled">disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Expiration Mode (Post-Grace Lockout)</label>
                <select
                  value={settings.expirationAndGraceSettings?.postGraceExpirationBehavior || 'suspended_access'}
                  onChange={(e) => handleFieldChange('expirationAndGraceSettings', 'postGraceExpirationBehavior', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="suspended_access">suspended_access</option>
                  <option value="read_only">read_only</option>
                  <option value="restricted_access">restricted_access</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: Billing */}
        {activeSubTab === 'billing' && (
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm border-b border-slate-850 pb-2">Billing & Tax Configuration</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Tax Percentage (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.billing?.taxRatePercent || 8.5}
                  onChange={(e) => handleFieldChange('billing', 'taxRatePercent', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={settings.billing?.invoiceHeaderPrefix || 'INV-SAAS-'}
                  onChange={(e) => handleFieldChange('billing', 'invoiceHeaderPrefix', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Active Merchant Payment Provider</label>
                <select
                  value={settings.billing?.paymentProvider || 'Stripe'}
                  onChange={(e) => handleFieldChange('billing', 'paymentProvider', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="Stripe">Stripe Gateway (Verified)</option>
                  <option value="PayPal">PayPal Holdings</option>
                  <option value="Authorized.Net">Authorize.Net Merchant</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Allowed Refund Window Duration (Days)</label>
                <input
                  type="number"
                  value={settings.billing?.refundWindowDays || 30}
                  onChange={(e) => handleFieldChange('billing', 'refundWindowDays', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* PANEL: Email Templates */}
        {activeSubTab === 'templates' && (
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm border-b border-slate-850 pb-2">Email Templates Configurations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Welcome */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
                <span className="font-bold text-white block">1. Welcome Onboarding Template</span>
                <input
                  type="text"
                  placeholder="Subject"
                  value={settings.templates?.welcome?.subject || ''}
                  onChange={(e) => handleTemplateChange('welcome', 'subject', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Body"
                  value={settings.templates?.welcome?.body || ''}
                  onChange={(e) => handleTemplateChange('welcome', 'body', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              {/* Approval */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
                <span className="font-bold text-white block">2. Company Approval template</span>
                <input
                  type="text"
                  placeholder="Subject"
                  value={settings.templates?.companyApproval?.subject || ''}
                  onChange={(e) => handleTemplateChange('companyApproval', 'subject', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Body"
                  value={settings.templates?.companyApproval?.body || ''}
                  onChange={(e) => handleTemplateChange('companyApproval', 'body', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              {/* Receipt */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
                <span className="font-bold text-white block">3. Payment Receipt template</span>
                <input
                  type="text"
                  placeholder="Subject"
                  value={settings.templates?.paymentReceipt?.subject || ''}
                  onChange={(e) => handleTemplateChange('paymentReceipt', 'subject', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Body"
                  value={settings.templates?.paymentReceipt?.body || ''}
                  onChange={(e) => handleTemplateChange('paymentReceipt', 'body', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              {/* Failure */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
                <span className="font-bold text-white block">4. Payment Failure template</span>
                <input
                  type="text"
                  placeholder="Subject"
                  value={settings.templates?.paymentFailure?.subject || ''}
                  onChange={(e) => handleTemplateChange('paymentFailure', 'subject', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Body"
                  value={settings.templates?.paymentFailure?.body || ''}
                  onChange={(e) => handleTemplateChange('paymentFailure', 'body', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

            </div>
          </div>
        )}

        {/* PANEL: Security */}
        {activeSubTab === 'security' && (
          <div className="space-y-4">
            <h4 className="font-bold text-white text-sm border-b border-slate-850 pb-2">Platform Security & Audit Configurations</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Administrative Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={settings.security?.sessionDurationMinutes || 60}
                  onChange={(e) => handleFieldChange('security', 'sessionDurationMinutes', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Failed Login attempts Lock Limit</label>
                <input
                  type="number"
                  value={settings.security?.lockoutAttemptsLimit || 5}
                  onChange={(e) => handleFieldChange('security', 'lockoutAttemptsLimit', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Account Lockout duration (Minutes)</label>
                <input
                  type="number"
                  value={settings.security?.lockoutDurationMinutes || 15}
                  onChange={(e) => handleFieldChange('security', 'lockoutDurationMinutes', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Enforce Multi-Factor Auth (MFA)</label>
                <select
                  value={settings.security?.enableMfaEnforcement ? 'yes' : 'no'}
                  onChange={(e) => handleFieldChange('security', 'enableMfaEnforcement', e.target.value === 'yes')}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="no">Optional MFA</option>
                  <option value="yes">Mandatory MFA enforcement</option>
                </select>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
