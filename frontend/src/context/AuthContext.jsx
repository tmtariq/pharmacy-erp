/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export const AuthContext = createContext();
export { useAuth } from '../hooks/useAuth';

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState(localStorage.getItem('activeBranchId') || '');
  const [loading, setLoading] = useState(true);

  const fetchBranches = async (userObj) => {
    try {
      const res = await API.get('/tenants/branches');
      setBranches(res.data || []);

      const isOwnerOrSuperAdmin = ['Owner', 'SuperAdmin'].includes(userObj?.role);
      const userBranch = userObj?.branch?._id || userObj?.branch;

      let targetBranch = userBranch;

      if (isOwnerOrSuperAdmin) {
        const storedBranch = localStorage.getItem('activeBranchId');
        if (storedBranch && res.data?.some(b => b._id === storedBranch)) {
          targetBranch = storedBranch;
        } else if (res.data?.[0]?._id) {
          targetBranch = res.data[0]._id;
        }
      } else {
        // Non-owner staff: ALWAYS force activeBranchId to their assigned primary branch
        targetBranch = userBranch || (res.data?.[0]?._id);
      }

      if (targetBranch) {
        setActiveBranchId(targetBranch);
        localStorage.setItem('activeBranchId', targetBranch);
      }
    } catch (err) {
      console.error('Failed to fetch tenant branches:', err);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          const response = await API.get('/auth/me');
          const fetchedUser = response.data.user;
          setUser(fetchedUser);
          await fetchBranches(fetchedUser);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('activeBranchId');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password, twoFactorCode) => {
    const response = await API.post('/auth/login', { email, password, twoFactorCode });
    if (response.status === 202 && response.data.status === '2fa_required') {
      return response.data;
    }

    const { accessToken, user: loggedUser } = response.data;

    localStorage.setItem('accessToken', accessToken);
    setUser(loggedUser);

    const defaultBranch = loggedUser.branch?._id || loggedUser.branch;
    if (defaultBranch) {
      setActiveBranchId(defaultBranch);
      localStorage.setItem('activeBranchId', defaultBranch);
    }

    await fetchBranches(loggedUser);
    if (loggedUser?.role === 'SuperAdmin') {
      navigate('/superadmin');
    } else {
      navigate('/dashboard');
    }
    return loggedUser;
  };

  const registerTenant = async (onboardingData) => {
    const response = await API.post('/tenants/register', onboardingData);
    const { accessToken, user: loggedUser, branch } = response.data;

    localStorage.setItem('accessToken', accessToken);
    setUser(loggedUser);

    if (branch?._id) {
      setActiveBranchId(branch._id);
      localStorage.setItem('activeBranchId', branch._id);
    }

    await fetchBranches(loggedUser);
    navigate('/dashboard');
    return loggedUser;
  };

  const switchBranch = (branchId) => {
    const isOwnerOrSuperAdmin = ['Owner', 'SuperAdmin'].includes(user?.role);
    if (!isOwnerOrSuperAdmin) {
      console.warn('Branch switching is restricted to pharmacy owners.');
      return;
    }
    setActiveBranchId(branchId);
    localStorage.setItem('activeBranchId', branchId);
    window.location.reload();
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('activeBranchId');
      setUser(null);
      setBranches([]);
      navigate('/login');
    }
  };

  const sendPasswordReset = async (emailToReset) => {
    return await API.post('/auth/forgot-password', { email: emailToReset });
  };

  return (
    <AuthContext.Provider value={{
      user,
      branches,
      activeBranchId,
      switchBranch,
      login,
      registerTenant,
      logout,
      sendPasswordReset,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};