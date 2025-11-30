import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { categoriesApi, Category } from '../../api/categories';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const DiagnosisPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    photos: [] as File[],
  });
  const [suggestedCategory, setSuggestedCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.role !== 'CLIENT') {
      navigate('/');
    }
    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuggestedCategory(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 3);
      setFormData((prev) => ({ ...prev, photos: files }));
    }
  };

  const suggestCategory = () => {
    // Simple keyword matching - in production, use ML/NLP
    const description = formData.description.toLowerCase();
    const issueType = formData.issueType.toLowerCase();

    const keywords: Record<string, string[]> = {
      'Plomberie': ['eau', 'robinet', 'fuite', 'canalisation', 'chauffe-eau', 'toilette', 'douche', 'lavabo'],
      'Électricité': ['électricité', 'courant', 'prise', 'interrupteur', 'panne', 'coupure', 'câble', 'ampoule'],
      'Peinture': ['peinture', 'mur', 'plafond', 'fresque', 'décoration', 'couleur'],
      'Climatisation': ['climatisation', 'climatiseur', 'air', 'froid', 'chaud', 'ventilation', 'split'],
      'Petits travaux': ['réparation', 'bricolage', 'petit', 'dépannage', 'maintenance'],
      'Serrurerie': ['serrure', 'porte', 'clé', 'verrou', 'sécurité'],
      'Jardinage': ['jardin', 'plante', 'arbre', 'pelouse', 'fleur'],
      'Maçonnerie': ['mur', 'brique', 'ciment', 'construction', 'maçon'],
    };

    let bestMatch: Category | null = null;
    let maxMatches = 0;

    categories.forEach((category) => {
      const categoryKeywords = keywords[category.name] || [];
      let matches = 0;

      categoryKeywords.forEach((keyword) => {
        if (description.includes(keyword) || issueType.includes(keyword)) {
          matches++;
        }
      });

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category;
      }
    });

    if (bestMatch) {
      setSuggestedCategory(bestMatch);
    } else {
      setSuggestedCategory(categories[0] || null); // Default to first category
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.issueType || !formData.description) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      // In production, send to backend API
      // For now, just suggest category and navigate
      suggestCategory();
      setSuccess(true);

      // Auto-navigate after 2 seconds
      setTimeout(() => {
        if (suggestedCategory) {
          navigate(`/client/search?category=${suggestedCategory.id}`);
        } else {
          navigate('/client/search');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Échec de la demande de diagnostic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4, p: { xs: 2, md: 0 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 2, color: '#032B5A' }}>
        Diagnostic Rapide
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Décrivez votre problème et nous vous suggérerons le service le plus adapté
      </Typography>

      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Type de problème</InputLabel>
                  <Select
                    name="issueType"
                    value={formData.issueType}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, issueType: e.target.value }));
                      setSuggestedCategory(null);
                    }}
                    label="Type de problème"
                  >
                    <MenuItem value="plomberie">Plomberie</MenuItem>
                    <MenuItem value="électricité">Électricité</MenuItem>
                    <MenuItem value="peinture">Peinture</MenuItem>
                    <MenuItem value="climatisation">Climatisation</MenuItem>
                    <MenuItem value="serrurerie">Serrurerie</MenuItem>
                    <MenuItem value="jardinage">Jardinage</MenuItem>
                    <MenuItem value="petits travaux">Petits travaux</MenuItem>
                    <MenuItem value="autre">Autre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Description du problème"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez en détail votre problème..."
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="photo-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      sx={{ textTransform: 'none', py: 1.5 }}
                    >
                      {formData.photos.length > 0
                        ? `${formData.photos.length} photo(s) sélectionnée(s)`
                        : 'Télécharger des photos (max 3)'}
                    </Button>
                  </label>
                  {formData.photos.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {formData.photos.map((photo, index) => (
                        <Chip
                          key={index}
                          label={photo.name}
                          onDelete={() => {
                            setFormData((prev) => ({
                              ...prev,
                              photos: prev.photos.filter((_, i) => i !== index),
                            }));
                          }}
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>

              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">{error}</Alert>
                </Grid>
              )}

              {success && suggestedCategory && (
                <Grid item xs={12}>
                  <Alert
                    severity="success"
                    icon={<AutoFixHighIcon />}
                    sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      Service suggéré: {suggestedCategory.name}
                    </Typography>
                    <Typography variant="body2">
                      Redirection vers la recherche de techniciens...
                    </Typography>
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/client/search')}
                    sx={{ textTransform: 'none' }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
                    sx={{
                      bgcolor: '#F4C542',
                      color: '#032B5A',
                      '&:hover': { bgcolor: '#e0b038' },
                      textTransform: 'none',
                    }}
                  >
                    {loading ? 'Analyse en cours...' : 'Obtenir une suggestion'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DiagnosisPage;





