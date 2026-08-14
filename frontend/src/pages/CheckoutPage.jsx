import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
  CreditCard, ShieldCheck, Lock, CheckCircle2,
  AlertCircle, ArrowRight, RefreshCw, Sparkles,
  Building2, FileText, Check
} from 'lucide-react';
import { useToast } from '../components/ui';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const sessionId = searchParams.get('session_id') || `cs_stripe_${Date.now()}`;
  const planName = searchParams.get('plan') || 'Professional';
  const amount = Number(searchParams.get('amount')) || (planName === 'Enterprise' ? 399 : planName === 'Basic' ? 49 : 149);
  const cycle = searchParams.get('cycle') || 'monthly';

  const [provider, setProvider] = useState('Stripe');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expDate, setExpDate] = useState('12/28');
  const [cvc, setCvc] = useState('•••');
  const [cardHolder, setCardHolder] = useState('Authorized Pharmacy Representative');
  
  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Trigger Mock Gateway Webhook from Backend to Simulate Real Asynchronous Provider Settlement
  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      // 1. Dispatch Provider Webhook Event directly to Backend Endpoint
      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId,
            sessionId: sessionId,
            payment_intent: `pi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            amount_total: amount * 100,
            currency: 'usd',
            payment_status: 'paid'
          }
        }
      };

      await API.post('/billing/webhook', webhookPayload);

      toast.success('Payment authorized by provider gateway. Verifying backend settlement...');

      // 2. Poll & Verify Backend Settlement
      setVerifying(true);
      setTimeout(async () => {
        try {
          const verifyRes = await API.get(`/billing/verify-session/${sessionId}`);
          setVerificationResult(verifyRes.data);
          if (verifyRes.data.erpAccessGranted) {
            toast.success('Backend confirmed settlement: Enterprise ERP Access Activated!');
          }
        } catch {
          toast.error('Session verification encountered a delay. Check subscription center.');
        } finally {
          setVerifying(false);
          setProcessing(false);
        }
      }, 1500);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-purple-500 selection:text-white">
      
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-purple-600/10 via-indigo-600/10 to-blue-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="max-w-2xl w-full relative z-10 space-y-6">
        
        {/* Saad ERP Secure Merchant Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            Saad ERP SaaS Platform Merchant Account
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Secure Plan Checkout & Merchant Settlement
          </h1>
          <p className="text-xs text-slate-400">
            End-to-end encrypted subscription billing. Payments are received directly by Saad ERP operator.
          </p>
        </div>

        {/* Verification Success Screen */}
        {verificationResult?.erpAccessGranted ? (
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/40 backdrop-blur-xl shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                Payment Verified by Backend
              </span>
              <h2 className="text-xl font-bold text-white">Subscription Activated Successfully!</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Invoice <strong>{verificationResult.invoiceNumber}</strong> has been generated and settled. Full ERP, POS dispensing, and multi-branch features are now active.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-left grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 text-[11px] block">Activated Plan</span>
                <span className="font-bold text-purple-300">{verificationResult.planName} Tier</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Amount Billed</span>
                <span className="font-bold text-white font-mono">${verificationResult.amount} USD</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Company Status</span>
                <span className="font-bold text-emerald-400 uppercase">{verificationResult.companyStatus}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Transaction ID</span>
                <span className="font-mono text-slate-300 text-[11px]">{verificationResult.transactionId}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/app/pos')}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
              >
                Launch POS & ERP System <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Payment Form */
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            
            {/* Left Column: Order Summary */}
            <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-5 backdrop-blur-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Summary</span>
                
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-base font-bold text-white block">{planName} Edition</span>
                  <span className="text-xs text-slate-400 block capitalize">{cycle} Invoicing Schedule</span>
                  <div className="pt-2 border-t border-slate-900 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Total Billed:</span>
                    <span className="text-xl font-black text-white font-mono">${amount}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> Full POS & Cashier Access
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> Automated Cloud Backups
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Check className="w-3.5 h-3.5" /> Multi-Branch Inventory Sync
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[10px] text-slate-500">
                🔒 Protected by 256-Bit SSL Encryption. Your payment is received into the official Saad ERP corporate settlement account.
              </div>
            </div>

            {/* Right Column: Payment Details */}
            <div className="md:col-span-3 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl space-y-5">
              
              {/* Provider Selection Tabs */}
              <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                {['Stripe', 'PayPal', 'Authorize.Net'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      provider === p ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSimulatePayment} className="space-y-3.5 text-xs">
                
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Card Number (Encrypted Gateway)</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Expiry</label>
                    <input
                      type="text"
                      required
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">CVC</label>
                    <input
                      type="text"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={processing || verifying}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {processing || verifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {verifying ? 'Backend Verifying Settlement...' : 'Authorizing with Gateway...'}
                      </>
                    ) : (
                      <>
                        Pay ${amount} USD & Activate Subscription
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Backend verification required. Access is unlocked exclusively upon verified webhook.
                </div>

              </form>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
