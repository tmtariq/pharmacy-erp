import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '../components/ui';

const ForgotPassword = () => {
  const { sendPasswordReset } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);

    try {
      await sendPasswordReset(email);
      setMsg('A password reset link has been dispatched to your email address.');
      toast.success('Password reset email sent!');
    } catch (err) {
      const errMsg = err.message || err.response?.data?.message || 'Failed to send password reset email.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-hidden font-sans select-none">
      
      {/* Full-bleed Diagonal Blue Background Polygon (matching Login style) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(118deg, #ffffff 44%, #1856ad 44.05%)'
        }}
      />

      {/* Centered White Container / Card */}
      <div className="relative z-10 w-full max-w-[880px] min-h-[460px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
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
                <path d="M50 12 C44 28 42 48 50 68 C58 48 56 28 50 12 Z" opacity="0.95" />
                <path d="M44 25 C26 34 20 54 36 72 C42 58 45 42 44 25 Z" opacity="0.90" />
                <path d="M56 25 C74 34 80 54 64 72 C58 58 55 42 56 25 Z" opacity="0.90" />
                <path d="M34 72 C44 76 56 76 66 72 C58 71 42 71 34 72 Z" opacity="0.85" />
              </svg>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#1856ad] uppercase">
              PHARMACY
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-500 mt-1">
              Account Recovery
            </p>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Blue Geometric Recovery Container ================= */}
        <div className="w-full md:w-[52%] bg-[#1856ad] p-8 sm:p-12 text-white flex flex-col justify-center relative">
          
          <div className="max-w-sm w-full mx-auto space-y-5">
            
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Reset Password
              </h2>
              <p className="text-xs text-blue-100/80 font-normal">
                Enter your verified email to receive a password recovery link.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-400/40 rounded text-white text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-200" />
                <span className="leading-tight">{error}</span>
              </div>
            )}

            {msg && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded text-emerald-100 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
                <span className="leading-tight">{msg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-blue-100/90">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. owner@pharmacy.com"
                  className="w-full h-10 px-3.5 bg-white text-slate-800 placeholder-slate-400 text-xs rounded border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-[#4285f4] hover:bg-[#3367d6] text-white text-xs font-bold uppercase tracking-wider rounded shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'SENDING RESET LINK...' : 'SEND RESET LINK'}
                </button>
              </div>

            </form>

            <div className="pt-3 text-center border-t border-blue-400/20">
              <Link to="/login" className="inline-flex items-center gap-1 text-[11px] text-blue-200/80 hover:text-white font-medium">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ForgotPassword;
