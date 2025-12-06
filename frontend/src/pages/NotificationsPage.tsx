import React from 'react';
import { Typography, Container, Card, CardContent } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e8eaed' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: { xs: 48, md: 64 }, color: '#032B5A', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Aucune notification pour le moment
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </DashboardLayout>
  );
};

export default NotificationsPage;

