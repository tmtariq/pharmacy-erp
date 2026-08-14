import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  Building2, ShieldCheck, Zap, CheckCircle2, ArrowRight,
  Sparkles, Pill, ShoppingCart, FileText, Truck, Brain,
  BarChart3, Smartphone, PhoneCall, HelpCircle, Users,
  Check, Menu, X
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { title: 'Cloud-Based Infrastructure', desc: '99.9% uptime hosted on serverless cloud architecture.', icon: Zap },
    { title: 'Bank-Grade Security', desc: 'JWT HttpOnly cookies, bcrypt hashing, 2FA OTP, and audit logs.', icon: ShieldCheck },
    { title: 'Chain-Scale Scalability', desc: 'Scale seamlessly from single store to national pharmacy chains.', icon: Building2 },
    { title: 'Sub-Second Speeds', desc: 'Sub-second POS barcode checkout and instant search queries.', icon: Zap },
    { title: 'Empowered Onboarding', desc: 'Intuitive dark medical UI designed for rapid staff onboarding.', icon: CheckCircle2 },
    { title: '24/7 Priority SLA', desc: 'Priority technical support SLA for enterprise customers.', icon: PhoneCall }
  ];

  const faqs = [
    { q: 'How does the 14-day free trial work?', a: 'You get full access to all Professional features for 14 days without entering credit card details.' },
    { q: 'Can I manage multiple branches in different cities?', a: 'Yes! Pharmacy ERP supports multi-branch operations with centralized headquarters reporting and inter-branch stock transfers.' },
    { q: 'Is AI OCR prescription scanning included?', a: 'AI OCR scanning is included in Professional and Enterprise plans with automated drug interaction warning checks.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#72D6C1] selection:text-slate-950 overflow-x-hidden relative">
      
      {/* Dynamic Background Ambient Light Glow Effects */}
      <div className="absolute top-[10%] left-[-10%] w-[50%] aspect-square rounded-full bg-[#0B5E8E] opacity-10 filter blur-[150px] animate-glow-pulse pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45%] aspect-square rounded-full bg-[#168A8A] opacity-[0.08] filter blur-[130px] animate-glow-pulse pointer-events-none" style={{ animationDelay: '-5s' }} />
      <div className="absolute bottom-[10%] left-[20%] w-[40%] aspect-square rounded-full bg-[#72D6C1] opacity-[0.05] filter blur-[160px] pointer-events-none" />

      {/* 1. Header Navigation */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3.5 group cursor-pointer">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0B5E8E] to-[#168A8A] flex items-center justify-center text-white shadow-lg shadow-[#0B5E8E]/20 font-bold text-xl group-hover:scale-105 transition-transform duration-350">
              💊
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight block">
                Pharmacy ERP <span className="text-[#72D6C1] font-mono text-xs ml-1 border border-[#72D6C1]/20 px-2 py-0.5 rounded-full text-glow-accent">SaaS</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block">Enterprise System</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-10 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <a href="#features" className="hover:text-white hover:text-glow-accent transition duration-300">Features</a>
            <a href="#why-us" className="hover:text-white hover:text-glow-accent transition duration-300">Why Us</a>
            <a href="#pricing" className="hover:text-white hover:text-glow-accent transition duration-300">Pricing</a>
            <a href="#faq" className="hover:text-white hover:text-glow-accent transition duration-300">FAQ</a>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login" className="px-5 py-2.5 text-xs font-bold text-slate-350 hover:text-white transition uppercase tracking-wider">
              Sign In
            </Link>
            <Link to="/register-tenant" className="px-6 py-3 bg-[#0B5E8E] hover:bg-[#08476B] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#0B5E8E]/10 transition-all hover:-translate-y-0.5 duration-300 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider relative group overflow-hidden">
              <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-1.5">
                Start Free Trial <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-900 bg-slate-950 px-6 py-8 space-y-6 text-xs uppercase tracking-wider font-bold text-slate-400 animate-fadeIn">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block hover:text-white transition">Features</a>
            <a href="#why-us" onClick={() => setMobileMenuOpen(false)} className="block hover:text-white transition">Why Us</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block hover:text-white transition">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block hover:text-white transition">FAQ</a>
            <div className="pt-4 border-t border-slate-900 flex flex-col gap-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 bg-slate-900 text-slate-300 rounded-xl hover:text-white transition">
                Sign In
              </Link>
              <Link to="/register-tenant" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 bg-[#0B5E8E] text-white rounded-xl shadow-lg transition">
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Premium Hero Section (Asymmetric Two-Part Composition) */}
      <section className="relative py-20 lg:py-28 px-6 lg:px-12 border-b border-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Large Editorial Typography */}
          <div className="lg:col-span-6 space-y-8 animate-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B5E8E]/10 border border-[#0B5E8E]/25 text-[#72D6C1] text-xs font-semibold uppercase tracking-wider font-mono text-glow-accent">
              <Sparkles className="w-4 h-4 animate-pulse" /> Pharmacy Management ERP
            </div>

            <h1 className="text-5xl sm:text-8xl font-display font-bold text-white tracking-tight leading-[1.02] space-y-2">
              <span className="block text-[0.4em] font-sans font-mono uppercase tracking-[0.2em] text-[#72D6C1] font-semibold text-glow-accent">Smarter</span>
              <span className="block text-[1.1em] font-black text-white text-glow-blue">Pharmacy</span>
              <span className="block text-[0.9em] italic font-light text-slate-300">Management.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
              Manage medicines, branches, prescriptions, sales, staff, and complex multi-tenant business operations from one powerful, state-of-the-art platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link to="/register-tenant" className="w-full sm:w-auto px-8 py-4 bg-[#0B5E8E] hover:bg-[#08476B] text-white font-bold text-xs rounded-xl shadow-xl shadow-[#0B5E8E]/15 transition-all hover:-translate-y-0.5 duration-300 flex items-center justify-center gap-2 uppercase tracking-wider group relative overflow-hidden">
                <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-350 border border-slate-800/80 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-wider">
                Book Live Demo
              </Link>
            </div>

            {/* Overlapping small floating category labels */}
            <div className="flex items-center gap-8 pt-6 border-t border-slate-900/60 max-w-md">
              <div className="text-xs space-y-1">
                <span className="font-mono font-bold text-[#72D6C1] block tracking-wider">01 / DISPENSARY</span>
                <span className="text-slate-500">Real-time checkout POS</span>
              </div>
              <div className="text-xs space-y-1">
                <span className="font-mono font-bold text-[#72D6C1] block tracking-wider">02 / LOGISTICS</span>
                <span className="text-slate-500">FEFO batch tracking</span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Healthcare Visual Frame (Asymmetric placement) */}
          <div className="lg:col-span-6 relative group">
            {/* Visual Backlight Glow */}
            <div className="absolute inset-[-10px] bg-gradient-to-tr from-[#0B5E8E]/30 to-[#72D6C1]/20 rounded-3xl opacity-60 filter blur-[40px] group-hover:opacity-85 transition-opacity duration-700 pointer-events-none" />
            
            <div className="relative rounded-3xl overflow-hidden border border-slate-900 bg-slate-900/40 p-3 lg:p-4 backdrop-blur-xl shadow-2xl transition-transform duration-700 hover:scale-[1.01]">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
                alt="Modern Pharmacy Professional Workflow"
                className="w-full h-[320px] lg:h-[480px] object-cover rounded-2xl filter grayscale contrast-[1.1] opacity-90 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none" />
              
              {/* Floating interface details card with accent glowing border */}
              <div className="absolute bottom-8 left-8 right-8 bg-slate-950/95 border border-[#72D6C1]/25 p-5 rounded-2xl backdrop-blur-md space-y-2 max-w-sm shadow-xl shadow-slate-950/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#72D6C1] animate-ping" />
                  <span className="text-[10px] font-mono font-bold text-[#72D6C1] tracking-widest uppercase text-glow-accent">System Core Active</span>
                </div>
                <h4 className="text-xs font-bold text-white tracking-tight">Interactive Prescription Verification</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">AI extracts DDI interaction warning codes instantly on doctor prescription documents.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Brand Introduction (Asymmetric Layout) */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[10px] font-mono font-bold text-[#72D6C1] tracking-widest uppercase block text-glow-accent">Pharmacy Technology</span>
            <h2 className="text-3xl lg:text-5xl font-display font-semibold text-white tracking-tight leading-tight">
              Everything your pharmacy needs.<br />
              <span className="italic font-light text-slate-400">In one intelligent platform.</span>
            </h2>
          </div>
          <div className="lg:col-span-7 flex flex-col justify-end border-l border-slate-900 pl-6 lg:pl-12">
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
              Saad Pharmacy ERP combines state-of-the-art multi-tenant security architecture with advanced logistics tracking, inter-branch transfers, real-time POS processing, and automatic regulatory audits. Scale easily from independent dispensaries to nationwide corporate drugstores.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Comprehensive Features Overview (Split compositions instead of generic card grid) */}
      <section id="features" className="py-20 lg:py-28 px-6 lg:px-12 bg-slate-900/10 border-b border-slate-900">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">SaaS Application Feature Set</h2>
            <p className="text-xs sm:text-xs text-slate-450 uppercase tracking-widest font-mono text-glow-accent">Modern technology solutions for medical enterprises</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-slate-950 border border-slate-900 p-6 lg:p-8 rounded-3xl space-y-4 glow-card-hover duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B5E8E]/10 text-[#72D6C1] flex items-center justify-center border border-[#0B5E8E]/20 transition-transform duration-500 hover:rotate-6">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white tracking-tight">{f.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Statistics / Trust Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-slate-950 border-b border-slate-900 relative">
        {/* Statistics light highlight backline */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0B5E8E]/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            
            <div className="space-y-2 border-l-2 border-[#0B5E8E] pl-6 hover:border-[#72D6C1] transition-colors duration-300">
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight text-glow-blue">500+</h2>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Registered Pharmacies</p>
            </div>

            <div className="space-y-2 border-l-2 border-[#0B5E8E] pl-6 hover:border-[#72D6C1] transition-colors duration-300">
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight text-glow-blue">20+</h2>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Branch Networks</p>
            </div>

            <div className="space-y-2 border-l-2 border-[#0B5E8E] pl-6 hover:border-[#72D6C1] transition-colors duration-300">
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight text-glow-blue">50K+</h2>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Processed Prescriptions</p>
            </div>

            <div className="space-y-2 border-l-2 border-[#0B5E8E] pl-6 hover:border-[#72D6C1] transition-colors duration-300">
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tight text-glow-blue">99.9%</h2>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">System Availability</p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. ERP Product Showcase Mockup Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-slate-900/10 border-b border-slate-900">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] font-mono font-bold text-[#72D6C1] tracking-widest uppercase block text-glow-accent">Consolidated Analytics</span>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-white tracking-tight">
                One platform.<br />Every pharmacy operation.
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Unlock cross-branch analytics, real-time inventory levels, financial revenue dashboards, and manager audit histories from your dashboard.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 gap-3 text-xs">
              {['Inventory', 'Sales', 'Purchasing', 'Prescriptions', 'Staff', 'Branches', 'Reports', 'Payments'].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-900 flex items-center gap-3 transition-colors duration-300 hover:border-[#72D6C1]/30">
                  <CheckCircle2 className="w-4 h-4 text-[#72D6C1] text-glow-accent" />
                  <span className="font-bold text-slate-200">{item} Control</span>
                </div>
              ))}
            </div>
          </div>

          {/* Large Mockup Image Frame with Accent Shadow */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0B5E8E]/10 to-[#72D6C1]/5 rounded-3xl opacity-50 filter blur-[40px] pointer-events-none" />
            <div className="border border-slate-900 bg-slate-950 p-3 lg:p-4 rounded-3xl shadow-2xl transition-transform duration-750 hover:scale-[1.005]">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video border border-slate-900/60">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
                  alt="Pharmacy Dashboard ERP Analytics Interface Mockup"
                  className="w-full h-full object-cover filter grayscale contrast-125 opacity-90 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Why Choose Us / Trust Matrix */}
      <section id="why-us" className="py-20 lg:py-28 px-6 lg:px-12 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">Security & Architecture Foundations</h2>
            <p className="text-xs sm:text-xs text-slate-450 uppercase tracking-widest font-mono text-glow-accent">Premium design for professional medical environments</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {whyUs.map((w, i) => {
              const Icon = w.icon;
              return (
                <div key={i} className="bg-slate-950 border border-slate-900 p-6 lg:p-8 rounded-3xl flex items-start gap-4 hover:border-[#0B5E8E]/30 glow-card-hover duration-300">
                  <div className="p-3 bg-[#0B5E8E]/10 text-[#72D6C1] rounded-2xl shrink-0 border border-[#0B5E8E]/25 transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white tracking-tight">{w.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Pricing Preview Packages */}
      <section id="pricing" className="py-20 lg:py-28 px-6 lg:px-12 bg-slate-900/10 border-b border-slate-900">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">Transparent Pricing Model</h2>
            <p className="text-xs sm:text-xs text-slate-450 uppercase tracking-widest font-mono text-glow-accent">Scale your pharmacy chain seamlessly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            
            {/* Starter Plan */}
            <div className="bg-slate-950 border border-slate-900 p-8 rounded-3xl flex flex-col justify-between space-y-8 glow-card-hover duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Starter Plan</h3>
                  <p className="text-xs text-slate-400 mt-1">Single location retail pharmacies</p>
                  <p className="text-3xl font-extrabold text-white mt-4 font-mono text-glow-blue">$99<span className="text-xs text-slate-450 font-normal"> / month</span></p>
                </div>
                <ul className="space-y-3 text-xs text-slate-350">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 1 Branch Location</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 3 User Accounts</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> POS Billing & Receipts</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Standard FEFO Inventory</li>
                </ul>
              </div>
              <Link to="/register-tenant" className="block text-center py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition">Select Starter</Link>
            </div>

            {/* Professional Plan with accent glow shadow */}
            <div className="bg-slate-950 border-2 border-[#0B5E8E] p-8 rounded-3xl flex flex-col justify-between space-y-8 relative shadow-xl shadow-[#0B5E8E]/10 hover:shadow-2xl hover:shadow-[#72D6C1]/10 transition-shadow duration-300">
              <div className="absolute -top-3.5 right-6 bg-[#0B5E8E] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest font-mono text-glow-accent">Most Popular</div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Professional Plan</h3>
                  <p className="text-xs text-slate-400 mt-1">Growing multi-branch networks</p>
                  <p className="text-3xl font-extrabold text-white mt-4 font-mono text-glow-blue">$299<span className="text-xs text-slate-450 font-normal"> / month</span></p>
                </div>
                <ul className="space-y-3 text-xs text-slate-350">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 5 Branch Outlets</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 15 User Accounts</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Automated Branch stock transfers</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Centralized supplier ledger reports</li>
                </ul>
              </div>
              <Link to="/register-tenant" className="block text-center py-3.5 bg-[#0B5E8E] hover:bg-[#08476B] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition">Select Professional</Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-slate-950 border border-slate-900 p-8 rounded-3xl flex flex-col justify-between space-y-8 glow-card-hover duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Enterprise Plan</h3>
                  <p className="text-xs text-slate-400 mt-1">Hospital networks & national chains</p>
                  <p className="text-3xl font-extrabold text-white mt-4 font-mono text-glow-blue">$799<span className="text-xs text-slate-450 font-normal"> / month</span></p>
                </div>
                <ul className="space-y-3 text-xs text-slate-350">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Up to 999 Branches</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited User Accounts</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Full AI OCR & 30-Day Forecast</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Dedicated Account Manager</li>
                </ul>
              </div>
              <Link to="/register-tenant" className="block text-center py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition">Select Enterprise</Link>
            </div>

          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section id="faq" className="py-20 lg:py-28 px-6 lg:px-12 bg-slate-950 border-b border-slate-900">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-900 rounded-2xl p-6 lg:p-8 space-y-3 hover:border-[#72D6C1]/20 transition-colors duration-300">
                <h3 className="text-sm font-bold text-white flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#72D6C1] text-glow-accent" /> {faq.q}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed pl-6.5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Call-To-Action Segment */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 bg-[#0B5E8E]/10 border-b border-slate-900 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B5E8E]/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-white leading-tight tracking-tight">
            Ready to optimize your pharmacy operations?
          </h2>
          <p className="text-slate-450 text-xs uppercase tracking-widest font-mono text-glow-accent">Setup your pharmacy company and launch custom POS terminals in minutes</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
            <Link to="/register-tenant" className="w-full sm:w-auto px-8 py-4 bg-[#0B5E8E] hover:bg-[#08476B] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition">
              Start Free 14-Day Trial
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 font-bold text-xs uppercase tracking-wider rounded-xl transition">
              Contact Sales Specialists
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="py-16 px-6 lg:px-12 bg-slate-950 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#0B5E8E] to-[#168A8A] flex items-center justify-center text-white text-xs">💊</span>
            <span className="text-slate-300 font-bold font-sans text-xs">Saad Pharmacy ERP SaaS</span>
          </div>
          <p className="text-[10px] text-center sm:text-left">© 2026 Pharmacy ERP SaaS Platform. All rights reserved.</p>
          <div className="flex items-center gap-6 font-semibold uppercase tracking-wider text-[10px]">
            <Link to="/login" className="hover:text-white transition">Owner Login</Link>
            <Link to="/register-tenant" className="hover:text-white transition">Register Tenant</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
