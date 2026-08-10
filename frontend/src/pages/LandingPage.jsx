import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Pill,
  ShoppingCart,
  FileText,
  Truck,
  Brain,
  BarChart3,
  Smartphone,
  PhoneCall,
  HelpCircle,
  Users
} from 'lucide-react';

const LandingPage = () => {

  const features = [
    { title: 'Multi-Company Support', desc: 'Manage independent corporate entities and multi-tenant billing from one dashboard.', icon: Building2 },
    { title: 'Multi-Branch Management', desc: 'Centralized headquarters control over retail outlets, hospital stores, and warehouses.', icon: Users },
    { title: 'Inventory Tracking', desc: 'FEFO batch tracking, automated reorder thresholds, and 30-day expiration alerts.', icon: Pill },
    { title: 'Prescription Management', desc: 'AI OCR text extraction, DDI interaction warnings, and pharmacist digital sign-off.', icon: FileText },
    { title: 'Billing & POS', desc: 'High-speed 1D/2D barcode checkout, split payments, and ESC/POS thermal receipts.', icon: ShoppingCart },
    { title: 'Supplier Management', desc: 'Purchase orders, vendor ledgers, batch receiving, and accounts payable.', icon: Truck },
    { title: 'AI-Powered Insights', desc: '30-day demand forecasting and generic bio-equivalent substitution recommendations.', icon: Brain },
    { title: 'Reports & Analytics', desc: 'Real-time sales KPIs, COGS profit margins, Excel & PDF export engines.', icon: BarChart3 },
    { title: 'Mobile App Suite', desc: 'Delivery agent GPS route app, manager mobile portal, and PWA patient storefront.', icon: Smartphone }
  ];

  const whyUs = [
    { title: 'Cloud-Based', desc: '99.9% uptime hosted on serverless cloud infrastructure.', icon: Zap },
    { title: 'Secure', desc: 'JWT HttpOnly cookies, bcrypt hashing, 2FA OTP, and audit logs.', icon: ShieldCheck },
    { title: 'Scalable', desc: 'Scale seamlessly from single store to national pharmacy chains.', icon: Building2 },
    { title: 'Fast & Reliable', desc: 'Sub-second POS barcode checkout and instant search queries.', icon: Zap },
    { title: 'Easy To Use', desc: 'Intuitive dark medical UI designed for rapid staff onboarding.', icon: CheckCircle2 },
    { title: '24/7 Support', desc: 'Priority technical support SLA for enterprise customers.', icon: PhoneCall }
  ];

  const faqs = [
    { q: 'How does the 14-day free trial work?', a: 'You get full access to all Professional features for 14 days without entering credit card details.' },
    { q: 'Can I manage multiple branches in different cities?', a: 'Yes! Pharmacy ERP supports multi-branch operations with centralized headquarters reporting and inter-branch stock transfers.' },
    { q: 'Is AI OCR prescription scanning included?', a: 'AI OCR scanning is included in Professional and Enterprise plans with automated drug interaction warning checks.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 1. Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0B5E8E] to-[#168A8A] flex items-center justify-center text-white shadow-lg shadow-[#0B5E8E]/30 font-bold text-lg">
              💊
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-wide">Pharmacy ERP <span className="text-[#72D6C1]">SaaS</span></span>
              <p className="text-[10px] text-slate-400 font-medium">Enterprise Cloud Platform</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs text-slate-300 font-medium">
            <a href="#features" className="hover:text-[#72D6C1] transition">Features</a>
            <a href="#why-us" className="hover:text-[#72D6C1] transition">Why Us</a>
            <a href="#pricing" className="hover:text-[#72D6C1] transition">Pricing</a>
            <a href="#faq" className="hover:text-[#72D6C1] transition">FAQ</a>
            <Link to="/store" className="text-[#249B72] hover:text-[#72D6C1] flex items-center gap-1 font-semibold">
              Storefront ↗
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link to="/register-tenant" className="px-5 py-2.5 bg-[#0B5E8E] hover:bg-[#08476B] text-white font-semibold text-xs rounded-xl shadow-lg shadow-[#0B5E8E]/30 transition flex items-center gap-1.5 cursor-pointer">
              Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-blue-400" /> Multi-Tenant & Multi-Branch SaaS Solution
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Manage your pharmacy business from <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">one platform</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Streamline pharmaceuticals inventory tracking, high-speed POS billing, FEFO batch control, AI prescription OCR, supplier purchase orders, and multi-branch operations under one secure cloud ERP.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register-tenant" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2">
              Book Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Features Overview */}
      <section id="features" className="py-20 px-6 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Comprehensive Features Overview</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">Everything you need to operate modern independent pharmacies and large multi-branch chains.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-slate-900 border border-slate-800/80 p-6 rounded-3xl space-y-3 hover:border-blue-500/50 transition">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us */}
      <section id="why-us" className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Why Choose Pharmacy ERP SaaS</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">Built on clean architecture for security, speed, and effortless scaling.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyUs.map((w, i) => {
              const Icon = w.icon;
              return (
                <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{w.title}</h3>
                    <p className="text-xs text-slate-400">{w.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Pricing Preview */}
      <section id="pricing" className="py-20 px-6 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Transparent SaaS Pricing Packages</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">Choose a plan tailored to your pharmacy size and expansion goals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-xs text-slate-400 mt-1">Single location retail pharmacies</p>
                <p className="text-3xl font-extrabold text-white mt-4">$99 <span className="text-xs text-slate-400 font-normal">/ mo</span></p>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1 Branch Location</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 3 User Accounts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> POS Billing & Receipts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Standard FEFO Inventory</li>
              </ul>
              <Link to="/register-tenant" className="block text-center py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition">Select Starter</Link>
            </div>

            <div className="bg-slate-900 border-2 border-blue-500 p-8 rounded-3xl space-y-6 relative shadow-2xl shadow-blue-500/10">
              <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
              <div>
                <h3 className="text-lg font-bold text-white">Professional</h3>
                <p className="text-xs text-slate-400 mt-1">Growing multi-branch chains</p>
                <p className="text-3xl font-extrabold text-white mt-4">$299 <span className="text-xs text-slate-400 font-normal">/ mo</span></p>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 5 Branch Outlets</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 15 User Accounts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> E-Commerce Storefront (`/store`)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Inter-Branch Stock Transfers</li>
              </ul>
              <Link to="/register-tenant" className="block text-center py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition">Select Professional</Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1">Hospital networks & large chains</p>
                <p className="text-3xl font-extrabold text-white mt-4">$799 <span className="text-xs text-slate-400 font-normal">/ mo</span></p>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 999 Branches</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited User Accounts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full AI OCR & 30-Day Forecast</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated Account Manager</li>
              </ul>
              <Link to="/register-tenant" className="block text-center py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition">Select Enterprise</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-400" /> {faq.q}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-800/80 py-12 px-6 bg-slate-900/80 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Pharmacy ERP SaaS Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/store" className="hover:text-white transition">E-Storefront</Link>
            <Link to="/login" className="hover:text-white transition">Owner Login</Link>
            <Link to="/register-tenant" className="hover:text-white transition">Register Tenant</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
