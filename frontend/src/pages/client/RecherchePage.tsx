import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Avatar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { techniciansApi, Technician } from '../../api/technicians';
import { categoriesApi, Category } from '../../api/categories';
import { useAuth } from '../../contexts/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import StarIcon from '@mui/icons-material/Star';

const RecherchePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setError('Impossible de charger les catégories');
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadTechnicians();
    } else {
      setTechnicians([]);
      setSelectedTechnician(null);
    }
  }, [selectedCategory]);

  const loadTechnicians = async () => {
    if (!selectedCategory) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await techniciansApi.getAvailable(user?.city || undefined, selectedCategory);
      setTechnicians(data);
      if (data.length === 0) {
        setError('Aucun technicien trouvé pour cette catégorie');
      }
    } catch (err) {
      console.error('Failed to load technicians:', err);
      setError('Impossible de charger les techniciens');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTechnician = (technician: Technician) => {
    setSelectedTechnician(technician);
  };

  const handleContinueToSignUp = () => {
    if (selectedTechnician && selectedCategory) {
      // Redirect to sign up page with technician and category info
      navigate(`/register?role=CLIENT&technicianId=${selectedTechnician.id}&categoryId=${selectedCategory}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, md: 0 }, py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4, color: '#032B5A' }}>
        Rechercher un technicien
      </Typography>

      {/* Step 1: Select Service Type */}
      <Card sx={{ mb: 4, p: 3, boxShadow: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#032B5A' }}>
          Étape 1: Sélectionnez le type de service
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Catégorie de service</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Catégorie de service"
          >
            <MenuItem value="">Sélectionner une catégorie</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Card>

      {/* Step 2: Show Technicians */}
      {selectedCategory && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#032B5A' }}>
            Étape 2: Sélectionnez un technicien
          </Typography>

          {error && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: '#F4C542' }} />
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {technicians.map((technician) => (
                <Grid item xs={12} sm={6} md={4} key={technician.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      border: selectedTechnician?.id === technician.id ? '3px solid #F4C542' : '1px solid #e0e0e0',
                      borderRadius: 3,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                        borderColor: '#F4C542',
                      },
                    }}
                    onClick={() => handleSelectTechnician(technician)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          src={technician.profilePictureUrl}
                          alt={technician.user?.name}
                          sx={{
                            width: 70,
                            height: 70,
                            bgcolor: '#032B5A',
                            color: '#F4C542',
                            fontSize: 28,
                            fontWeight: 700,
                            border: '2px solid #F4C542',
                          }}
                        >
                          {technician.user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 0.5 }}>
                            {technician.user?.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {technician.user?.city}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={technician.averageRating} readOnly precision={0.1} size="small" sx={{ color: '#F4C542' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                              {technician.averageRating.toFixed(1)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <WorkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {technician.yearsOfExperience} ans d'expérience
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                        {technician.skills.slice(0, 3).map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            sx={{
                              bgcolor: '#f8f9fa',
                              color: '#032B5A',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        ))}
                      </Box>

                      {selectedTechnician?.id === technician.id && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 1.5,
                            bgcolor: '#F4C542',
                            borderRadius: 2,
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#032B5A' }}>
                            ✓ Sélectionné
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Step 3: Continue to Booking */}
          {selectedTechnician && (
            <Card sx={{ p: 3, boxShadow: 3, borderRadius: 3, bgcolor: '#f8f9fa' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#032B5A' }}>
                    Technicien sélectionné
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {selectedTechnician.user?.name} - {categories.find(c => c.id === selectedCategory)?.name}
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                    {user ? 'Vous allez être redirigé vers la page de réservation après inscription' : 'Créez un compte pour continuer vers la réservation'}
                  </Alert>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleContinueToSignUp}
                  sx={{
                    bgcolor: '#F4C542',
                    color: '#032B5A',
                    '&:hover': { bgcolor: '#e0b038' },
                    textTransform: 'none',
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                >
                  {user ? 'Continuer vers la réservation' : 'Créer un compte pour continuer'}
                </Button>
              </Box>
            </Card>
          )}
        </>
      )}
    </Box>
  );
};

export default RecherchePage;

