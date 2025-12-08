import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Typography,
  Button,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';

interface DashboardSidebarProps {
  onLogout: () => void;
  onNavigate?: () => void; // Callback to close drawer on mobile after navigation
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onLogout, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close drawer on mobile after navigation
    if (onNavigate) {
      onNavigate();
    }
  };

  const menuItems = [
    {
      label: 'Accueil',
      icon: <HomeIcon />,
      path: user.role === 'CLIENT' ? '/dashboard' : user.role === 'TECHNICIAN' ? '/dashboard/technicien' : '/admin/dashboard',
      roles: ['CLIENT', 'TECHNICIAN', 'ADMIN'],
    },
    {
      label: 'Rechercher un technicien',
      icon: <SearchIcon />,
      path: '/search',
      roles: ['CLIENT'],
    },
    {
      label: user.role === 'CLIENT' ? 'Mes Réservations' : 'Mes Missions',
      icon: user.role === 'CLIENT' ? <CalendarTodayIcon /> : <WorkIcon />,
      path: user.role === 'CLIENT' ? '/client/bookings' : '/technician/jobs',
      roles: ['CLIENT', 'TECHNICIAN'],
    },
    {
      label: 'Messages',
      icon: <MessageIcon />,
      path: '/messages',
      roles: ['CLIENT', 'TECHNICIAN'],
    },
    {
      label: 'Notifications',
      icon: <NotificationsIcon />,
      path: '/notifications',
      roles: ['CLIENT', 'TECHNICIAN', 'ADMIN'],
    },
    {
      label: 'Profil',
      icon: <PersonIcon />,
      path: user.role === 'CLIENT' ? '/client/profile' : user.role === 'TECHNICIAN' ? '/technician/profile' : '/admin/profile',
      roles: ['CLIENT', 'TECHNICIAN', 'ADMIN'],
    },
  ].filter(item => item.roles.includes(user.role));

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: 'white',
        borderRight: '1px solid #e8eaed',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {/* Profile Section */}
      <Box
        sx={{
          p: 3,
          bgcolor: '#032B5A',
          background: 'linear-gradient(135deg, #032B5A 0%, #021d3f 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: '#F4C542',
              color: '#032B5A',
              fontSize: '1.5rem',
              fontWeight: 700,
              border: '3px solid white',
            }}
          >
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: { xs: 1.5, md: 2 } }}>
        <List sx={{ px: { xs: 1, md: 2 } }}>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  py: { xs: 1.25, md: 1.5 },
                  px: { xs: 1.5, md: 2 },
                  bgcolor: isActive(item.path) ? '#F4C542' : 'transparent',
                  color: isActive(item.path) ? '#032B5A' : '#032B5A',
                  '&:hover': {
                    bgcolor: isActive(item.path) ? '#F4C542' : '#f5f5f5',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: { xs: 36, md: 40 },
                    color: isActive(item.path) ? '#032B5A' : '#032B5A',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 700 : 600,
                    fontSize: { xs: '0.875rem', md: '0.95rem' },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      {/* Logout Button */}
      <Box sx={{ p: { xs: 1.5, md: 2 } }}>
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
            py: { xs: 1, md: 1.2 },
            borderRadius: 2,
            fontSize: { xs: '0.875rem', md: '1rem' },
            '&:hover': {
              borderColor: '#c82333',
              bgcolor: '#fff5f5',
            },
          }}
        >
          Déconnexion
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardSidebar;

