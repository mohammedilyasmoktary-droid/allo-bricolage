import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Alert,
  Grid,
  CircularProgress,
  Divider,
  Rating,
  Avatar,
  Paper,
  InputAdornment,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { techniciansApi } from '../../api/technicians';
import { categoriesApi, Category } from '../../api/categories';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import BuildIcon from '@mui/icons-material/Build';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const TechnicianProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    skills: [] as string[],
    yearsOfExperience: 0,
    hourlyRate: '',
    basePrice: '',
    bio: '',
    profilePhoto: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (user?.technicianProfile) {
      setFormData({
        skills: user.technicianProfile.skills || [],
        yearsOfExperience: user.technicianProfile.yearsOfExperience || 0,
        hourlyRate: user.technicianProfile.hourlyRate?.toString() || '',
        basePrice: user.technicianProfile.basePrice?.toString() || '',
        bio: user.technicianProfile.bio || '',
        profilePhoto: null,
      });
      setProfilePicturePreview(user.technicianProfile.profilePictureUrl || null);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('skills', JSON.stringify(formData.skills));
      formDataToSend.append('yearsOfExperience', formData.yearsOfExperience.toString());
      if (formData.hourlyRate) formDataToSend.append('hourlyRate', formData.hourlyRate);
      if (formData.basePrice) formDataToSend.append('basePrice', formData.basePrice);
      if (formData.bio) formDataToSend.append('bio', formData.bio);
      
      if (formData.profilePhoto) {
        formDataToSend.append('profilePicture', formData.profilePhoto);
      }

      await techniciansApi.updateProfile(formDataToSend);
      setMessage('Profil mis à jour avec succès');
      setSuccess(true);
      await refreshUser();
      setFormData({ ...formData, profilePhoto: null });
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
      }, 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = formData.skills.includes(skill)
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];
    setFormData({ ...formData, skills: newSkills });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, profilePhoto: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    if (user?.technicianProfile) {
      setFormData({
        skills: user.technicianProfile.skills || [],
        yearsOfExperience: user.technicianProfile.yearsOfExperience || 0,
        hourlyRate: user.technicianProfile.hourlyRate?.toString() || '',
        basePrice: user.technicianProfile.basePrice?.toString() || '',
        bio: user.technicianProfile.bio || '',
        profilePhoto: null,
      });
      setProfilePicturePreview(user.technicianProfile.profilePictureUrl || null);
    }
    setMessage('');
    setSuccess(false);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, px: { xs: 2, md: 0 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, color: '#032B5A' }}>
          Mon profil technicien
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez vos informations professionnelles et votre visibilité
        </Typography>
      </Box>

      {/* Profile Summary Card */}
      <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <Box sx={{ position: 'relative', height: 180, bgcolor: '#032B5A' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(3, 43, 90, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Avatar
              src={user?.technicianProfile?.profilePictureUrl || undefined}
              sx={{
                width: 140,
                height: 140,
                bgcolor: '#F4C542',
                color: '#032B5A',
                fontSize: 56,
                fontWeight: 700,
                border: '5px solid white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'T'}
            </Avatar>
          </Box>
        </Box>
        <CardContent sx={{ p: 4, pt: 8 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A' }}>
                  {user?.name}
                </Typography>
                {user?.technicianProfile && (
                  <>
                    {user.technicianProfile.verificationStatus === 'APPROVED' && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Vérifié"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {user.technicianProfile.subscriptions && 
                     user.technicianProfile.subscriptions.length > 0 && 
                     user.technicianProfile.subscriptions[0].plan === 'PREMIUM' && (
                      <Chip
                        icon={<StarIcon />}
                        label="Premium"
                        sx={{
                          bgcolor: '#F4C542',
                          color: '#032B5A',
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Technicien Professionnel
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 20, color: '#F4C542' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 20, color: '#F4C542' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {user?.phone}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 20, color: '#F4C542' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {user?.city}
                    </Typography>
                  </Box>
                </Grid>
                {user?.technicianProfile?.averageRating > 0 && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon sx={{ fontSize: 20, color: '#F4C542' }} />
                      <Rating value={user?.technicianProfile?.averageRating || 0} readOnly size="small" />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                        {(user?.technicianProfile?.averageRating || 0).toFixed(1)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
          {user?.technicianProfile?.verificationStatus === 'PENDING' && (
            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
              Votre profil est en attente de vérification par un administrateur. Vous pourrez accepter des réservations une fois approuvé.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Profile Edit Form */}
      <Card sx={{ boxShadow: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {message && (
            <Alert 
              severity={success ? 'success' : 'error'} 
              sx={{ mb: 4, borderRadius: 2 }}
              onClose={() => {
                setMessage('');
                setSuccess(false);
              }}
            >
              {message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#032B5A' }}>
                Informations professionnelles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mettez à jour vos informations pour améliorer votre profil
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Profile Photo Upload Section */}
            <Box sx={{ mb: 5, p: 4, bgcolor: '#f8f9fa', borderRadius: 3, border: '1px solid #e0e0e0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PersonIcon sx={{ color: '#F4C542', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
                  Photo de profil
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={profilePicturePreview || undefined}
                    sx={{
                      width: 140,
                      height: 140,
                      bgcolor: '#F4C542',
                      color: '#032B5A',
                      fontSize: 56,
                      fontWeight: 700,
                      border: '4px solid #032B5A',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'T'}
                  </Avatar>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-photo-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <Box
                    component="label"
                    htmlFor="profile-photo-upload"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: '#032B5A',
                      borderRadius: '50%',
                      p: 1.5,
                      cursor: 'pointer',
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: '#021d3f',
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <CloudUploadIcon
                      sx={{
                        color: '#F4C542',
                        fontSize: 28,
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 280 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', mb: 1 }}>
                    Améliorez votre visibilité
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                    Ajoutez une photo de profil professionnelle pour gagner la confiance des clients et augmenter vos réservations.
                  </Typography>
                  <label htmlFor="profile-photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        textTransform: 'none',
                        borderColor: '#032B5A',
                        color: '#032B5A',
                        '&:hover': {
                          borderColor: '#021d3f',
                          bgcolor: 'rgba(3, 43, 90, 0.05)',
                        },
                        borderRadius: 2,
                        px: 3,
                        py: 1.25,
                        fontWeight: 600,
                      }}
                    >
                      {formData.profilePhoto ? 'Changer la photo' : 'Télécharger une photo'}
                    </Button>
                  </label>
                  {formData.profilePhoto && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                      Fichier sélectionné: {formData.profilePhoto.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {/* Skills Section */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <BuildIcon sx={{ color: '#F4C542', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      Compétences / Services offerts
                    </Typography>
                  </Box>
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: '#f8f9fa',
                      borderRadius: 2,
                      border: formData.skills.length === 0 ? '2px dashed #d32f2f' : '1px solid #e0e0e0',
                    }}
                  >
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {categories.map((category) => (
                        <Chip
                          key={category.id}
                          label={category.name}
                          onClick={() => handleSkillToggle(category.name)}
                          sx={{
                            bgcolor: formData.skills.includes(category.name) ? '#032B5A' : 'white',
                            color: formData.skills.includes(category.name) ? 'white' : '#032B5A',
                            border: formData.skills.includes(category.name) ? 'none' : '2px solid #032B5A',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            px: 1,
                            py: 2.5,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: formData.skills.includes(category.name) ? '#021d3f' : '#F4C542',
                              color: formData.skills.includes(category.name) ? 'white' : '#032B5A',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                            },
                          }}
                        />
                      ))}
                    </Box>
                    {formData.skills.length === 0 && (
                      <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 600 }}>
                        ⚠️ Sélectionnez au moins une compétence
                      </Typography>
                    )}
                    {formData.skills.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        {formData.skills.length} compétence(s) sélectionnée(s)
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </Grid>

              {/* Experience */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Années d'expérience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })
                  }
                  required
                  inputProps={{ min: 0, max: 50 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon sx={{ color: '#F4C542' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Hourly Rate */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tarif horaire (MAD)"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  inputProps={{ min: 0, step: 10 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon sx={{ color: '#F4C542' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Prix par heure de travail"
                />
              </Grid>

              {/* Base Price */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prix de base par intervention (MAD)"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  inputProps={{ min: 0, step: 50 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon sx={{ color: '#F4C542' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Prix minimum pour une intervention"
                />
              </Grid>

              {/* Bio */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Biographie professionnelle"
                  multiline
                  rows={5}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Décrivez votre expérience, vos spécialités, et ce qui vous distingue en tant que technicien professionnel..."
                  helperText="Cette description sera visible par les clients lors de la recherche"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <DescriptionIcon sx={{ color: '#F4C542' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 5 }} />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  borderColor: '#032B5A',
                  color: '#032B5A',
                  '&:hover': {
                    borderColor: '#021d3f',
                    bgcolor: 'rgba(3, 43, 90, 0.05)',
                  },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  py: 1.25,
                  fontWeight: 600,
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loading || formData.skills.length === 0}
                sx={{
                  bgcolor: '#F4C542',
                  color: '#032B5A',
                  '&:hover': {
                    bgcolor: '#e0b038',
                  },
                  '&:disabled': {
                    bgcolor: '#e0e0e0',
                    color: '#9e9e9e',
                  },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  py: 1.25,
                  fontWeight: 700,
                  minWidth: 200,
                  boxShadow: 3,
                }}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TechnicianProfile;
