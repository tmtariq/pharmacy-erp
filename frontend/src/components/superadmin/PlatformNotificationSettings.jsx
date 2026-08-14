import { useState, useEffect, useCallback } from 'react';
import API from '../../api/axios';
import {
  Bell, CheckCircle2, RefreshCw, Sliders, Mail, Smartphone, Monitor,
  Info, AlertTriangle, AlertCircle, Sparkles, Building2, HelpCircle
} from 'lucide-react';
import { useToast } from '../ui';

export default function PlatformNotificationSettings() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    smsNotifications: false,
    browserNotifications: true,
    enabledAlertTypes: {
      newCompanyRegistered: true,
      companyApprovalRequired: true,
      paymentReceived: true,
      paymentFailed: true,
      manualPaymentUploaded: true,
      refundRequested: true,
      subscriptionExpiring: true,
      companySuspended: true,
      supportRequestArrived: true,
      webhookFailed: true,
      integrationFailed: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getAdminHeaders = useCallback(() => {
    const token = localStorage.getItem('saasAdminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const fetchNotificationSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [notifRes, prefsRes] = await Promise.all([
        API.get('/saas-admin/notifications', { headers: getAdminHeaders() }),
        API.get('/saas-admin/notifications/preferences', { headers: getAdminHeaders() })
      ]);
      setNotifications(notifRes.data || []);
      if (prefsRes.data) {
        setPrefs(prefsRes.data);
      }
    } catch {
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  }, [getAdminHeaders, toast]);

  useEffect(() => {
    fetchNotificationSettings();
  }, [fetchNotificationSettings]);

  const handleTogglePref = (field) => {
    setPrefs(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleToggleAlertType = (key) => {
    setPrefs(prev => ({
      ...prev,
      enabledAlertTypes: {
        ...prev.enabledAlertTypes,
        [key]: !prev.enabledAlertTypes[key]
      }
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await API.put('/saas-admin/notifications/preferences', prefs, { headers: getAdminHeaders() });
      toast.success('Notification preferences updated successfully!');
    } catch {
      toast.error('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const markRead = async (notifId) => {
    try {
      await API.post(`/saas-admin/notifications/${notifId}/read`, {}, { headers: getAdminHeaders() });
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
    } catch {
      // silent fail
    }
  };

  const getAlertIcon = (type) => {
    if (type.includes('FAIL') || type.includes('ERROR')) return <AlertCircle className="w-4 h-4 text-red-400" />;
    if (type.includes('REQUEST') || type.includes('EXPIRING')) return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <Sparkles className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* Left 2 Columns: Preference Controls */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Delivery Channels Preference */}
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              SaaS Delivery Channel Preferences
            </h3>
            <p className="text-xs text-slate-400">Configure global dispatch routes for system alerts and critical webhooks.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            
            {/* Email Dispatch */}
            <button
              onClick={() => handleTogglePref('emailNotifications')}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer text-left ${
                prefs.emailNotifications
                  ? 'bg-purple-950/20 border-purple-500/40 text-white'
                  : 'bg-slate-950/80 border-slate-850 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail className={`w-4 h-4 ${prefs.emailNotifications ? 'text-purple-400' : 'text-slate-500'}`} />
                <div>
                  <span className="font-bold block">Email Dispatch</span>
                  <span className="text-[10px] text-slate-400">Send to primary admin email</span>
                </div>
              </div>
              <span className={`w-2 h-2 rounded-full ${prefs.emailNotifications ? 'bg-purple-400' : 'bg-slate-600'}`} />
            </button>

            {/* SMS Alerts */}
            <button
              onClick={() => handleTogglePref('smsNotifications')}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer text-left ${
                prefs.smsNotifications
                  ? 'bg-purple-950/20 border-purple-500/40 text-white'
                  : 'bg-slate-950/80 border-slate-850 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Smartphone className={`w-4 h-4 ${prefs.smsNotifications ? 'text-purple-400' : 'text-slate-500'}`} />
                <div>
                  <span className="font-bold block">SMS Text Gateway</span>
                  <span className="text-[10px] text-slate-400">Critical server notifications</span>
                </div>
              </div>
              <span className={`w-2 h-2 rounded-full ${prefs.smsNotifications ? 'bg-purple-400' : 'bg-slate-600'}`} />
            </button>

            {/* Browser Push */}
            <button
              onClick={() => handleTogglePref('browserNotifications')}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer text-left ${
                prefs.browserNotifications
                  ? 'bg-purple-950/20 border-purple-500/40 text-white'
                  : 'bg-slate-950/80 border-slate-850 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Monitor className={`w-4 h-4 ${prefs.browserNotifications ? 'text-purple-400' : 'text-slate-500'}`} />
                <div>
                  <span className="font-bold block">Desktop Push</span>
                  <span className="text-[10px] text-slate-400">Instant dashboard toast alerts</span>
                </div>
              </div>
              <span className={`w-2 h-2 rounded-full ${prefs.browserNotifications ? 'bg-purple-400' : 'bg-slate-600'}`} />
            </button>

          </div>
        </div>

        {/* Dynamic Alert Topics Configuration */}
        <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              SaaS Operational Notification Topics
            </h3>
            <p className="text-xs text-slate-400">Select which automated system alerts trigger dispatches to your devices.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {[
              { key: 'newCompanyRegistered', label: 'New Tenant Signups', desc: 'Notify when a new pharmacy registers' },
              { key: 'companyApprovalRequired', label: 'Organization Approvals', desc: 'License validation check required' },
              { key: 'paymentReceived', label: 'Successful Subscriptions', desc: 'MRR transaction cleared confirmation' },
              { key: 'paymentFailed', label: 'Billing Failures & Non-Payment', desc: 'Declined merchant gateway dispatches' },
              { key: 'manualPaymentUploaded', label: 'Bank Transfer Receipts', desc: 'Verification requests for manual wires' },
              { key: 'refundRequested', label: 'Refund Decisions', desc: 'Customer refund request reviews' },
              { key: 'subscriptionExpiring', label: 'Expiration Reminders', desc: 'Grace period timeline alerts' },
              { key: 'companySuspended', label: 'Company Lockouts', desc: 'SaaS tenant automatic suspensions' },
              { key: 'supportRequestArrived', label: 'Support Inquiries', desc: 'Customer support ticket dispatches' },
              { key: 'webhookFailed', label: 'Webhook Endpoint Outages', desc: 'Payment provider integration failures' },
              { key: 'integrationFailed', label: 'System Service Failures', desc: 'Database backup or SMTP sync issues' }
            ].map(topic => (
              <button
                key={topic.key}
                onClick={() => handleToggleAlertType(topic.key)}
                className={`p-3.5 rounded-xl border transition flex items-center justify-between text-left cursor-pointer ${
                  prefs.enabledAlertTypes[topic.key]
                    ? 'bg-slate-900 border-slate-800 text-white'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500'
                }`}
              >
                <div>
                  <span className="font-bold block">{topic.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{topic.desc}</span>
                </div>
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${prefs.enabledAlertTypes[topic.key] ? 'bg-purple-600' : 'bg-slate-800'}`}>
                  <div className={`bg-white w-3 h-3 rounded-full transition-transform ${prefs.enabledAlertTypes[topic.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
            ))}

          </div>

          <div className="flex justify-end pt-3 border-t border-slate-850">
            <button
              onClick={savePreferences}
              disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

      </div>

      {/* Right 1 Column: Notification History Feed */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 backdrop-blur-md space-y-4 max-h-[640px] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              Live Platform Alert Feed
            </h3>
            <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded font-mono text-[10px] font-bold">
              {notifications.filter(n => !n.isRead).length} New
            </span>
          </div>

          <div className="mt-3 overflow-y-auto space-y-2.5 max-h-[480px] pr-1">
            {loading ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto text-purple-400 mb-2" />
                Loading alerts stream...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No active notifications in history feed.
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => markRead(notif._id)}
                  className={`p-3 rounded-2xl border transition text-xs relative group cursor-pointer ${
                    notif.isRead
                      ? 'bg-slate-950/40 border-slate-900/80 text-slate-400'
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">{getAlertIcon(notif.type)}</div>
                    <div className="space-y-1">
                      <span className="font-bold text-white block text-[11px]">{notif.title}</span>
                      <p className="text-[10px] leading-relaxed text-slate-400">{notif.message}</p>
                      <span className="text-[9px] text-slate-500 font-mono block">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={fetchNotificationSettings}
          className="w-full mt-3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-xl text-[10px] font-bold text-slate-300 flex items-center justify-center gap-1 transition cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh Notifications Stream
        </button>
      </div>

    </div>
  );
}
