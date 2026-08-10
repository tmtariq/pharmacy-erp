import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Camera, Save } from 'lucide-react';

const CompanySettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
  const [billing, setBilling] = useState({ taxId: '', taxRate: 0, taxInclusive: false, invoicePrefix: '', invoiceFormat: 'Sequential', invoiceFooter: '', paymentTerms: '' });
  const [business, setBusiness] = useState({ currency: 'USD', fiscalYearStart: 'January', openTime: '', closeTime: '', methods: { Cash: false, Card: false, Mobile: false, Split: false } });
  const [notifications, setNotifications] = useState({ lowStock: false, expiry: false, dailySales: false, newStaff: false, poReminders: false, email: '' });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pharmRes, setRes] = await Promise.all([
          API.get('/tenants/pharmacy').catch(() => ({ data: {} })),
          API.get('/settings').catch(() => ({ data: {} }))
        ]);
        if (pharmRes.data) setProfile(prev => ({ ...prev, ...pharmRes.data }));
        if (setRes.data) {
          if (setRes.data.billing) setBilling(prev => ({ ...prev, ...setRes.data.billing }));
          if (setRes.data.business) setBusiness(prev => ({ ...prev, ...setRes.data.business }));
          if (setRes.data.notifications) setNotifications(prev => ({ ...prev, ...setRes.data.notifications }));
        }
      } catch (err) { console.error('Settings fetch error:', err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      if (activeTab === 'profile') {
        await API.put('/tenants/pharmacy', profile);
      } else {
        const payload = { billing, business, notifications };
        await API.put('/settings', payload);
      }
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save settings.');
    }
    setSaving(false);
  };

  const tabs = [
    { id: 'profile', label: 'Company Profile' },
    { id: 'billing', label: 'Tax & Billing' },
    { id: 'business', label: 'Business Settings' },
    { id: 'notifications', label: 'Notifications' }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-10 w-full bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-64 w-full bg-slate-800/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 text-slate-100 min-h-full space-y-6 overflow-y-auto">
      <h1 className="text-2xl font-bold font-display">Company Settings</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0B5E8E] text-white shadow-lg shadow-[#0B5E8E]/25'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Card */}
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 shadow-xl">
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${
            message.includes('success')
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/15 text-red-400 border border-red-500/20'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-4">
          {activeTab === 'profile' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Company Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                  <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Phone</label>
                  <input type="text" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-slate-400 mb-1.5">Address</label>
                  <textarea value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 h-24 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-slate-400 mb-1.5">Company Logo</label>
                <div className="w-32 h-32 bg-slate-950/80 border-2 border-dashed border-slate-700/60 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:border-blue-500/40 transition-colors cursor-pointer">
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-xs text-center px-2">Logo upload coming soon</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'billing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Tax ID / Registration Number</label>
                <input type="text" value={billing.taxId} onChange={e => setBilling({...billing, taxId: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Default Tax Rate %</label>
                <input type="number" value={billing.taxRate} onChange={e => setBilling({...billing, taxRate: Number(e.target.value)})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="flex items-center space-x-3 py-2">
                <button onClick={() => setBilling({...billing, taxInclusive: !billing.taxInclusive})} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${billing.taxInclusive ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${billing.taxInclusive ? 'translate-x-5' : ''}`} />
                </button>
                <label className="text-sm text-slate-400">Tax-inclusive pricing</label>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Invoice Prefix</label>
                <input type="text" value={billing.invoicePrefix} onChange={e => setBilling({...billing, invoicePrefix: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none transition-all" placeholder="INV-" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Invoice Number Format</label>
                <select value={billing.invoiceFormat} onChange={e => setBilling({...billing, invoiceFormat: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none transition-all">
                  <option>Sequential</option>
                  <option>Date-based</option>
                  <option>Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Payment Terms</label>
                <input type="text" value={billing.paymentTerms} onChange={e => setBilling({...billing, paymentTerms: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none transition-all" placeholder="Net 30" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1.5">Invoice Footer Text</label>
                <textarea value={billing.invoiceFooter} onChange={e => setBilling({...billing, invoiceFooter: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 h-24 resize-none focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>
          )}

          {activeTab === 'business' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Default Currency</label>
                <select value={business.currency} onChange={e => setBusiness({...business, currency: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none transition-all">
                  {['USD','EUR','GBP','PKR','INR','AED','SAR'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Fiscal Year Start Month</label>
                <select value={business.fiscalYearStart} onChange={e => setBusiness({...business, fiscalYearStart: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none transition-all">
                  {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Opening Time</label>
                <input type="time" value={business.openTime} onChange={e => setBusiness({...business, openTime: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Closing Time</label>
                <input type="time" value={business.closeTime} onChange={e => setBusiness({...business, closeTime: e.target.value})} className="w-full bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-2">Enable Payment Methods</label>
                <div className="flex flex-wrap gap-4">
                  {Object.keys(business.methods).map(method => (
                    <label key={method} className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                      <input type="checkbox" checked={business.methods[method]} onChange={e => setBusiness({...business, methods: {...business.methods, [method]: e.target.checked}})} className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-blue-500" />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Notification Email</label>
                <input type="email" value={notifications.email} onChange={e => setNotifications({...notifications, email: e.target.value})} className="w-full md:w-1/2 bg-slate-950/80 border border-slate-700/60 text-white rounded-xl px-3 py-2.5 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="space-y-3">
                {[
                  { key: 'lowStock', label: 'Low stock alerts (email)' },
                  { key: 'expiry', label: 'Expiry alerts (email)' },
                  { key: 'dailySales', label: 'Daily sales summary (email)' },
                  { key: 'newStaff', label: 'New staff login (email)' },
                  { key: 'poReminders', label: 'Purchase order reminders' }
                ].map(item => (
                  <label key={item.key} className="flex items-center space-x-3 text-sm text-slate-300 cursor-pointer group">
                    <button onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key]})} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${notifications[item.key] ? 'bg-blue-600' : 'bg-slate-700'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifications[item.key] ? 'translate-x-5' : ''}`} />
                    </button>
                    <span className="group-hover:text-white transition-colors">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-auto px-6 py-2.5 bg-[#0B5E8E] hover:bg-[#08476B] disabled:opacity-50 text-white rounded-xl font-medium transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#0B5E8E]/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
