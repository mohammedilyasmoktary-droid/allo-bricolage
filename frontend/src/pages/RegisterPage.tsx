import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MOROCCAN_CITIES } from '../constants/cities';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BuildIcon from '@mui/icons-material/Build';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  
  // Get URL parameters
  const roleParam = searchParams.get('role') as 'CLIENT' | 'TECHNICIAN' | null;
  const technicianIdParam = searchParams.get('technicianId');
  const categoryIdParam = searchParams.get('categoryId');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: '',
    role: (roleParam || 'CLIENT') as 'CLIENT' | 'TECHNICIAN',
  });
  const [nationalIdCard, setNationalIdCard] = useState<File | null>(null);
  const [nationalIdPreview, setNationalIdPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNationalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError('Le fichier doit être une image ou un PDF');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 5MB');
        return;
      }
      setNationalIdCard(file);
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNationalIdPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setNationalIdPreview(null);
      }
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate national ID card for technicians
    if (formData.role === 'TECHNICIAN' && !nationalIdCard) {
      setError('La carte nationale est requise pour les techniciens');
      return;
    }

    setLoading(true);

    try {
      // If technician with national ID card, send FormData
      if (formData.role === 'TECHNICIAN' && nationalIdCard) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('city', formData.city);
        formDataToSend.append('role', formData.role);
        formDataToSend.append('nationalIdCard', nationalIdCard);
        
        await register(formDataToSend);
      } else {
        // Regular registration without file
        await register(formData);
      }
      
      // After successful registration, redirect based on URL parameters
      if (technicianIdParam && categoryIdParam && formData.role === 'CLIENT') {
        // Redirect to booking page with technician and category
        navigate(`/booking?technicianId=${technicianIdParam}&categoryId=${categoryIdParam}`);
      } else {
        // Default redirect to home
        navigate('/');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      // Show more detailed error message
      const errorMessage = err.message || err.response?.data?.error || err.response?.data?.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        py: 4,
        px: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 520,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          borderRadius: 4,
          border: '1px solid #e0e0e0',
        }}
      >
        <CardContent sx={{ p: 5 }}>
          {/* Header with Allo Bricolage Branding */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: '#F4C542',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BuildIcon sx={{ fontSize: 32, color: '#032B5A' }} />
              </Box>
              <Box sx={{ textAlign: 'left' }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#032B5A',
                    lineHeight: 1.2,
                    mb: 0.25,
                  }}
                >
                  Allo Bricolage
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#666',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                  }}
                >
                  Plateforme de maintenance
                </Typography>
              </Box>
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A', mb: 1 }}>
              Inscription
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {technicianIdParam && categoryIdParam 
                ? 'Créez votre compte pour continuer vers la réservation'
                : 'Créez votre compte pour commencer'}
            </Typography>
          </Box>

          {technicianIdParam && categoryIdParam && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Vous allez être redirigé vers la page de réservation après votre inscription.
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: '#f44336',
                },
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selection */}
            {!roleParam && (
              <>
                <FormLabel
                  component="legend"
                  sx={{
                    mb: 1.5,
                    fontWeight: 600,
                    color: '#032B5A',
                    fontSize: '0.95rem',
                  }}
                >
                  Je suis
                </FormLabel>
                <RadioGroup
                  row
                  value={formData.role}
                  onChange={(e) => {
                    const newRole = e.target.value as 'CLIENT' | 'TECHNICIAN';
                    setFormData({ ...formData, role: newRole });
                    // Clear national ID card if switching to client
                    if (newRole === 'CLIENT') {
                      setNationalIdCard(null);
                      setNationalIdPreview(null);
                    }
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiFormControlLabel-root': {
                      flex: 1,
                      mx: 0,
                      '& .MuiRadio-root': {
                        color: '#032B5A',
                        '&.Mui-checked': {
                          color: '#F4C542',
                        },
                      },
                    },
                  }}
                >
              <FormControlLabel
                value="CLIENT"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountCircleIcon sx={{ fontSize: 20, color: formData.role === 'CLIENT' ? '#F4C542' : '#666' }} />
                    <Typography sx={{ fontWeight: formData.role === 'CLIENT' ? 600 : 400 }}>
                      Client
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="TECHNICIAN"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BuildIcon sx={{ fontSize: 20, color: formData.role === 'TECHNICIAN' ? '#F4C542' : '#666' }} />
                    <Typography sx={{ fontWeight: formData.role === 'TECHNICIAN' ? 600 : 400 }}>
                      Technicien
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>

            <Divider sx={{ mb: 3, borderColor: '#e0e0e0' }} />

            {/* Form Fields */}
            <TextField
              fullWidth
              label="Nom complet"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#F4C542' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#F4C542',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#F4C542',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#F4C542',
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#F4C542' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#F4C542',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#F4C542',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#F4C542',
                },
              }}
            />
            <TextField
              fullWidth
              label="Téléphone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: '#F4C542' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#F4C542',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#F4C542',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#F4C542',
                },
              }}
            />
            <FormControl
              fullWidth
              required
              disabled={loading}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#F4C542',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#F4C542',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#F4C542',
                },
              }}
            >
              <InputLabel>Ville</InputLabel>
              <Select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                label="Ville"
                startAdornment={
                  <InputAdornment position="start">
                    <LocationOnIcon sx={{ color: '#F4C542', ml: 1 }} />
                  </InputAdornment>
                }
              >
                <MenuItem value="">Sélectionner une ville</MenuItem>
                {MOROCCAN_CITIES.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              helperText="Minimum 6 caractères"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#F4C542' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                      sx={{ color: '#032B5A' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: formData.role === 'TECHNICIAN' ? 2.5 : 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#F4C542',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#F4C542',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#F4C542',
                },
              }}
            />

            {/* National ID Card Upload - Only for Technicians */}
            {formData.role === 'TECHNICIAN' && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#032B5A',
                    mb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <BadgeIcon sx={{ fontSize: 20, color: '#F4C542' }} />
                  Carte nationale d'identité *
                </Typography>
                <input
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id="national-id-card-upload"
                  type="file"
                  onChange={handleNationalIdChange}
                  disabled={loading}
                />
                <label htmlFor="national-id-card-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    disabled={loading}
                    sx={{
                      borderColor: nationalIdCard ? '#4caf50' : '#e0e0e0',
                      color: nationalIdCard ? '#4caf50' : '#666',
                      borderRadius: 2,
                      py: 1.5,
                      mb: 2,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#F4C542',
                        bgcolor: '#fffbf0',
                      },
                    }}
                  >
                    {nationalIdCard ? nationalIdCard.name : 'Télécharger la carte nationale'}
                  </Button>
                </label>
                {nationalIdPreview && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      border: '2px dashed #e0e0e0',
                      borderRadius: 2,
                      textAlign: 'center',
                      bgcolor: '#f8f9fa',
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 40, color: '#032B5A', mb: 1 }} />
                    <Box
                      component="img"
                      src={nationalIdPreview}
                      alt="Aperçu carte nationale"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        mt: 1,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Aperçu de la carte nationale
                    </Typography>
                  </Box>
                )}
                {nationalIdCard && !nationalIdPreview && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      border: '2px dashed #e0e0e0',
                      borderRadius: 2,
                      textAlign: 'center',
                      bgcolor: '#f8f9fa',
                    }}
                  >
                    <BadgeIcon sx={{ fontSize: 40, color: '#032B5A', mb: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                      {nationalIdCard.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fichier PDF sélectionné
                    </Typography>
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Formats acceptés: JPG, PNG, PDF (max 5MB)
                </Typography>
              </Box>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
              sx={{
                bgcolor: '#032B5A',
                color: 'white',
                '&:hover': {
                  bgcolor: '#021d3f',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e',
                },
                textTransform: 'none',
                borderRadius: 2,
                py: 1.5,
                mb: 3,
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(3, 43, 90, 0.3)',
              }}
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </Button>
          </form>

          <Box
            sx={{
              textAlign: 'center',
              pt: 2,
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Déjà un compte?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/login')}
                disabled={loading}
                sx={{
                  textDecoration: 'none',
                  color: '#032B5A',
                  fontWeight: 700,
                  '&:hover': {
                    color: '#F4C542',
                    textDecoration: 'underline',
                  },
                }}
              >
                Se connecter
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;

