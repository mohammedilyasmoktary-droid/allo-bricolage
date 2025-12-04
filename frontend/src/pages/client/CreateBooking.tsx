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
      const scheduledDate = new Date(formData.scheduledDateTime);
      if (scheduledDate < new Date()) {
        errors.scheduledDateTime = 'La date ne peut pas être dans le passé';
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
      const bookingData = { ...formData, isUrgent };
      const newBooking = await bookingsApi.create(bookingData);
      navigate(`/client/bookings/recap?bookingId=${newBooking.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création de la réservation');
      setShowSummary(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 0 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            bgcolor: '#f5f5f5',
            '&:hover': { bgcolor: '#e0e0e0' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A' }}>
          Créer une réservation
        </Typography>
      </Box>

      {/* Technician Card */}
      {technician && (
        <Card
          sx={{
            mb: 4,
            boxShadow: 3,
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                src={technician.profilePictureUrl}
                alt={technician.user?.name}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#032B5A',
                  color: '#F4C542',
                  fontSize: 32,
                  fontWeight: 700,
                  border: '3px solid #F4C542',
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
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Rating value={technician.averageRating} readOnly precision={0.1} size="small" sx={{ color: '#F4C542' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                    {technician.averageRating.toFixed(1)}/5
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                  <WorkIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">
                    {technician.yearsOfExperience} ans d'expérience
                  </Typography>
                  <Box sx={{ mx: 1 }}>•</Box>
                  <LocationOnIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">{technician.user?.city}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
                  {technician.skills.slice(0, 4).map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{
                        bgcolor: '#f8f9fa',
                        color: '#032B5A',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        border: '1px solid #e0e0e0',
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
          icon={<FlashOnIcon />}
          sx={{
            mb: 3,
            bgcolor: '#fff3cd',
            border: '2px solid #F4C542',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(244, 197, 66, 0.2)',
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#032B5A' }}>
            ⚡ Demande urgente
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
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
              boxShadow: 3,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
              {/* Service Category */}
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!fieldErrors.categoryId}>
                  <InputLabel sx={{ color: fieldErrors.categoryId ? 'error.main' : 'inherit' }}>
                    Catégorie de service *
                  </InputLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => {
                      setFormData({ ...formData, categoryId: e.target.value as string });
                      setFieldErrors({ ...fieldErrors, categoryId: '' });
                    }}
                    label="Catégorie de service *"
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: fieldErrors.categoryId ? 'error.main' : undefined,
                      },
                    }}
                  >
                    <MenuItem value="">Sélectionner une catégorie</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.categoryId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
                      {fieldErrors.categoryId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description du problème *"
                  name="description"
                  value={formData.description}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldErrors({ ...fieldErrors, description: '' });
                  }}
                  multiline
                  rows={5}
                  required
                  error={!!fieldErrors.description}
                  helperText={fieldErrors.description || 'Décrivez en détail le problème à résoudre (minimum 10 caractères)'}
                  placeholder="Ex: Fuite d'eau dans la salle de bain, robinet qui coule en permanence..."
                  InputProps={{
                    startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              {/* City and Address */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!fieldErrors.city}>
                  <InputLabel sx={{ color: fieldErrors.city ? 'error.main' : 'inherit' }}>
                    Ville *
                  </InputLabel>
                  <Select
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      setFieldErrors({ ...fieldErrors, city: '' });
                    }}
                    label="Ville *"
                    startAdornment={<LocationOnIcon sx={{ mr: 1, ml: 1.5, color: 'text.secondary' }} />}
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: fieldErrors.city ? 'error.main' : undefined,
                      },
                    }}
                  >
                    <MenuItem value="">Sélectionner une ville</MenuItem>
                    {MOROCCAN_CITIES.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.city && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75, display: 'block' }}>
                      {fieldErrors.city}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Adresse complète *"
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
                    startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>


              {/* Photo Upload */}
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 3,
                    border: fieldErrors.photos ? '2px dashed #d32f2f' : '2px dashed #e0e0e0',
                    borderRadius: 3,
                    bgcolor: fieldErrors.photos ? 'rgba(211, 47, 47, 0.04)' : '#fafafa',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: fieldErrors.photos ? '#d32f2f' : '#F4C542',
                      bgcolor: fieldErrors.photos ? 'rgba(211, 47, 47, 0.06)' : '#f8f9fa',
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PhotoCameraIcon sx={{ color: '#032B5A', fontSize: 28 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#032B5A', mb: 0.5 }}>
                        Photos du problème
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ajoutez jusqu'à 5 photos pour aider le technicien à comprendre le problème
                      </Typography>
                    </Box>
                    <label htmlFor="photo-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<PhotoCameraIcon />}
                        sx={{
                          textTransform: 'none',
                          borderColor: '#032B5A',
                          color: '#032B5A',
                          '&:hover': { borderColor: '#021d3f', bgcolor: 'rgba(3, 43, 90, 0.05)' },
                          borderRadius: 2,
                        }}
                      >
                        {selectedFiles.length > 0 ? 'Modifier' : 'Ajouter'} ({selectedFiles.length}/5)
                      </Button>
                    </label>
                  </Box>

                  {fieldErrors.photos && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                      {fieldErrors.photos}
                    </Alert>
                  )}

                  {previewUrls.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Grid container spacing={2}>
                        {previewUrls.map((url, index) => (
                          <Grid item xs={6} sm={4} md={2.4} key={index}>
                            <Box
                              sx={{
                                position: 'relative',
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: '2px solid #e0e0e0',
                                '&:hover': {
                                  borderColor: '#F4C542',
                                },
                              }}
                            >
                              <Box
                                component="img"
                                src={url}
                                alt={`Preview ${index + 1}`}
                                sx={{
                                  width: '100%',
                                  height: 120,
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => removePhoto(index)}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  bgcolor: 'rgba(0,0,0,0.6)',
                                  color: 'white',
                                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
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
                  mt: 4,
                  mb: 3,
                  bgcolor: '#f8f9fa',
                  border: '2px solid #F4C542',
                  borderRadius: 3,
                  boxShadow: 2,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      Récapitulatif de la réservation
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Technicien
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                        {technician?.user?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Service
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                        {categories.find(c => c.id === formData.categoryId)?.name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Adresse
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                        {formData.address}, {formData.city}
                      </Typography>
                    </Grid>
                    {isUrgent && (
                      <Grid item xs={12}>
                        <Alert severity="warning" sx={{ borderRadius: 2, bgcolor: '#fff3cd' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
            <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
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
                  },
                  textTransform: 'none',
                  minWidth: 200,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  boxShadow: 2,
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: '#032B5A' }} />
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
                    color: '#032B5A',
                    '&:hover': { borderColor: '#021d3f', bgcolor: 'rgba(3, 43, 90, 0.05)' },
                    borderRadius: 2,
                    py: 1.5,
                    minWidth: 120,
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
                  borderColor: '#9e9e9e',
                  color: '#9e9e9e',
                  '&:hover': { borderColor: '#757575', bgcolor: 'rgba(158, 158, 158, 0.05)' },
                  borderRadius: 2,
                  py: 1.5,
                  minWidth: 120,
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
