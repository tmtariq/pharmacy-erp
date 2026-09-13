import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import OwnerDashboard from './OwnerDashboard';
import PharmacistDashboard from './PharmacistDashboard';
import InventoryDashboard from './InventoryDashboard';
import SalesStaffDashboard from './SalesStaffDashboard';
import CashierDashboard from './CashierDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();
  const role = user?.role;

  // SuperAdmin goes to their dedicated dashboard
  if (role === 'SuperAdmin') {
    return <Navigate to="/saas-admin/portal" replace />;
  }

  // Cashier gets dedicated cash register & payment counter dashboard
  if (role === 'Cashier') {
    return <CashierDashboard />;
  }

  // Sales Staff gets sales & customer workstation
  if (role === 'Sales Staff' || role === 'SalesStaff') {
    return <SalesStaffDashboard />;
  }

  // Pharmacist gets dedicated clinical/dispensing dashboard
  if (role === 'Pharmacist') {
    return <PharmacistDashboard />;
  }

  // Inventory Manager gets dedicated stock & supply chain dashboard
  if (role === 'Inventory Manager' || role === 'InventoryManager' || role === 'Inventory Staff') {
    return <InventoryDashboard />;
  }

  // Owner, Admin, and Branch Manager get the executive/branch dashboard
  if (role === 'Owner' || role === 'Admin' || role === 'Branch Manager' || role === 'BranchManager') {
    return <OwnerDashboard />;
  }

  return <OwnerDashboard />;
};

export default DashboardRouter;
