import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Building2, Store, LogOut, ShieldCheck, Sun, Moon, Palette, Menu, X, ShieldAlert, ArrowLeft } from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Navbar = ({ isMobileOpen, onToggleMobileMenu }) => {
  const { user, branches, activeBranchId, switchBranch, logout } = useAuth();
  const { themeMode, toggleTheme, changeAccent, availableAccents, accentColor } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [supportSession, setSupportSession] = useState(null);

  useEffect(() => {
    const session = sessionStorage.getItem('supportSession');
    if (session) {
      try {
        setSupportSession(JSON.parse(session));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleExitSupportMode = () => {
    sessionStorage.removeItem('supportSession');
    window.location.href = '/saas-admin/portal?tab=companies';
  };

  const currentPharmacyName = user?.pharmacy?.name || 'Pharmacy ERP';

  return (
    <>
      {/* Visible Support Access Mode Indicator Header */}
      {supportSession && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-purple-100 px-4 py-2 text-xs font-semibold border-b border-purple-500/40 flex items-center justify-between shadow-lg z-50 sticky top-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-500 text-slate-950 font-black uppercase text-[10px] tracking-wider animate-pulse">
              Support Access Mode
            </span>
            <span>
              Company: <strong className="text-white">{supportSession.companyName}</strong> ({supportSession.companyCode})
            </span>
            <span className="hidden md:inline text-purple-300">
              | Reason: <em className="text-slate-200">"{supportSession.reason}"</em>
            </span>
            <span className="hidden lg:inline text-purple-300">
              | Started: <strong className="text-white">{new Date(supportSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
            </span>
            <span className="hidden xl:inline text-purple-300">
              | Admin: <strong className="text-white">{supportSession.adminName || 'Saad Super Admin'}</strong>
            </span>
          </div>

          <button
            onClick={handleExitSupportMode}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-md shadow-red-600/20"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit Support Mode
          </button>
        </div>
      )}

      <header className="bg-[#051F20] text-[#DAF1DE] border-b border-transparent sticky top-0 z-40 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 overflow-x-auto sm:overflow-visible">
 
        {/* Left: Mobile Drawer Toggle & Pharmacy Brand */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl bg-[#062B26] border border-transparent text-[#DAF1DE] hover:bg-[#163832] lg:hidden cursor-pointer transition-colors"
            aria-label="Toggle Navigation Menu"
            title="Toggle Navigation Menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
 
          <div className="bg-[#235347] p-2 rounded-xl text-[#DAF1DE] font-bold flex items-center justify-center shadow-md lg:hidden">
            <Building2 className="w-5 h-5" />
          </div>
          {/* Title moved to Sidebar */}
        </div>
 
        {/* Center: Global Search Bar with Focus Ring Animation */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full group">
            <input
              type="text"
              placeholder="Global search medicines, Rx #, patients..."
              className="w-full bg-[#062B26] border border-transparent rounded-xl pl-9 pr-12 py-1.5 text-xs text-[#DAF1DE] placeholder-[#8EB69B] focus:outline-none focus:ring-2 focus:ring-[#235347] focus:border-[#235347] focus:bg-[#051F20] transition-all duration-200 shadow-inner"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8EB69B] group-focus-within:text-[#DAF1DE] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block font-mono-code text-[9px] bg-[#163832] text-[#DAF1DE] px-1.5 py-0.5 rounded border border-transparent">⌘K</kbd>
            </div>
          </div>
        </div>
 
        {/* Right Tools: Branch Switcher, Theme & Accent, Notifications, Profile */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
 
          {/* Active Branch Display / Switcher with Live Online Indicator */}
          {branches.length > 0 && (
            <div className="flex items-center space-x-2 bg-[#062B26] border border-transparent px-2.5 sm:px-3 py-1.5 rounded-xl text-xs max-w-[150px] sm:max-w-none shadow-sm">
              <div className="relative flex items-center justify-center shrink-0">
                <Store className="w-3.5 h-3.5 text-[#8EB69B] shrink-0" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#8EB69B] animate-pulse ring-2 ring-[#051F20]" title="Branch Live Online" />
              </div>
              <span className="text-[#8EB69B] font-medium hidden md:inline">Branch:</span>
              {['Owner', 'SuperAdmin'].includes(user?.role) && branches.length > 1 ? (
                <select
                  value={activeBranchId}
                  onChange={(e) => switchBranch(e.target.value)}
                  className="bg-transparent text-[#DAF1DE] font-semibold outline-none cursor-pointer text-xs truncate"
                >
                  {branches.map((b) => (
                    <option key={b._id} value={b._id} className="bg-[#051F20] text-[#DAF1DE]">
                      {b.name} ({b.code}){b.isHeadquarter ? ' ★ HQ' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[#DAF1DE] font-semibold truncate text-[11px] sm:text-xs">
                  {branches.find(b => b._id === activeBranchId)?.name || branches[0]?.name || 'Branch'}
                </span>
              )}
            </div>
          )}
 
          {/* Theme Mode Toggle (Sun/Moon) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#062B26] border border-transparent text-[#DAF1DE] hover:bg-[#163832] cursor-pointer transition-all shrink-0"
            title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
 
          {/* Accent Color Customizer Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-xl bg-[#062B26] border border-transparent text-[#DAF1DE] hover:bg-[#163832] cursor-pointer transition-all"
              title="Change Accent Color Palette"
            >
              <Palette className="w-4 h-4 text-[#8EB69B]" />
            </button>
 
            {showColorPicker && (
              <div className="absolute right-0 mt-2 w-48 bg-[#051F20] border border-transparent rounded-2xl p-3 shadow-2xl z-50 space-y-2">
                <div className="text-[11px] font-bold text-[#8EB69B] uppercase tracking-wider">Accent Palette</div>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(availableAccents || {}).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => { changeAccent(key); setShowColorPicker(false); }}
                      className={`w-6 h-6 rounded-full ${item.bg} ring-2 ${accentColor === key ? 'ring-white scale-110' : 'ring-white/20'} hover:scale-110 cursor-pointer transition-transform`}
                      title={item.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
 
          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
 
          {/* Live Notification Center Dropdown */}
          <NotificationBell />
 
          {/* User Profile Info */}
          <div className="flex items-center space-x-2 pl-2 sm:pl-3 border-l border-[#163832]">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-[#DAF1DE]">{user?.name}</div>
              <div className="text-[10px] text-[#8EB69B] font-medium flex items-center justify-end gap-1">
                <ShieldCheck className="w-3 h-3" />
                {user?.role}
              </div>
            </div>
 
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-[#163832] rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Navbar;
