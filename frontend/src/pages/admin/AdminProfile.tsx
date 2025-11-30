import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  Avatar,
  Divider,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi } from '../../api/users';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { MOROCCAN_CITIES } from '../../constants/cities';

const AdminProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        city: user.city || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);

    try {
      await usersApi.updateProfile(formData);
      setMessage('Profil mis à jour avec succès');
      setSuccess(true);
      await refreshUser();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4, color: '#032B5A' }}>
        Mon profil administrateur
      </Typography>

      {/* User Info Card */}
      <Card sx={{ mb: 4, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#032B5A', fontSize: 32 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AdminPanelSettingsIcon sx={{ color: '#F4C542' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#032B5A' }}>
                  {user?.name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {user?.phone}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {user?.city}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Rôle
              </Typography>
              <Typography variant="h6" sx={{ color: '#F4C542', fontWeight: 600 }}>
                ADMINISTRATEUR
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Profile Edit Form */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent sx={{ p: 4 }}>
          {message && (
            <Alert 
              severity={success ? 'success' : 'error'} 
              sx={{ mb: 3 }}
              onClose={() => {
                setMessage('');
                setSuccess(false);
              }}
            >
              {message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A', mb: 3 }}>
              Informations personnelles
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom complet"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Ville</InputLabel>
                  <Select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    label="Ville"
                    startAdornment={<LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                  >
                    <MenuItem value="">Sélectionner une ville</MenuItem>
                    {MOROCCAN_CITIES.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={user?.email || ''}
                  disabled
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  helperText="L'email ne peut pas être modifié"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  if (user) {
                    setFormData({
                      name: user.name || '',
                      phone: user.phone || '',
                      city: user.city || '',
                    });
                  }
                }}
                sx={{ textTransform: 'none' }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ 
                  bgcolor: '#032B5A',
                  '&:hover': { bgcolor: '#021d3f' },
                  textTransform: 'none',
                  minWidth: 150,
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Admin Features Info */}
      <Card sx={{ mt: 4, bgcolor: '#f8f9fa', boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
            Fonctionnalités administrateur
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ✓ Vérification des techniciens
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ✓ Gestion des réservations
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ✓ Suivi des paiements
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  ✓ Statistiques de la plateforme
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminProfile;






