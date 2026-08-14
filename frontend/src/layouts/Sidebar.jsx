import { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import API from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { canAccess } from '../constants/permissions';
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  Clock,
  Barcode,
  ArrowLeftRight,
  Truck,
  Users,
  Building2,
  FileBarChart,
  Database,
  ShieldCheck,
  Settings,
  CreditCard,
  FileText,
  ShoppingBag,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isMobileOpen = false, onCloseMobileMenu }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [featureFlags, setFeatureFlags] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('Professional');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const fetchFlags = useCallback(async () => {
    try {
      const res = await API.get('/subscriptions/my-subscription');
      if (res.data) {
        setFeatureFlags(res.data.featureFlags || {});
        setCurrentPlan(res.data.subscription?.planName || 'Professional');
      }
    } catch (err) {
      console.error('Failed to load feature flags:', err);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const navSections = [
    {
      label: 'Overview',
      items: [
        { label: t('dashboard', 'Dashboard'), path: '/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Operations',
      items: [
        { label: t('posBilling', 'POS Billing'), path: '/pos', icon: ShoppingCart, highlight: true, flag: 'pos' },
        { label: t('prescriptions', 'Prescription & AI OCR'), path: '/prescriptions', icon: FileText, highlight: true },
      ]
    },
    {
      label: 'Inventory',
      items: [
        { label: t('inventory', 'Medicines & Batches'), path: '/inventory', icon: Pill, flag: 'inventory' },
        { label: t('expiryManagement', 'Expiry & FEFO'), path: '/expiry', icon: Clock, flag: 'expiry' },
        { label: 'Barcode & Labels', path: '/barcode-labels', icon: Barcode, flag: 'barcode' },
        { label: t('stockTransfers', 'Stock Transfers'), path: '/transfers', icon: ArrowLeftRight, flag: 'transfers' },
      ]
    },
    {
      label: 'Procurement',
      items: [
        { label: t('suppliers', 'Purchases & Suppliers'), path: '/purchases', icon: Truck, flag: 'purchases' },
      ]
    },
    {
      label: 'Customers',
      items: [
        { label: t('customers', 'Patients & Customers'), path: '/customers', icon: Users, flag: 'customers' },
        { label: t('storefront', 'E-Storefront'), path: '/store', icon: ShoppingBag },
      ]
    },
    {
      label: 'Analytics',
      items: [
        { label: t('reports', 'Reports & Analytics'), path: '/reports', icon: FileBarChart, flag: 'reports' },
      ]
    },
    {
      label: 'Staff & Team',
      items: [
        { label: t('employees', 'Staff Management'), path: '/employees', icon: Users },
      ]
    },
    {
      label: 'Management',
      ownerOnly: true,
      items: [
        { label: t('branchManagement', 'Branches'), path: '/settings/branches', icon: Building2, badge: 'Pro' },
        { label: 'Company Settings', path: '/settings/company', icon: Settings },
        { label: 'Pharmacy Settings', path: '/settings/pharmacy', icon: Settings },
        { label: t('backupRestore', 'Backup & Restore'), path: '/backups', icon: Database, flag: 'backups' },
        { label: t('subscriptions', 'Subscription'), path: '/settings/subscription', icon: CreditCard, highlight: true },
      ]
    }
  ];

  const userRole = user?.role || 'Cashier';

  const visibleSections = navSections
    .map(section => {
      // Filter items within each section
      const filteredItems = section.items.filter(item => {
        // Role + Granular Permission access check
        if (!canAccess(user, item.path)) return false;
        // Owner/Admin-only section check
        if (section.ownerOnly && userRole !== 'Owner' && userRole !== 'Admin') return false;
        // Feature flag check
        if (item.flag && featureFlags && featureFlags[item.flag] === false) return false;
        return true;
      });
      return { ...section, items: filteredItems };
    })
    .filter(section => section.items.length > 0);

  const handleNavClick = () => {
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop Blur */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content (Dark Deepest Teal #051F20 background, Collapsible Icon-Only Mode) */}
      <aside
        className={`bg-[#051F20] border-r border-transparent flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out z-30 fixed inset-y-0 left-0 lg:static lg:z-auto lg:h-full lg:translate-x-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-72'
        } ${isMobileOpen ? 'w-72 translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
          {/* Mobile Drawer Header */}
          <div className="p-4 border-b border-transparent flex items-center justify-between lg:hidden shrink-0">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-accent/20 border border-accent/30 text-accent shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-white font-display leading-tight break-words">
                {user?.pharmacy?.name || 'Pharmacy ERP'}
              </span>
            </div>
            <button
              onClick={onCloseMobileMenu}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#163832] cursor-pointer shrink-0 ml-2"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
 
          <div className="p-3 space-y-1 flex-1">
            {!isCollapsed && (
              <div className="flex items-center space-x-2.5 px-3 py-2.5 mb-2 border-b border-transparent">
                <div className="p-1.5 rounded-lg bg-accent/20 border border-accent/30 text-accent shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm sm:text-base text-white font-display leading-tight break-words">
                  {user?.pharmacy?.name || 'Pharmacy ERP'}
                </span>
              </div>
            )}
            {visibleSections.map((section) => (
              <div key={section.label} className="mb-4 last:mb-0">
                {!isCollapsed && (
                  <div className="px-3 py-1.5 mt-3 first:mt-0 text-[10px] font-bold uppercase tracking-widest text-[#8EB69B] font-mono">
                    {section.label}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      title={isCollapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center ${isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3.5 py-2.5'} rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-[#235347] text-[#DAF1DE] shadow-lg shadow-[#235347]/30 font-semibold tracking-tight'
                            : item.highlight
                            ? 'text-[#8EB69B] hover:bg-[#235347]/20'
                            : 'text-[#DAF1DE]/90 hover:bg-[#163832] hover:text-[#DAF1DE]'
                        }`
                      }
                    >
                      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} truncate`}>
                        <Icon className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold font-mono-code px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ml-1">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Desktop Sidebar Collapse Toggle + Subscription Card */}
          <div className="p-3 border-t border-transparent shrink-0 space-y-2">
            {!isCollapsed ? (
              <NavLink
                to="/settings/subscription"
                onClick={handleNavClick}
                className="bg-[#163832] hover:bg-[#235347] border border-transparent rounded-xl p-3 text-xs text-[#DAF1DE] block transition-all"
              >
                <div>
                  <div className="font-bold text-[#DAF1DE] flex items-center gap-1.5 mb-0.5 font-display">
                    <CreditCard className="w-4 h-4 text-[#8EB69B]" />
                    {currentPlan} Plan
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8EB69B] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#8EB69B] animate-pulse"></span>
                    Active Subscription
                  </div>
                </div>
              </NavLink>
            ) : (
              <NavLink
                to="/settings/subscription"
                title={`${currentPlan} Plan - Active`}
                className="flex items-center justify-center p-2.5 rounded-xl bg-[#163832] border border-transparent text-[#8EB69B] hover:bg-[#235347]"
              >
                <CreditCard className="w-5 h-5" />
              </NavLink>
            )}

            {/* Desktop Expand/Collapse Sidebar Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center justify-center w-full py-2 rounded-xl text-[#DAF1DE]/80 hover:text-[#DAF1DE] hover:bg-[#163832] border border-transparent cursor-pointer transition-all text-xs font-medium gap-2"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse Menu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
