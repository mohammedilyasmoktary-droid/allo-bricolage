import React, { useEffect, useState } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PaymentIcon from '@mui/icons-material/Payment';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationPopup: React.FC = () => {
  const navigate = useNavigate();
  const { getLatestUnread, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [previousNotificationId, setPreviousNotificationId] = useState<string | null>(null);

  useEffect(() => {
    const checkForNewNotifications = () => {
      const latest = getLatestUnread();
      
      // Only show popup if there's a new unread notification we haven't shown yet
      if (latest && latest.id !== previousNotificationId && !open) {
        setCurrentNotification(latest);
        setOpen(true);
        setPreviousNotificationId(latest.id);
      }
    };

    // Check immediately
    checkForNewNotifications();

    // Check every 5 seconds for new notifications
    const interval = setInterval(checkForNewNotifications, 5000);

    return () => clearInterval(interval);
  }, [getLatestUnread, previousNotificationId, open]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    // Reset previous notification ID after a delay to allow showing the same notification again if needed
    setTimeout(() => {
      if (currentNotification) {
        setPreviousNotificationId(null);
      }
    }, 1000);
  };

  const handleViewNotifications = () => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
    }
    setOpen(false);
    navigate('/notifications');
  };

  const handleDismiss = () => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
    }
    setOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_ACCEPTED':
        return <CheckCircleIcon sx={{ fontSize: 24 }} />;
      case 'BOOKING_ON_THE_WAY':
        return <DirectionsCarIcon sx={{ fontSize: 24 }} />;
      case 'BOOKING_IN_PROGRESS':
        return <CheckCircleIcon sx={{ fontSize: 24 }} />;
      case 'BOOKING_COMPLETED':
      case 'PAYMENT_CONFIRMED':
        return <PaymentIcon sx={{ fontSize: 24 }} />;
      default:
        return <NotificationsIcon sx={{ fontSize: 24 }} />;
    }
  };

  const getNotificationSeverity = (type: string): 'success' | 'info' | 'warning' => {
    switch (type) {
      case 'BOOKING_ACCEPTED':
      case 'BOOKING_COMPLETED':
      case 'PAYMENT_CONFIRMED':
        return 'success';
      case 'BOOKING_ON_THE_WAY':
      case 'BOOKING_IN_PROGRESS':
        return 'info';
      default:
        return 'info';
    }
  };

  if (!currentNotification) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={8000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        mt: { xs: 8, md: 2 },
        '& .MuiSnackbarContent-root': {
          minWidth: { xs: '90%', sm: 400 },
        },
      }}
    >
      <Alert
        onClose={handleDismiss}
        severity={getNotificationSeverity(currentNotification.type)}
        icon={getNotificationIcon(currentNotification.type)}
        sx={{
          width: '100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: 2,
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              color="inherit"
              size="small"
              onClick={handleViewNotifications}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Voir
            </Button>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleDismiss}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>
          Nouvelle notification
        </AlertTitle>
        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
          {currentNotification.message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default NotificationPopup;

