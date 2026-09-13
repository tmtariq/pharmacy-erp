import { Navigate, Outlet } from 'react-router-dom';

const SuperAdminProtectedRoute = () => {
  const token = localStorage.getItem('saasAdminToken');

  if (!token) {
    return <Navigate to="/saas-admin/login" replace />;
  }

  return <Outlet />;
};

export default SuperAdminProtectedRoute;
