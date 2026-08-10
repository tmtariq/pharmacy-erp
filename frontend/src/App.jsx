import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/ToastProvider';
import ProtectedRoute from './components/ProtectedRoute';
import FeatureProtectedRoute from './components/FeatureProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RegisterTenant from './pages/RegisterTenant';
import DashboardRouter from './pages/dashboards/DashboardRouter';
import CompanySettings from './pages/settings/CompanySettings';
import POSBilling from './pages/POSBilling';
import Inventory from './pages/Inventory';
import ExpiryManagement from './pages/ExpiryManagement';
import BarcodeLabels from './pages/BarcodeLabels';
import RiskProtectionMatrix from './pages/RiskProtectionMatrix';
import BackupRestore from './pages/BackupRestore';
import StockTransfers from './pages/StockTransfers';
import PurchasesSuppliers from './pages/PurchasesSuppliers';
import CustomersPatients from './pages/CustomersPatients';
import BranchUserManagement from './pages/BranchUserManagement';
import PharmacySettings from './pages/PharmacySettings';
import ReportsAnalytics from './pages/ReportsAnalytics';
import PharmacySubscription from './pages/PharmacySubscription';
import PrescriptionManagement from './pages/PrescriptionManagement';
import CustomerStorefront from './pages/CustomerStorefront';
import EmployeeManagement from './pages/EmployeeManagement';
import SystemSettings from './pages/SystemSettings';
import LandingPage from './pages/LandingPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import NotFound from './pages/NotFound';
import LegalPages from './pages/LegalPages';

function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* ERP SaaS Homepage & Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/store" element={<CustomerStorefront />} />
        <Route path="/legal" element={<LegalPages />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register-tenant" element={<RegisterTenant />} />

        {/* Protected Operations Layout Shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/superadmin" element={<SuperAdminDashboard />} />
            <Route path="/pos" element={<POSBilling />} />
            <Route path="/prescriptions" element={<PrescriptionManagement />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/expiry" element={<ExpiryManagement />} />
            <Route path="/barcode-labels" element={<BarcodeLabels />} />
            <Route path="/risk-matrix" element={<RiskProtectionMatrix />} />
            <Route path="/purchases" element={<PurchasesSuppliers />} />
            <Route path="/customers" element={<CustomersPatients />} />
            <Route path="/reports" element={<ReportsAnalytics />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/system-settings" element={<SystemSettings />} />
            <Route path="/settings/company" element={<CompanySettings />} />
            <Route path="/settings/subscription" element={<PharmacySubscription />} />
            <Route path="/settings/pharmacy" element={<PharmacySettings />} />

            {/* Feature-Gated Plan Routes */}
            <Route element={<FeatureProtectedRoute flagName="transfers" requiredPlan="Professional" />}>
              <Route path="/transfers" element={<StockTransfers />} />
            </Route>
            <Route element={<FeatureProtectedRoute flagName="backups" requiredPlan="Professional" />}>
              <Route path="/backups" element={<BackupRestore />} />
            </Route>
            <Route element={<FeatureProtectedRoute flagName="multiBranch" requiredPlan="Professional" />}>
              <Route path="/settings/branches" element={<BranchUserManagement />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;