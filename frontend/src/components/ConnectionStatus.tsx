import React, { useState, useEffect } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { connectionManager, ConnectionStatus } from '../utils/connectionManager';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

interface ConnectionStatusProps {
  showLabel?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({
  showLabel = false,
  position = 'top-right',
}) => {
  const [status, setStatus] = useState<ConnectionStatus>(connectionManager.getStatus());

  useEffect(() => {
    const unsubscribe = connectionManager.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!status.isConnected && !status.isChecking) {
    return null; // Don't show if disconnected and not checking
  }

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      m: 1,
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: 0, right: 0 };
      case 'top-left':
        return { ...baseStyles, top: 0, left: 0 };
      case 'bottom-right':
        return { ...baseStyles, bottom: 0, right: 0 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 0, left: 0 };
      default:
        return { ...baseStyles, top: 0, right: 0 };
    }
  };

  const getStatusInfo = () => {
    if (status.isChecking) {
      return {
        icon: <HourglassEmptyIcon sx={{ fontSize: 16 }} />,
        label: 'Vérification de la connexion...',
        color: '#ff9800',
        bgcolor: '#fff3e0',
      };
    }

    if (status.isConnected) {
      return {
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        label: 'Connecté au serveur',
        color: '#4caf50',
        bgcolor: '#e8f5e9',
      };
    }

    return {
      icon: <ErrorIcon sx={{ fontSize: 16 }} />,
      label: 'Déconnecté du serveur',
      color: '#f44336',
      bgcolor: '#ffebee',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Box sx={getPositionStyles()}>
      <Tooltip title={statusInfo.label} arrow>
        <Chip
          icon={statusInfo.icon}
          label={showLabel ? statusInfo.label : undefined}
          size="small"
          sx={{
            bgcolor: statusInfo.bgcolor,
            color: statusInfo.color,
            fontWeight: 600,
            fontSize: '0.75rem',
            border: `1px solid ${statusInfo.color}`,
            '& .MuiChip-icon': {
              color: statusInfo.color,
            },
            animation: status.isChecking ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': {
                opacity: 1,
              },
              '50%': {
                opacity: 0.6,
              },
            },
          }}
        />
      </Tooltip>
    </Box>
  );
};

export default ConnectionStatusIndicator;

