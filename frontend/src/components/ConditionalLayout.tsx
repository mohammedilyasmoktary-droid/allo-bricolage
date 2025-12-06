import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import DashboardLayout from './DashboardLayout';

interface ConditionalLayoutProps {
  children: ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  // Use DashboardLayout if user is logged in, otherwise use regular Layout
  if (user) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  return <Layout>{children}</Layout>;
};

export default ConditionalLayout;

