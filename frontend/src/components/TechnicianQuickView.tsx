import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Rating,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import { Technician } from '../api/technicians';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

interface TechnicianQuickViewProps {
  open: boolean;
  technician: Technician | null;
  onClose: () => void;
  onBook: (technician: Technician) => void;
  isUrgent?: boolean;
  categoryId?: string;
}

const TechnicianQuickView: React.FC<TechnicianQuickViewProps> = ({
  open,
  technician,
  onClose,
  onBook,
  isUrgent,
  categoryId,
}) => {
  if (!technician) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#032B5A',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Profil du technicien
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          <Avatar
            src={technician.profilePictureUrl}
            alt={technician.user?.name}
            sx={{
              width: 120,
              height: 120,
              bgcolor: '#032B5A',
              color: '#F4C542',
              fontSize: 48,
              fontWeight: 600,
              border: '4px solid #F4C542',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {technician.user?.name?.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A' }}>
                {technician.user?.name}
              </Typography>
              {technician.subscriptions && technician.subscriptions.length > 0 && technician.subscriptions[0].plan === 'PREMIUM' && (
                <Chip
                  label="Premium"
                  size="small"
                  sx={{
                    bgcolor: '#F4C542',
                    color: '#032B5A',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Rating value={technician.averageRating} readOnly precision={0.1} size="small" />
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                {technician.averageRating.toFixed(1)}/5
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <LocationOnIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">{technician.user?.city}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: technician.isOnline ? '#4caf50' : '#9e9e9e' }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: technician.isOnline ? '#4caf50' : '#9e9e9e',
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {technician.isOnline ? 'En ligne' : 'Hors ligne'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WorkIcon sx={{ color: '#F4C542', fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                {technician.yearsOfExperience} ans d'expérience
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AttachMoneyIcon sx={{ color: '#F4C542', fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                {technician.hourlyRate ? `${technician.hourlyRate} MAD/h` : technician.basePrice ? `${technician.basePrice} MAD` : 'Sur devis'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {technician.bio && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {technician.bio}
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
            Compétences:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {technician.skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  bgcolor: '#f5f5f5',
                  color: '#032B5A',
                  fontWeight: 500,
                  border: '1px solid #e0e0e0',
                }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Technicien vérifié et approuvé
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#032B5A' }}>
          Fermer
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            onBook(technician);
            onClose();
          }}
          sx={{
            bgcolor: '#F4C542',
            color: '#032B5A',
            '&:hover': { bgcolor: '#e0b038' },
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
          }}
        >
          Réserver maintenant
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TechnicianQuickView;




