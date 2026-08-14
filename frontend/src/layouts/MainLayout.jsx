import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SubscriptionGatekeeper from '../components/SubscriptionGatekeeper';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isSuperAdmin = user?.role === 'SuperAdmin';

  if (isSuperAdmin) {
    return <Outlet />;
  }

  const toggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 flex flex-col font-sans antialiased">
      {/* Persistent Top Navigation Bar */}
      <Navbar isMobileOpen={isMobileOpen} onToggleMobileMenu={toggleMobileMenu} />

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Left Responsive Navigation Sidebar */}
        <Sidebar isMobileOpen={isMobileOpen} onCloseMobileMenu={closeMobileMenu} />

        {/* Main Operational Workspace Area */}
        <main className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 lg:p-5 bg-slate-950 dark:bg-slate-950 light:bg-slate-50 min-w-0 flex flex-col">
          <SubscriptionGatekeeper />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
