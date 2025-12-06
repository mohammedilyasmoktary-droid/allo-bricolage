import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi } from '../../api/users';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { MOROCCAN_CITIES } from '../../constants/cities';

const ClientProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(user?.profilePictureUrl || null);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
      });
      setProfilePicturePreview(user.profilePictureUrl || null);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const updatedUser = await usersApi.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        profilePicture: profilePicture || undefined,
      });
      
      await refreshUser();
      setIsEditing(false);
      setProfilePicture(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.error || err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
    });
    setProfilePicture(null);
    setProfilePicturePreview(user?.profilePictureUrl || null);
    setIsEditing(false);
    setError('');
    setSuccess(false);
  };

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box
        sx={{
          mb: 5,
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #032B5A 0%, #021d3f 100%)',
          boxShadow: '0 8px 32px rgba(3, 43, 90, 0.15)',
          color: 'white',
        }}
      >
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1.5, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
          Informations du compte
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
          Gérez vos informations personnelles et préférences
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setSuccess(false)}>
          Profil mis à jour avec succès!
        </Alert>
      )}

      <Card
        sx={{
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid #e8eaed',
          bgcolor: 'white',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Avatar Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profilePicturePreview || undefined}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: '#F4C542',
                  color: '#032B5A',
                  fontSize: 40,
                  fontWeight: 700,
                  border: '4px solid #032B5A',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              {isEditing && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: '#032B5A',
                    borderRadius: '50%',
                    p: 1,
                    cursor: 'pointer',
                    border: '2px solid white',
                    '&:hover': {
                      bgcolor: '#021d3f',
                    },
                  }}
                >
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-picture-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="profile-picture-upload">
                    <CameraAltIcon
                      sx={{
                        color: '#F4C542',
                        fontSize: 24,
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                </Box>
              )}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A', mb: 0.5 }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compte Client
              </Typography>
            </Box>
            {!isEditing && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                sx={{
                  borderColor: '#032B5A',
                  color: '#032B5A',
                  '&:hover': { borderColor: '#021d3f', bgcolor: 'rgba(3, 43, 90, 0.05)' },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 600,
                }}
              >
                Modifier
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Form Fields */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Nom complet
                </Typography>
              </Box>
              <TextField
                fullWidth
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <EmailIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Email
                </Typography>
              </Box>
              <TextField
                fullWidth
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PhoneIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Téléphone
                </Typography>
              </Box>
              <TextField
                fullWidth
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOnIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Ville
                </Typography>
              </Box>
              <FormControl fullWidth disabled={!isEditing}>
                <InputLabel>Sélectionner une ville</InputLabel>
                <Select
                  name="city"
                  value={formData.city}
                  onChange={(e) => handleChange({ target: { name: 'city', value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
                  label="Sélectionner une ville"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {MOROCCAN_CITIES.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          {isEditing && (
            <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  borderColor: '#032B5A',
                  color: '#032B5A',
                  '&:hover': { borderColor: '#021d3f', bgcolor: 'rgba(3, 43, 90, 0.05)' },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 600,
                }}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={loading}
                sx={{
                  bgcolor: '#F4C542',
                  color: '#032B5A',
                  '&:hover': { bgcolor: '#e0b038' },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 600,
                }}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ClientProfile;

