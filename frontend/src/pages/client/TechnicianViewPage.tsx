import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  Chip,
  Rating,
  CircularProgress,
  Divider,
  Paper,
} from '@mui/material';
import { techniciansApi, Technician } from '../../api/technicians';
import { useAuth } from '../../contexts/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TechnicianViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTechnician = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await techniciansApi.getById(id);
        setTechnician(data);
      } catch (error) {
        console.error('Failed to load technician:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTechnician();
  }, [id]);

  const handleBookNow = () => {
    if (!user || user.role !== 'CLIENT') {
      navigate('/login', { state: { returnTo: `/technician/view/${id}` } });
      return;
    }
    navigate(`/client/bookings/create?technicianId=${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!technician) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Technicien non trouvé
        </Typography>
        <Button variant="contained" onClick={() => navigate('/client/search')} sx={{ mt: 2 }}>
          Retour à la recherche
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Card sx={{ mb: 4, overflow: 'hidden' }}>
        <Box
          sx={{
            height: 200,
            bgcolor: '#032B5A',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {technician.profilePictureUrl ? (
            <Avatar
              src={technician.profilePictureUrl}
              sx={{
                width: 150,
                height: 150,
                border: '6px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 150,
                height: 150,
                bgcolor: '#F4C542',
                color: '#032B5A',
                fontSize: 64,
                fontWeight: 600,
                border: '6px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {technician.user?.name?.charAt(0).toUpperCase() || 'T'}
            </Avatar>
          )}
        </Box>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#032B5A' }}>
                  {technician.user?.name}
                </Typography>
                {technician.verificationStatus === 'APPROVED' && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Vérifié"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                )}
                {technician.isOnline && (
                  <Chip
                    label="En ligne"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                )}
                {technician.subscriptions && technician.subscriptions[0]?.plan === 'PREMIUM' && (
                  <Chip
                    label="Premium"
                    sx={{
                      bgcolor: '#F4C542',
                      color: '#032B5A',
                      fontWeight: 600,
                    }}
                    size="small"
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Rating value={technician.averageRating} readOnly precision={0.5} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#032B5A' }}>
                  {technician.averageRating.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({technician.yearsOfExperience} ans d'expérience)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  icon={<LocationOnIcon />}
                  label={technician.user?.city}
                  size="small"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
                <Chip
                  icon={<WorkIcon />}
                  label={`${technician.yearsOfExperience} ans d'expérience`}
                  size="small"
                  sx={{ bgcolor: '#f5f5f5' }}
                />
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleBookNow}
              sx={{
                bgcolor: '#032B5A',
                '&:hover': { bgcolor: '#021d3f' },
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
              }}
            >
              Réserver maintenant
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Skills Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
                Compétences
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {technician.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    sx={{
                      bgcolor: '#F4C542',
                      color: '#032B5A',
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Bio Section */}
          {technician.bio && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
                  À propos
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {technician.bio}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Pricing Section */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
                Tarifs
              </Typography>
              <Grid container spacing={2}>
                {technician.hourlyRate && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Tarif horaire
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#F4C542' }}>
                        {technician.hourlyRate} MAD/h
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {technician.basePrice && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Prix de base
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#F4C542' }}>
                        {technician.basePrice} MAD
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {!technician.hourlyRate && !technician.basePrice && (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary">
                      Tarifs sur devis
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A', mb: 3 }}>
                Contact
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LocationOnIcon sx={{ color: '#032B5A' }} />
                  <Typography variant="body2" color="text.secondary">
                    {technician.user?.city}
                  </Typography>
                </Box>
                {technician.user?.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PhoneIcon sx={{ color: '#032B5A' }} />
                    <Typography variant="body2" color="text.secondary">
                      {technician.user.phone}
                    </Typography>
                  </Box>
                )}
                {technician.user?.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ color: '#032B5A' }} />
                    <Typography variant="body2" color="text.secondary">
                      {technician.user.email}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleBookNow}
                sx={{
                  bgcolor: '#032B5A',
                  '&:hover': { bgcolor: '#021d3f' },
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Réserver ce technicien
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TechnicianViewPage;





