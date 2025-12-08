import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  CircularProgress,
  Avatar,
  Grid,
  Divider,
  Paper,
  IconButton,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingsApi, CreateBookingData } from '../../api/bookings';
import { techniciansApi, Technician } from '../../api/technicians';
import { categoriesApi, Category } from '../../api/categories';
import { useAuth } from '../../contexts/AuthContext';
import { MOROCCAN_CITIES } from '../../constants/cities';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Rating from '@mui/material/Rating';
import DeleteIcon from '@mui/icons-material/Delete';
import TechnicianAvailabilityCalendar from '../../components/TechnicianAvailabilityCalendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CreateBooking: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const technicianIdParam = searchParams.get('technicianId');
  const categoryIdParam = searchParams.get('categoryId');
  const isUrgentParam = searchParams.get('urgent') === 'true';

  const [formData, setFormData] = useState<CreateBookingData>({
    technicianId: technicianIdParam || '',
    categoryId: categoryIdParam || '',
    description: '',
    city: user?.city || '',
    address: '',
    scheduledDateTime: '',
    photos: [],
  });
  const [showSummary, setShowSummary] = useState(false);
  const [isUrgent, setIsUrgent] = useState(isUrgentParam);

  const [technician, setTechnician] = useState<Technician | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await categoriesApi.getAll();
        setCategories(cats);

        if (technicianIdParam) {
          const tech = await techniciansApi.getById(technicianIdParam);
          setTechnician(tech);
          setFormData((prev) => ({ ...prev, technicianId: tech.id }));
        }
        
        if (categoryIdParam) {
          setFormData((prev) => ({ ...prev, categoryId: categoryIdParam }));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, [technicianIdParam, categoryIdParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setSelectedFiles(files);
      setFormData({ ...formData, photos: files });
      
      // Create preview URLs
      const urls = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const removePhoto = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
    setFormData({ ...formData, photos: newFiles });
    if (newFiles.length > 0) {
      setFieldErrors({ ...fieldErrors, photos: '' });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.technicianId) {
      errors.technicianId = 'Veuillez sélectionner un technicien';
    }
    if (!formData.categoryId) {
      errors.categoryId = 'Veuillez sélectionner une catégorie de service';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'La description doit contenir au moins 10 caractères';
    }
    if (!formData.city) {
      errors.city = 'Veuillez sélectionner une ville';
    }
    if (!formData.address || formData.address.trim().length < 5) {
      errors.address = 'Veuillez entrer une adresse complète (minimum 5 caractères)';
    }
    if (formData.scheduledDateTime) {
      try {
        const scheduledDate = new Date(formData.scheduledDateTime);
        if (isNaN(scheduledDate.getTime())) {
          errors.scheduledDateTime = 'Date et heure invalides';
        } else if (scheduledDate < new Date()) {
          errors.scheduledDateTime = 'La date ne peut pas être dans le passé';
        }
      } catch (error) {
        errors.scheduledDateTime = 'Date et heure invalides';
      }
    }
    if (selectedFiles.length === 0) {
      errors.photos = 'Veuillez ajouter au moins une photo du problème';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // Validate form
    if (!validateForm()) {
      setError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    // Show summary before final submission
    if (!showSummary) {
      setShowSummary(true);
      return;
    }

    // Final submission
    setLoading(true);
    try {
      // Validate required fields before sending
      if (!formData.technicianId) {
        setError('Veuillez sélectionner un technicien');
        setShowSummary(false);
        setLoading(false);
        return;
      }
      if (!formData.categoryId) {
        setError('Veuillez sélectionner une catégorie de service');
        setShowSummary(false);
        setLoading(false);
        return;
      }
      if (!selectedFiles || selectedFiles.length === 0) {
        setError('Veuillez ajouter au moins une photo');
        setShowSummary(false);
        setLoading(false);
        return;
      }
      
      // Prepare booking data with actual File objects from selectedFiles
      const bookingData: CreateBookingData = {
        technicianId: formData.technicianId,
        categoryId: formData.categoryId,
        description: formData.description,
        city: formData.city,
        address: formData.address,
        scheduledDateTime: formData.scheduledDateTime ? (() => {
          const dt = new Date(formData.scheduledDateTime);
          if (isNaN(dt.getTime())) {
            throw new Error('Date et heure invalides');
          }
          return dt.toISOString();
        })() : undefined,
        photos: selectedFiles, // Use selectedFiles which contains the actual File objects
        isUrgent,
      };
      
      console.log('Creating booking with data:', {
        technicianId: bookingData.technicianId,
        categoryId: bookingData.categoryId,
        description: bookingData.description,
        city: bookingData.city,
        address: bookingData.address,
        scheduledDateTime: bookingData.scheduledDateTime,
        photosCount: bookingData.photos?.length || 0,
        isUrgent: bookingData.isUrgent,
      });
      
      const newBooking = await bookingsApi.create(bookingData);
      console.log('Booking created successfully:', newBooking.id);
      navigate(`/client/bookings/recap?bookingId=${newBooking.id}`);
    } catch (err: any) {
      console.error('Booking creation error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const validationErrors = err.response.data.errors.map((e: any) => e.msg || e.message).join(', ');
        setError(`Erreurs de validation: ${validationErrors}`);
      } else {
        const errorMessage = err.response?.data?.error 
          || err.response?.data?.message
          || err.message
          || 'Erreur lors de la création de la réservation. Veuillez vérifier tous les champs et réessayer.';
        setError(errorMessage);
      }
      setShowSummary(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 }, bgcolor: '#fafbfc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            bgcolor: 'white',
            border: '1px solid #e8eaed',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            '&:hover': { 
              bgcolor: '#f8f9fa',
              borderColor: '#F4C542',
              transform: 'translateX(-2px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowBackIcon sx={{ color: '#032B5A' }} />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A', mb: 0.5 }}>
            Créer une réservation
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Remplissez les informations ci-dessous pour finaliser votre demande
          </Typography>
        </Box>
      </Box>

      {/* Technician Card */}
      {technician && (
        <Card
          sx={{
            mb: 5,
            boxShadow: '0 2px 8px rgba(3, 43, 90, 0.08)',
            borderRadius: 4,
            border: '1px solid #e8eaed',
            overflow: 'hidden',
            bgcolor: 'white',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(3, 43, 90, 0.12)',
            },
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Avatar
                src={technician.profilePictureUrl}
                alt={technician.user?.name}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: '#032B5A',
                  color: '#F4C542',
                  fontSize: 40,
                  fontWeight: 700,
                  border: '4px solid #F4C542',
                  boxShadow: '0 4px 16px rgba(244, 197, 66, 0.3)',
                }}
              >
                {technician.user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A', fontSize: '1.5rem' }}>
                    {technician.user?.name}
                  </Typography>
                  {technician.subscriptions && technician.subscriptions.length > 0 && technician.subscriptions[0].plan === 'PREMIUM' && (
                    <Chip
                      label="Premium"
                      size="small"
                      sx={{
                        bgcolor: '#F4C542',
                        color: '#032B5A',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        height: 24,
                        px: 1,
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Rating value={technician.averageRating} readOnly precision={0.1} size="small" sx={{ color: '#F4C542' }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', fontSize: '0.95rem' }}>
                    {technician.averageRating.toFixed(1)}/5
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, color: 'text.secondary' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WorkIcon sx={{ fontSize: 18, color: '#666' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {technician.yearsOfExperience} ans d'expérience
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon sx={{ fontSize: 18, color: '#666' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{technician.user?.city}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {technician.skills.slice(0, 4).map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{
                        bgcolor: '#f8f9fa',
                        color: '#032B5A',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        border: '1px solid #e8eaed',
                        height: 28,
                        '&:hover': {
                          bgcolor: '#F4C542',
                          color: '#032B5A',
                          borderColor: '#F4C542',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Urgent Alert */}
      {isUrgent && (
        <Alert
          severity="warning"
          icon={<FlashOnIcon sx={{ fontSize: 24 }} />}
          sx={{
            mb: 4,
            bgcolor: '#fffbf0',
            border: '2px solid #F4C542',
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(244, 197, 66, 0.15)',
            py: 1.5,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#032B5A', mb: 0.5 }}>
            ⚡ Demande urgente
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
            Un supplément de 100 MAD sera ajouté au prix final. Un technicien sera dépêché dans l'heure suivant la confirmation.
          </Typography>
        </Alert>
      )}

      {/* Form and Calendar Layout */}
      <Grid container spacing={3}>
        {/* Form Card - Left Side */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              boxShadow: '0 2px 8px rgba(3, 43, 90, 0.08)',
              borderRadius: 4,
              border: '1px solid #e8eaed',
              overflow: 'hidden',
              bgcolor: 'white',
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 5 } }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 4, 
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(211, 47, 47, 0.1)',
                  }} 
                  onClose={() => setError('')}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
              {/* Service Category */}
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1.5, fontSize: '0.95rem' }}>
                    Catégorie de service <span style={{ color: '#d32f2f' }}>*</span>
                  </Typography>
                </Box>
                <FormControl fullWidth required error={!!fieldErrors.categoryId}>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => {
                      setFormData({ ...formData, categoryId: e.target.value as string });
                      setFieldErrors({ ...fieldErrors, categoryId: '' });
                    }}
                    displayEmpty
                    sx={{
                      borderRadius: 3,
                      bgcolor: '#fafbfc',
                      border: fieldErrors.categoryId ? '2px solid #d32f2f' : '1px solid #e8eaed',
                      '&:hover': {
                        borderColor: fieldErrors.categoryId ? '#d32f2f' : '#F4C542',
                        bgcolor: 'white',
                      },
                      '&.Mui-focused': {
                        borderColor: fieldErrors.categoryId ? '#d32f2f' : '#F4C542',
                        bgcolor: 'white',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '& .MuiSelect-select': {
                        py: 1.75,
                        px: 2,
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: formData.categoryId ? '#032B5A' : '#9e9e9e',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <MenuItem value="" disabled>
                      <Typography sx={{ color: '#9e9e9e' }}>Sélectionner une catégorie</Typography>
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id} sx={{ py: 1.5 }}>
                        <Typography sx={{ fontWeight: 500, color: '#032B5A' }}>{cat.name}</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.categoryId && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 1, display: 'block', fontWeight: 500 }}>
                      {fieldErrors.categoryId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1.5, fontSize: '0.95rem' }}>
                    Description du problème <span style={{ color: '#d32f2f' }}>*</span>
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="description"
                  value={formData.description}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldErrors({ ...fieldErrors, description: '' });
                  }}
                  multiline
                  rows={6}
                  required
                  error={!!fieldErrors.description}
                  helperText={fieldErrors.description || 'Décrivez en détail le problème à résoudre (minimum 10 caractères)'}
                  placeholder="Ex: Fuite d'eau dans la salle de bain, robinet qui coule en permanence..."
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1.5, mt: 2, alignSelf: 'flex-start' }}>
                        <DescriptionIcon sx={{ color: '#9e9e9e', fontSize: 22 }} />
                      </Box>
                    ),
                  }}
                  sx={{
                    bgcolor: '#fafbfc',
                    borderRadius: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      border: fieldErrors.description ? '2px solid #d32f2f' : '1px solid #e8eaed',
                      '&:hover': {
                        borderColor: fieldErrors.description ? '#d32f2f' : '#F4C542',
                        bgcolor: 'white',
                      },
                      '&.Mui-focused': {
                        borderColor: fieldErrors.description ? '#d32f2f' : '#F4C542',
                        bgcolor: 'white',
                      },
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 2,
                      px: 0,
                      fontSize: '0.95rem',
                      lineHeight: 1.6,
                      color: '#032B5A',
                      '&::placeholder': {
                        color: '#9e9e9e',
                        opacity: 1,
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      mt: 1.5,
                      ml: 0,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                    },
                    transition: 'all 0.2s ease',
                  }}
                />
              </Grid>

              {/* City and Address */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1.5, fontSize: '0.95rem' }}>
                    Ville <span style={{ color: '#d32f2f' }}>*</span>
                  </Typography>
                </Box>
                <FormControl fullWidth required error={!!fieldErrors.city}>
                  <Select
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      setFieldErrors({ ...fieldErrors, city: '' });
                    }}
                    displayEmpty
                    startAdornment={
                      <Box sx={{ ml: 2, mr: 1 }}>
                        <LocationOnIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />
                      </Box>
                    }
                    sx={{
                      borderRadius: 3,
                      bgcolor: '#fafbfc',
                      border: fieldErrors.city ? '2px solid #d32f2f' : '1px solid #e8eaed',
                      '&:hover': {
                        borderColor: fieldErrors.city ? '#d32f2f' : '#F4C542',
                        bgcolor: 'white',
                      },
                      '&.Mui-focused': {
                        borderColor: fieldErrors.city ? '#d32f2f' : '#F4C542',
                        bgcolor: 'white',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '& .MuiSelect-select': {
                        py: 1.75,
                        px: 0,
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: formData.city ? '#032B5A' : '#9e9e9e',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <MenuItem value="" disabled>
                      <Typography sx={{ color: '#9e9e9e' }}>Sélectionner une ville</Typography>
                    </MenuItem>
                    {MOROCCAN_CITIES.map((city) => (
                      <MenuItem key={city} value={city} sx={{ py: 1.5 }}>
                        <Typography sx={{ fontWeight: 500, color: '#032B5A' }}>{city}</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.city && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 1, display: 'block', fontWeight: 500 }}>
                      {fieldErrors.city}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1.5, fontSize: '0.95rem' }}>
                    Adresse complète <span style={{ color: '#d32f2f' }}>*</span>
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="address"
                  value={formData.address}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldErrors({ ...fieldErrors, address: '' });
                  }}
                  required
                  error={!!fieldErrors.address}
                  helperText={fieldErrors.address || 'Numéro, rue, quartier, ville...'}
                  placeholder="Ex: 123 Rue Mohammed V, Quartier Maarif..."
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1.5 }}>
                        <LocationOnIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />
                      </Box>
                    ),
                  }}
                  sx={{
                    bgcolor: '#fafbfc',
                    borderRadius: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      border: fieldErrors.address ? '2px solid #d32f2f' : '1px solid #e8eaed',
                      '&:hover': {
                        borderColor: fieldErrors.address ? '#d32f2f' : '#F4C542',
                        bgcolor: 'white',
                      },
                      '&.Mui-focused': {
                        borderColor: fieldErrors.address ? '#d32f2f' : '#F4C542',
                        bgcolor: 'white',
                      },
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 1.75,
                      px: 0,
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      color: '#032B5A',
                      '&::placeholder': {
                        color: '#9e9e9e',
                        opacity: 1,
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      mt: 1.5,
                      ml: 0,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                    },
                    transition: 'all 0.2s ease',
                  }}
                />
              </Grid>


              {/* Photo Upload */}
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#032B5A', mb: 1.5, fontSize: '0.95rem' }}>
                    Photos du problème <span style={{ color: '#d32f2f' }}>*</span>
                  </Typography>
                </Box>
                <Paper
                  sx={{
                    p: 4,
                    border: fieldErrors.photos ? '2px dashed #d32f2f' : '2px dashed #d1d5db',
                    borderRadius: 4,
                    bgcolor: fieldErrors.photos ? 'rgba(211, 47, 47, 0.02)' : '#fafbfc',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: fieldErrors.photos ? '#d32f2f' : '#F4C542',
                      bgcolor: fieldErrors.photos ? 'rgba(211, 47, 47, 0.04)' : 'white',
                      boxShadow: '0 4px 12px rgba(244, 197, 66, 0.1)',
                    },
                  }}
                >
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="photo-upload"
                    type="file"
                    multiple
                    onChange={(e) => {
                      handleFileChange(e);
                      setFieldErrors({ ...fieldErrors, photos: '' });
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: selectedFiles.length > 0 ? 3 : 0 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        bgcolor: '#F4C542',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(244, 197, 66, 0.2)',
                      }}
                    >
                      <PhotoCameraIcon sx={{ color: '#032B5A', fontSize: 28 }} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#032B5A', mb: 1, fontSize: '1rem' }}>
                        Ajoutez des photos
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', mb: 2.5, lineHeight: 1.6 }}>
                        Ajoutez jusqu'à 5 photos pour aider le technicien à comprendre le problème
                      </Typography>
                      <label htmlFor="photo-upload">
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<PhotoCameraIcon />}
                          sx={{
                            textTransform: 'none',
                            bgcolor: '#032B5A',
                            color: 'white',
                            '&:hover': { 
                              bgcolor: '#021d3f',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(3, 43, 90, 0.2)',
                            },
                            borderRadius: 3,
                            px: 3,
                            py: 1.25,
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {selectedFiles.length > 0 ? 'Modifier les photos' : 'Choisir des photos'} ({selectedFiles.length}/5)
                        </Button>
                      </label>
                    </Box>
                  </Box>

                  {fieldErrors.photos && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                      {fieldErrors.photos}
                    </Alert>
                  )}

                  {previewUrls.length > 0 && (
                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e8eaed' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
                        Photos sélectionnées ({previewUrls.length}/5)
                      </Typography>
                      <Grid container spacing={2.5}>
                        {previewUrls.map((url, index) => (
                          <Grid item xs={6} sm={4} md={2.4} key={index}>
                            <Box
                              sx={{
                                position: 'relative',
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: '2px solid #e8eaed',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  borderColor: '#F4C542',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 12px rgba(244, 197, 66, 0.2)',
                                },
                              }}
                            >
                              <Box
                                component="img"
                                src={url}
                                alt={`Preview ${index + 1}`}
                                sx={{
                                  width: '100%',
                                  height: 140,
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => removePhoto(index)}
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                  '&:hover': { 
                                    bgcolor: 'rgba(211, 47, 47, 0.9)',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Summary Card */}
            {showSummary && (
              <Card
                sx={{
                  mt: 5,
                  mb: 3,
                  bgcolor: '#fafbfc',
                  border: '2px solid #F4C542',
                  borderRadius: 4,
                  boxShadow: '0 4px 16px rgba(244, 197, 66, 0.15)',
                  overflow: 'hidden',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        bgcolor: '#4caf50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)',
                      }}
                    >
                      <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 0.25 }}>
                        Récapitulatif
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                        Vérifiez les informations avant de confirmer
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 4, borderColor: '#e8eaed' }} />
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                        Technicien
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', fontSize: '1rem' }}>
                        {technician?.user?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                        Service
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', fontSize: '1rem' }}>
                        {categories.find(c => c.id === formData.categoryId)?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                        Adresse
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', fontSize: '1rem' }}>
                        {formData.address}, {formData.city}
                      </Typography>
                    </Grid>
                    {formData.scheduledDateTime && (
                      <Grid item xs={12}>
                        <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem' }}>
                          Date et Heure
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', fontSize: '1rem' }}>
                          {(() => {
                            try {
                              const date = new Date(formData.scheduledDateTime);
                              if (isNaN(date.getTime())) {
                                return 'Date invalide';
                              }
                              return format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
                            } catch (error) {
                              return formData.scheduledDateTime;
                            }
                          })()}
                        </Typography>
                      </Grid>
                    )}
                    {isUrgent && (
                      <Grid item xs={12}>
                        <Alert 
                          severity="warning" 
                          sx={{ 
                            borderRadius: 3, 
                            bgcolor: '#fffbf0',
                            border: '1px solid #F4C542',
                            boxShadow: '0 2px 8px rgba(244, 197, 66, 0.1)',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                            ⚡ Demande urgente: +100 MAD
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 5, pt: 4, borderTop: '1px solid #e8eaed', flexWrap: 'wrap' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={showSummary ? <CheckCircleIcon /> : undefined}
                sx={{
                  bgcolor: showSummary ? '#4caf50' : '#F4C542',
                  color: '#032B5A',
                  '&:hover': {
                    bgcolor: showSummary ? '#45a049' : '#e0b038',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(244, 197, 66, 0.3)',
                  },
                  '&:disabled': {
                    bgcolor: '#e0e0e0',
                    color: '#9e9e9e',
                  },
                  textTransform: 'none',
                  minWidth: 220,
                  py: 1.75,
                  px: 4,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(244, 197, 66, 0.25)',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1.5, color: '#032B5A' }} />
                    Création...
                  </>
                ) : showSummary ? (
                  'Confirmer la réservation'
                ) : (
                  'Vérifier et continuer'
                )}
              </Button>
              {showSummary && (
                <Button
                  variant="outlined"
                  onClick={() => setShowSummary(false)}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#032B5A',
                    borderWidth: 2,
                    color: '#032B5A',
                    '&:hover': { 
                      borderColor: '#021d3f', 
                      bgcolor: 'rgba(3, 43, 90, 0.05)',
                      transform: 'translateY(-1px)',
                    },
                    borderRadius: 3,
                    py: 1.75,
                    px: 3,
                    minWidth: 140,
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                  }}
                >
                  Modifier
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => navigate('/client/bookings')}
                sx={{
                  textTransform: 'none',
                  borderColor: '#d1d5db',
                  color: '#666',
                  '&:hover': { 
                    borderColor: '#9e9e9e', 
                    bgcolor: 'rgba(158, 158, 158, 0.05)',
                    color: '#424242',
                  },
                  borderRadius: 3,
                  py: 1.75,
                  px: 3,
                  minWidth: 140,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                Annuler
              </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Calendar Card - Right Side */}
        <Grid item xs={12} md={4}>
          {technician && (
            <TechnicianAvailabilityCalendar
              technicianId={technician.id}
              selectedDateTime={formData.scheduledDateTime || ''}
              onDateTimeSelect={(dateTime) => {
                setFormData({ ...formData, scheduledDateTime: dateTime });
                setFieldErrors({ ...fieldErrors, scheduledDateTime: '' });
              }}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateBooking;
