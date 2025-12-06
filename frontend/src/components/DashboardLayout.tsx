import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardSidebar from './DashboardSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafbfc' }}>
      <DashboardSidebar onLogout={handleLogout} />
      <Box sx={{ flex: 1, ml: '280px', p: 4 }}>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;

