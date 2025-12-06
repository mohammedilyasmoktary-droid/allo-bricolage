import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import MessageIcon from '@mui/icons-material/Message';

interface HomePageMiniDashboardProps {
  onLogout: () => void;
}

const HomePageMiniDashboard: React.FC<HomePageMiniDashboardProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid #e8eaed',
        bgcolor: 'white',
        overflow: 'hidden',
        position: 'sticky',
        top: 100,
        height: 'fit-content',
      }}
    >
      {/* Profile Section */}
      <Box
        sx={{
          bgcolor: '#032B5A',
          p: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #032B5A 0%, #021d3f 100%)',
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: '#F4C542',
            color: '#032B5A',
            fontSize: '2rem',
            fontWeight: 700,
            border: '4px solid white',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: 'white',
            mb: 0.5,
            fontSize: '1.1rem',
          }}
        >
          {user.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.8)',
            textTransform: 'capitalize',
            fontSize: '0.85rem',
          }}
        >
          {user.role === 'CLIENT' ? 'Client' : user.role === 'TECHNICIAN' ? 'Technicien' : 'Administrateur'}
        </Typography>
      </Box>

      <CardContent sx={{ p: 0 }}>
        <List sx={{ py: 1 }}>
          <ListItem
            button
            onClick={() => navigate('/dashboard/client')}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PersonIcon sx={{ color: '#032B5A' }} />
            </ListItemIcon>
            <ListItemText
              primary="Mon Profil"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#032B5A',
              }}
            />
          </ListItem>

          <ListItem
            button
            onClick={() => navigate('/client/bookings')}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <CalendarTodayIcon sx={{ color: '#032B5A' }} />
            </ListItemIcon>
            <ListItemText
              primary="Mes Réservations"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#032B5A',
              }}
            />
          </ListItem>

          <ListItem
            button
            onClick={() => navigate('/client/bookings')}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <MessageIcon sx={{ color: '#032B5A' }} />
            </ListItemIcon>
            <ListItemText
              primary="Messages"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#032B5A',
              }}
            />
          </ListItem>

          <ListItem
            button
            onClick={() => navigate('/client/bookings')}
            sx={{
              py: 1.5,
              px: 2,
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <NotificationsIcon sx={{ color: '#032B5A' }} />
            </ListItemIcon>
            <ListItemText
              primary="Notifications"
              primaryTypographyProps={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#032B5A',
              }}
            />
          </ListItem>
        </List>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            sx={{
              borderColor: '#dc3545',
              color: '#dc3545',
              textTransform: 'none',
              fontWeight: 600,
              py: 1.2,
              borderRadius: 2,
              '&:hover': {
                borderColor: '#c82333',
                bgcolor: '#fff5f5',
              },
            }}
          >
            Déconnexion
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HomePageMiniDashboard;

