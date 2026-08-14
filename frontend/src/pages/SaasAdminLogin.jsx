import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '../components/ui';

export default function SaasAdminLogin() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/saas-admin/login', {
        email,
        password,
        twoFactorCode: requires2FA ? twoFactorCode : undefined
      });

      if (res.status === 202 && res.data.status === '2fa_required') {
        setRequires2FA(true);
        toast.info('SuperAdmin 2FA required. Enter your 6-digit code below.');
        return;
      }

      const { token, admin } = res.data;
      localStorage.setItem('saasAdminToken', token);
      localStorage.setItem('saasAdminUser', JSON.stringify(admin));

      toast.success(`Welcome, SaaS Platform Operator ${admin.name}!`);
      navigate('/saas-admin/portal');
    } catch (err) {
      const msg = err.response?.data?.message || 'Access Denied: Invalid administrative credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-purple-950/40 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 mx-auto flex items-center justify-center text-white shadow-xl shadow-purple-600/30 text-2xl font-black">
            👑
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[11px] font-bold uppercase tracking-wider">
              Private Platform Administration
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Saad ERP SuperAdmin
          </h1>
          <p className="text-xs text-slate-400">
            Dedicated portal for multi-tenant SaaS operator control
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              SuperAdmin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@saaderp.com"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 shadow-inner"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Administrative Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {requires2FA && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-amber-300">
                SuperAdmin 2FA Security Code
              </label>
              <input
                type="text"
                required
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-950 border border-amber-500/80 rounded-xl px-3.5 py-2 text-center text-sm font-mono tracking-widest text-white outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : requires2FA ? 'Verify 2FA & Access' : 'Authenticate SuperAdmin'}
            </button>
          </div>

        </form>

        <div className="pt-3 text-center border-t border-slate-800 text-[11px] text-slate-500">
          🔒 Strictly Restricted to Saad ERP SaaS Operators. Unauthorized access attempts are monitored and recorded.
        </div>

      </div>

    </div>
  );
}
