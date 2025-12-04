import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  Chip,
  Grid,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MOROCCAN_CITIES } from '../../constants/cities';
import { categoriesApi, Category } from '../../api/categories';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BuildIcon from '@mui/icons-material/Build';
import BadgeIcon from '@mui/icons-material/Badge';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface DocumentFile {
  file: File;
  type: 'CIN' | 'DIPLOMA' | 'CERTIFICATE' | 'OTHER';
  preview?: string;
}

const TechnicianRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const selectedPlan = searchParams.get('plan') || 'FREE_TRIAL';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: '',
    serviceCategory: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: DocumentFile['type']) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError('Les fichiers doivent être des images ou des PDFs');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Chaque fichier ne doit pas dépasser 5MB');
        return;
      }

      const newDoc: DocumentFile = { file, type };
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newDoc.preview = reader.result as string;
          setDocuments((prev) => [...prev, newDoc]);
        };
        reader.readAsDataURL(file);
      } else {
        setDocuments((prev) => [...prev, newDoc]);
      }
      setError('');
    });
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.city || !formData.serviceCategory) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Check for at least CIN
    const hasCIN = documents.some((doc) => doc.type === 'CIN');
    if (!hasCIN) {
      setError('La carte nationale d\'identité (CIN) est obligatoire');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('role', 'TECHNICIAN');
      formDataToSend.append('serviceCategory', formData.serviceCategory);

      // Append all documents
      documents.forEach((doc, index) => {
        formDataToSend.append(`documents[${index}][file]`, doc.file);
        formDataToSend.append(`documents[${index}][type]`, doc.type);
      });

      // If there's a CIN, also append it as nationalIdCard for backward compatibility
      const cinDoc = documents.find((doc) => doc.type === 'CIN');
      if (cinDoc) {
        formDataToSend.append('nationalIdCard', cinDoc.file);
      }

      await register(formDataToSend);
      
      // Redirect to technician dashboard after successful registration
      navigate('/technician/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.message || err.response?.data?.error || err.response?.data?.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeLabel = (type: DocumentFile['type']) => {
    switch (type) {
      case 'CIN':
        return 'Carte Nationale';
      case 'DIPLOMA':
        return 'Diplôme';
      case 'CERTIFICATE':
        return 'Certificat';
      case 'OTHER':
        return 'Autre';
      default:
        return type;
    }
  };

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
          maxWidth: 800,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          borderRadius: 4,
          border: '1px solid #e0e0e0',
        }}
      >
        <CardContent sx={{ p: 5 }}>
          {/* Header */}
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
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A', lineHeight: 1.2, mb: 0.25 }}>
                  Inscription Technicien
                </Typography>
                <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem', fontWeight: 500 }}>
                  Plan: {selectedPlan === 'FREE_TRIAL' ? 'Essai Gratuit' : selectedPlan === 'BASIC' ? 'Basique' : 'Premium'}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A', mb: 1 }}>
              Créez votre compte
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Remplissez le formulaire pour devenir technicien sur Allo Bricolage
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Full Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom complet *"
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: '#F4C542' },
                      '&.Mui-focused fieldset': { borderColor: '#F4C542' },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#F4C542' },
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email *"
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: '#F4C542' },
                      '&.Mui-focused fieldset': { borderColor: '#F4C542' },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#F4C542' },
                  }}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Téléphone *"
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
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: '#F4C542' },
                      '&.Mui-focused fieldset': { borderColor: '#F4C542' },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#F4C542' },
                  }}
                />
              </Grid>

              {/* City */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required disabled={loading}>
                  <InputLabel>Ville *</InputLabel>
                  <Select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    label="Ville *"
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
              </Grid>

              {/* Service Category */}
              <Grid item xs={12}>
                <FormControl fullWidth required disabled={loading}>
                  <InputLabel>Catégorie de service *</InputLabel>
                  <Select
                    value={formData.serviceCategory}
                    onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                    label="Catégorie de service *"
                    startAdornment={
                      <InputAdornment position="start">
                        <BuildIcon sx={{ color: '#F4C542', ml: 1 }} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">Sélectionner une catégorie</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Password */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mot de passe *"
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
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: '#F4C542' },
                      '&.Mui-focused fieldset': { borderColor: '#F4C542' },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#F4C542' },
                  }}
                />
              </Grid>

              {/* Documents Upload */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#032B5A' }}>
                  Documents à télécharger *
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Téléchargez vos documents (CIN obligatoire, diplômes et certificats optionnels)
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <input
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      id="cin-upload"
                      type="file"
                      onChange={(e) => handleDocumentUpload(e, 'CIN')}
                      disabled={loading}
                    />
                    <label htmlFor="cin-upload">
                      <Button
                        component="span"
                        variant="outlined"
                        fullWidth
                        startIcon={<BadgeIcon />}
                        disabled={loading}
                        sx={{
                          borderColor: documents.some((d) => d.type === 'CIN') ? '#4caf50' : '#e0e0e0',
                          color: documents.some((d) => d.type === 'CIN') ? '#4caf50' : '#666',
                          borderRadius: 2,
                          py: 1.5,
                          textTransform: 'none',
                          '&:hover': { borderColor: '#F4C542', bgcolor: '#fffbf0' },
                        }}
                      >
                        CIN *
                      </Button>
                    </label>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <input
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      id="diploma-upload"
                      type="file"
                      multiple
                      onChange={(e) => handleDocumentUpload(e, 'DIPLOMA')}
                      disabled={loading}
                    />
                    <label htmlFor="diploma-upload">
                      <Button
                        component="span"
                        variant="outlined"
                        fullWidth
                        startIcon={<SchoolIcon />}
                        disabled={loading}
                        sx={{
                          borderColor: '#e0e0e0',
                          color: '#666',
                          borderRadius: 2,
                          py: 1.5,
                          textTransform: 'none',
                          '&:hover': { borderColor: '#F4C542', bgcolor: '#fffbf0' },
                        }}
                      >
                        Diplômes
                      </Button>
                    </label>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <input
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      id="certificate-upload"
                      type="file"
                      multiple
                      onChange={(e) => handleDocumentUpload(e, 'CERTIFICATE')}
                      disabled={loading}
                    />
                    <label htmlFor="certificate-upload">
                      <Button
                        component="span"
                        variant="outlined"
                        fullWidth
                        startIcon={<DescriptionIcon />}
                        disabled={loading}
                        sx={{
                          borderColor: '#e0e0e0',
                          color: '#666',
                          borderRadius: 2,
                          py: 1.5,
                          textTransform: 'none',
                          '&:hover': { borderColor: '#F4C542', bgcolor: '#fffbf0' },
                        }}
                      >
                        Certificats
                      </Button>
                    </label>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <input
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      id="other-upload"
                      type="file"
                      multiple
                      onChange={(e) => handleDocumentUpload(e, 'OTHER')}
                      disabled={loading}
                    />
                    <label htmlFor="other-upload">
                      <Button
                        component="span"
                        variant="outlined"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        disabled={loading}
                        sx={{
                          borderColor: '#e0e0e0',
                          color: '#666',
                          borderRadius: 2,
                          py: 1.5,
                          textTransform: 'none',
                          '&:hover': { borderColor: '#F4C542', bgcolor: '#fffbf0' },
                        }}
                      >
                        Autres
                      </Button>
                    </label>
                  </Grid>
                </Grid>

                {/* Documents List */}
                {documents.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {documents.map((doc, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 2,
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderRadius: 2,
                          bgcolor: '#f8f9fa',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                          {doc.preview ? (
                            <Box
                              component="img"
                              src={doc.preview}
                              alt={doc.file.name}
                              sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                            />
                          ) : (
                            <ImageIcon sx={{ fontSize: 40, color: '#032B5A' }} />
                          )}
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                              {doc.file.name}
                            </Typography>
                            <Chip
                              label={getDocumentTypeLabel(doc.type)}
                              size="small"
                              sx={{
                                bgcolor: doc.type === 'CIN' ? '#F4C542' : '#e0e0e0',
                                color: doc.type === 'CIN' ? '#032B5A' : '#666',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                mt: 0.5,
                              }}
                            />
                          </Box>
                        </Box>
                        <IconButton
                          onClick={() => removeDocument(index)}
                          disabled={loading}
                          sx={{ color: '#f44336' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              sx={{
                bgcolor: '#032B5A',
                color: 'white',
                '&:hover': { bgcolor: '#021d3f' },
                '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' },
                textTransform: 'none',
                borderRadius: 2,
                py: 1.5,
                mt: 3,
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(3, 43, 90, 0.3)',
              }}
            >
              {loading ? 'Inscription...' : 'Créer mon compte'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TechnicianRegisterPage;

