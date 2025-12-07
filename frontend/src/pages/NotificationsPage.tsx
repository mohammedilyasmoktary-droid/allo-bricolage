import React, { useEffect } from 'react';
import {
  Typography,
  Container,
  Card,
  CardContent,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import DashboardLayout from '../components/DashboardLayout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PaymentIcon from '@mui/icons-material/Payment';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    // Refresh notifications when page loads
    if (user) {
      // Refresh is handled by NotificationContext
    }
  }, [user]);

  if (!user) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_ACCEPTED':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'BOOKING_ON_THE_WAY':
        return <DirectionsCarIcon sx={{ color: '#2196f3' }} />;
      case 'BOOKING_IN_PROGRESS':
        return <CheckCircleIcon sx={{ color: '#2196f3' }} />;
      case 'BOOKING_COMPLETED':
      case 'PAYMENT_CONFIRMED':
        return <PaymentIcon sx={{ color: '#4caf50' }} />;
      case 'BOOKING_DECLINED':
      case 'BOOKING_CANCELLED':
        return <CloseIcon sx={{ color: '#f44336' }} />;
      default:
        return <NotificationsIcon sx={{ color: '#032B5A' }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'BOOKING_ACCEPTED':
      case 'BOOKING_COMPLETED':
      case 'PAYMENT_CONFIRMED':
        return '#4caf50';
      case 'BOOKING_ON_THE_WAY':
      case 'BOOKING_IN_PROGRESS':
        return '#2196f3';
      case 'BOOKING_DECLINED':
      case 'BOOKING_CANCELLED':
        return '#f44336';
      default:
        return '#032B5A';
    }
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<DoneAllIcon />}
                onClick={markAllAsRead}
                sx={{
                  borderColor: '#032B5A',
                  color: '#032B5A',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#021d3f',
                    bgcolor: 'rgba(3, 43, 90, 0.05)',
                  },
                }}
              >
                Tout marquer comme lu
              </Button>
            )}
          </Box>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`}
              sx={{
                bgcolor: '#F4C542',
                color: '#032B5A',
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
            />
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#032B5A' }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e8eaed' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: { xs: 48, md: 64 }, color: '#032B5A', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
                Aucune notification
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Vous n'avez aucune notification pour le moment
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e8eaed', overflow: 'hidden' }}>
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.isRead ? 'white' : 'rgba(244, 197, 66, 0.08)',
                      borderLeft: notification.isRead ? 'none' : '4px solid #F4C542',
                      py: 2.5,
                      px: 3,
                      '&:hover': {
                        bgcolor: notification.isRead ? 'rgba(0, 0, 0, 0.02)' : 'rgba(244, 197, 66, 0.12)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: notification.isRead ? 600 : 700,
                              color: '#032B5A',
                              fontSize: '1rem',
                            }}
                          >
                            {notification.message}
                          </Typography>
                          {!notification.isRead && (
                            <Chip
                              label="Nouveau"
                              size="small"
                              sx={{
                                bgcolor: '#F4C542',
                                color: '#032B5A',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.85rem',
                            mt: 0.5,
                            display: 'block',
                          }}
                        >
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </Typography>
                      }
                    />
                    {!notification.isRead && (
                      <IconButton
                        edge="end"
                        onClick={() => markAsRead(notification.id)}
                        sx={{
                          color: '#032B5A',
                          '&:hover': {
                            bgcolor: 'rgba(3, 43, 90, 0.08)',
                          },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    )}
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Card>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default NotificationsPage;
