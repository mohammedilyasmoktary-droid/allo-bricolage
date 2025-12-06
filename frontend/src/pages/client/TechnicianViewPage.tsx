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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Container,
} from '@mui/material';
import { techniciansApi, Technician } from '../../api/technicians';
import { adminApi } from '../../api/admin';
import { useAuth } from '../../contexts/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';

const TechnicianViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

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

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    setDeleting(true);
    setError(null);
    try {
      await adminApi.deleteTechnician(id);
      setDeleteDialogOpen(false);
      navigate('/admin/technicians', { 
        state: { message: 'Technicien supprimé avec succès' } 
      });
    } catch (err: any) {
      console.error('Failed to delete technician:', err);
      setError(err.response?.data?.error || 'Erreur lors de la suppression du technicien');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setError(null);
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
    <Container maxWidth="xl">
      {/* Header Section */}
      <Card
        sx={{
          mb: 4,
          overflow: 'hidden',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid #e8eaed',
          bgcolor: 'white',
        }}
      >
        <Box
          sx={{
            height: 200,
            background: 'linear-gradient(135deg, #032B5A 0%, #021d3f 100%)',
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
        <CardContent sx={{ p: 4, bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A', fontSize: { xs: '1.75rem', md: '2rem' } }}>
                  {technician.user?.name}
                </Typography>
                {technician.verificationStatus === 'APPROVED' && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Vérifié"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                  />
                )}
                {technician.isOnline && (
                  <Chip
                    label="En ligne"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                  />
                )}
                {technician.subscriptions && technician.subscriptions[0]?.plan === 'PREMIUM' && (
                  <Chip
                    label="Premium"
                    sx={{
                      bgcolor: '#F4C542',
                      color: '#032B5A',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                    }}
                    size="small"
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Rating value={technician.averageRating} readOnly precision={0.5} size="large" />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
                  {technician.averageRating.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
                  ({technician.yearsOfExperience} ans d'expérience)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Chip
                  icon={<LocationOnIcon />}
                  label={technician.user?.city}
                  size="small"
                  sx={{ bgcolor: '#f8f9fa', fontWeight: 500, border: '1px solid #e8eaed' }}
                />
                <Chip
                  icon={<WorkIcon />}
                  label={`${technician.yearsOfExperience} ans d'expérience`}
                  size="small"
                  sx={{ bgcolor: '#f8f9fa', fontWeight: 500, border: '1px solid #e8eaed' }}
                />
              </Box>
            </Box>
            {!isAdmin && (
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
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(3, 43, 90, 0.3)',
                }}
              >
                Réserver maintenant
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                }}
              >
                Supprimer le technicien
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Skills Section */}
          <Card
            sx={{
              mb: 3,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid #e8eaed',
              bgcolor: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#032B5A', mb: 2.5, fontSize: '1.25rem' }}>
                Compétences
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {technician.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    sx={{
                      bgcolor: '#F4C542',
                      color: '#032B5A',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      height: 32,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Bio Section */}
          {technician.bio && (
            <Card
            sx={{
              mb: 3,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid #e8eaed',
              bgcolor: 'white',
            }}
          >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#032B5A', mb: 2.5, fontSize: '1.25rem' }}>
                  À propos
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: '1rem' }}>
                  {technician.bio}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Pricing Section */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#032B5A', mb: 2.5, fontSize: '1.25rem' }}>
                Tarifs
              </Typography>
              <Grid container spacing={2.5}>
                {technician.hourlyRate && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2.5, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e8eaed' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500, mb: 1 }}>
                        Tarif horaire
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#F4C542' }}>
                        {technician.hourlyRate} MAD/h
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {technician.basePrice && (
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2.5, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e8eaed' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500, mb: 1 }}>
                        Prix de base
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#F4C542' }}>
                        {technician.basePrice} MAD
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {!technician.hourlyRate && !technician.basePrice && (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
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
          <Card
            sx={{
              position: 'sticky',
              top: 20,
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid #e8eaed',
              bgcolor: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#032B5A', mb: 3, fontSize: '1.25rem' }}>
                Contact
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <LocationOnIcon sx={{ color: '#032B5A', fontSize: 24 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {technician.user?.city}
                  </Typography>
                </Box>
                {technician.user?.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                    <PhoneIcon sx={{ color: '#032B5A', fontSize: 24 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {technician.user.phone}
                    </Typography>
                  </Box>
                )}
                {technician.user?.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <EmailIcon sx={{ color: '#032B5A', fontSize: 24 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {technician.user.email}
                    </Typography>
                  </Box>
                )}
              </Box>

              {!isAdmin && (
                <>
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
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(3, 43, 90, 0.3)',
                    }}
                  >
                    Réserver ce technicien
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#d32f2f' }}>
          <WarningIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Supprimer le technicien
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <DialogContentText sx={{ fontSize: '1rem', lineHeight: 1.7 }}>
            Êtes-vous sûr de vouloir supprimer le technicien <strong>{technician.user?.name}</strong> ?
            <br />
            <br />
            Cette action est <strong>irréversible</strong> et supprimera :
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>Le profil du technicien</li>
              <li>Le compte utilisateur associé</li>
              <li>Toutes les réservations liées</li>
              <li>Tous les avis et documents</li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#032B5A',
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            variant="contained"
            color="error"
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {deleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TechnicianViewPage;





