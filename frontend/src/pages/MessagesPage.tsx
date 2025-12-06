import React from 'react';
import { Box, Typography, Container, Card, CardContent } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import { useNavigate } from 'react-router-dom';
import MessageIcon from '@mui/icons-material/Message';

const MessagesPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafbfc' }}>
      <DashboardSidebar onLogout={handleLogout} />
      <Box sx={{ flex: 1, ml: '280px', p: 4 }}>
        <Container maxWidth="lg">
          <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e8eaed' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <MessageIcon sx={{ fontSize: 64, color: '#032B5A', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
                Messages
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Cette fonctionnalité sera bientôt disponible
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default MessagesPage;

