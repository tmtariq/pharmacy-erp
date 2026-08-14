import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { useToast } from '../components/ui';

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password, requires2FA ? twoFactorCode : undefined);
      if (res?.status === '2fa_required') {
        setRequires2FA(true);
        toast.info('Two-Factor Authentication required. Enter code below.');
      } else {
        toast.success('Signed in successfully!');
      }
    } catch (err) {
      const errMsg = !err.response
        ? 'Cannot connect to server. Please verify the backend is running.'
        : err.response?.data?.message || 'Failed to login. Please check credentials.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-hidden font-sans select-none">
      
      {/* Full-bleed Diagonal Blue Background Polygon (Exactly matching reference angle & geometry) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(118deg, #ffffff 44%, #1856ad 44.05%)'
        }}
      />

      {/* Centered White Container / Card with Subtle Elevation */}
      <div className="relative z-10 w-full max-w-[980px] min-h-[520px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* ================= LEFT SIDE: Clean Pharmacy Branding ================= */}
        <div className="w-full md:w-[48%] bg-white p-8 sm:p-12 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center">
            
            {/* Elegant 3-Petal Pharmacy / Lotus Medical Icon in Primary Blue */}
            <div className="mb-5 flex items-center justify-center">
              <svg 
                className="w-20 h-20 text-[#1856ad]" 
                viewBox="0 0 100 100" 
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Center Petal / Cross Pillar */}
                <path d="M50 12 C44 28 42 48 50 68 C58 48 56 28 50 12 Z" opacity="0.95" />
                {/* Left Curved Petal */}
                <path d="M44 25 C26 34 20 54 36 72 C42 58 45 42 44 25 Z" opacity="0.90" />
                {/* Right Curved Petal */}
                <path d="M56 25 C74 34 80 54 64 72 C58 58 55 42 56 25 Z" opacity="0.90" />
                {/* Subtle base curve */}
                <path d="M34 72 C44 76 56 76 66 72 C58 71 42 71 34 72 Z" opacity="0.85" />
              </svg>
            </div>

            {/* Brand Title matching reference typography */}
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#1856ad] uppercase">
              PHARMACY
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-500 mt-1">
              Management System
            </p>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">
              Enterprise Multi-Tenant SaaS Platform
            </p>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Blue Geometric Login Form Container ================= */}
        <div className="w-full md:w-[52%] bg-[#1856ad] p-8 sm:p-12 lg:p-14 text-white flex flex-col justify-center relative">
          
          <div className="max-w-sm w-full mx-auto space-y-5">
            
            {/* Header copy */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Welcome Back
              </h2>
              <p className="text-xs text-blue-100/80 font-normal">
                Sign in to access your pharmacy management system.
              </p>
            </div>

            {/* Error Message banner */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-400/40 rounded text-white text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-200" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {/* 2FA alert banner */}
            {requires2FA && (
              <div className="p-3 bg-amber-400/20 border border-amber-300/40 rounded text-amber-100 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-200" />
                <span>Two-Factor Authentication required. Enter your 6-digit code below.</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-blue-100/90">
                  Your email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-10 px-3.5 bg-white text-slate-800 placeholder-slate-400 text-xs rounded border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition-all"
                />
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-blue-100/90">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-10 pl-3.5 pr-10 bg-white text-slate-800 placeholder-slate-400 text-xs rounded border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* 2FA input field (if triggered) */}
              {requires2FA && (
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-medium text-amber-200">
                    2FA Verification Code (6 digits)
                  </label>
                  <input
                    type="text"
                    required
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="123456"
                    className="w-full h-10 px-3.5 bg-white text-slate-800 font-mono tracking-widest text-center text-sm rounded focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
                  />
                </div>
              )}

              {/* Remember Me & Recover password row */}
              <div className="flex items-center justify-between text-[11px] text-blue-100/90 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-white text-[#1856ad] focus:ring-0 border-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-blue-200 hover:text-white underline underline-offset-2 transition-colors"
                >
                  Recover password?
                </Link>
              </div>

              {/* Action Button matching reference's bright blue pill-rectangle */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-[#4285f4] hover:bg-[#3367d6] text-white text-xs font-bold uppercase tracking-wider rounded shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'AUTHENTICATING...' : requires2FA ? 'VERIFY 2FA & SIGN IN' : 'SIGN IN'}
                </button>
              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;