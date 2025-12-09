import React, { useState, useEffect, useMemo } from 'react';
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
  Paper,
  Alert,
  Slider,
  Pagination,
  IconButton,
  InputAdornment,
  TextField,
  Divider,
  Container,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { techniciansApi, Technician } from '../../api/technicians';
import { categoriesApi, Category } from '../../api/categories';
import { useAuth } from '../../contexts/AuthContext';
import { MOROCCAN_CITIES } from '../../constants/cities';
import TechnicianMap from '../../components/TechnicianMap';
import TechnicianQuickView from '../../components/TechnicianQuickView';
import TechnicianCardSkeleton from '../../components/TechnicianCardSkeleton';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Service icons mapping
const getServiceIcon = (skill: string) => {
  const iconMap: Record<string, string> = {
    'Plomberie': '🔧',
    'Électricité': '⚡',
    'Peinture': '🎨',
    'Climatisation': '❄️',
    'Serrurerie': '🔐',
    'Menuiserie': '🪵',
    'Maçonnerie': '🧱',
    'Équipements': '🔌',
    'Chauffage': '🔥',
    'Carrelage': '🧱',
    'Réparations Générales': '🔨',
    'Climatisation & Chauffage': '❄️',
    'Montage meubles': '🪛',
    'Chauffe-eau': '🚿',
    'Multiservices': '🧰',
  };
  return iconMap[skill] || '🔧';
};

const SearchTechnicians: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [city, setCity] = useState('');
  
  // Set city from user if available, otherwise leave empty
  useEffect(() => {
    if (user?.city) {
      setCity(user.city);
    }
  }, [user]);
  const [category, setCategory] = useState('');
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filters
  const [minRating, setMinRating] = useState(0);
  const [minExperience, setMinExperience] = useState(0);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showFilters, setShowFilters] = useState(false);

  // Load categories on mount
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

  // Read URL params on mount and set state
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const urgentParam = searchParams.get('urgent');

    if (categoryParam) {
      setCategory(categoryParam);
    }
    if (urgentParam === 'true') {
      setIsUrgent(true);
    }
  }, [searchParams]);

  // Auto-load technicians when category or city changes (including from URL params)
  useEffect(() => {
    const loadTechnicians = async () => {
      setLoading(true);
      try {
        const data = await techniciansApi.getAvailable(city || undefined, category || undefined);
        setTechnicians(data);
        setFilteredTechnicians(data);
      } catch (error) {
        console.error('Failed to load technicians:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTechnicians();
  }, [category, city]); // Re-run when category or city changes

  const handleSearch = async () => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const data = await techniciansApi.getAvailable(city, category);
      setTechnicians(data);
      setFilteredTechnicians(data);
    } catch (error) {
      console.error('Failed to search technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...technicians];

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((t) => t.averageRating >= minRating);
    }

    // Experience filter
    if (minExperience > 0) {
      filtered = filtered.filter((t) => t.yearsOfExperience >= minExperience);
    }

    // Availability filter
    if (availabilityFilter === 'online') {
      filtered = filtered.filter((t) => t.isOnline);
    } else if (availabilityFilter === 'offline') {
      filtered = filtered.filter((t) => !t.isOnline);
    }

    // Price range filter
    filtered = filtered.filter((t) => {
      const price = t.hourlyRate || t.basePrice || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    setFilteredTechnicians(filtered);
    setCurrentPage(1);
  }, [technicians, minRating, minExperience, availabilityFilter, priceRange]);

  // Pagination
  const paginatedTechnicians = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTechnicians.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTechnicians, currentPage]);

  const totalPages = Math.ceil(filteredTechnicians.length / itemsPerPage);

  const handleQuickView = (technician: Technician) => {
    setSelectedTechnician(technician);
    setQuickViewOpen(true);
  };

  const handleBook = (technician: Technician) => {
    // If user is not logged in or not a client, redirect to sign up
    if (!user || user.role !== 'CLIENT') {
      const params = new URLSearchParams();
      params.set('role', 'CLIENT');
      params.set('technicianId', technician.id);
      if (isUrgent) {
        params.set('urgent', 'true');
      }
      if (category) {
        params.set('categoryId', category);
      }
      navigate(`/register?${params.toString()}`);
      return;
    }
    
    // User is logged in as client, proceed to booking
    const params = new URLSearchParams();
    params.set('technicianId', technician.id);
    if (isUrgent) {
      params.set('urgent', 'true');
    }
    if (category) {
      params.set('categoryId', category);
    }
    navigate(`/client/bookings/create?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinRating(0);
    setMinExperience(0);
    setAvailabilityFilter('all');
    setPriceRange([0, 500]);
  };

  const hasActiveFilters = minRating > 0 || minExperience > 0 || availabilityFilter !== 'all' || priceRange[0] > 0 || priceRange[1] < 500;

  return (
    <Container maxWidth="xl">
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
          Rechercher un technicien
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
          Trouvez le professionnel idéal pour vos besoins
        </Typography>
      </Box>

      {/* Search Bar */}
      <Card
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid #e8eaed',
          bgcolor: 'white',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Ville</InputLabel>
              <Select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                label="Ville"
              >
                <MenuItem value="">Toutes les villes</MenuItem>
                {MOROCCAN_CITIES.map((cityName) => (
                  <MenuItem key={cityName} value={cityName}>
                    {cityName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} label="Catégorie">
                <MenuItem value="">Toutes les catégories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                borderColor: '#032B5A',
                color: '#032B5A',
                textTransform: 'none',
                height: '56px',
                fontWeight: 500,
                '&:hover': { borderColor: '#021d3f', bgcolor: 'rgba(3, 43, 90, 0.05)' },
              }}
            >
              Filtres {hasActiveFilters && `(${[minRating > 0, minExperience > 0, availabilityFilter !== 'all', priceRange[0] > 0 || priceRange[1] < 500].filter(Boolean).length})`}
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{
                bgcolor: '#F4C542',
                color: '#032B5A',
                '&:hover': { bgcolor: '#e0b038' },
                textTransform: 'none',
                height: '56px',
                fontWeight: 600,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Rechercher'}
            </Button>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        {showFilters && (
          <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#032B5A' }}>
                Filtres avancés
              </Typography>
              {hasActiveFilters && (
                <Button
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  sx={{ textTransform: 'none', color: '#032B5A' }}
                >
                  Réinitialiser
                </Button>
              )}
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#032B5A' }}>
                  Note minimum: {minRating > 0 ? `${minRating.toFixed(1)}★` : 'Toutes'}
                </Typography>
                <Slider
                  value={minRating}
                  onChange={(_, value) => setMinRating(value as number)}
                  min={0}
                  max={5}
                  step={0.5}
                  marks
                  sx={{ color: '#F4C542' }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#032B5A' }}>
                  Expérience minimum: {minExperience > 0 ? `${minExperience} ans` : 'Tous'}
                </Typography>
                <Slider
                  value={minExperience}
                  onChange={(_, value) => setMinExperience(value as number)}
                  min={0}
                  max={15}
                  step={1}
                  marks={[{ value: 0, label: '0' }, { value: 5, label: '5' }, { value: 10, label: '10' }, { value: 15, label: '15' }]}
                  sx={{ color: '#F4C542' }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Disponibilité</InputLabel>
                  <Select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                    label="Disponibilité"
                  >
                    <MenuItem value="all">Tous</MenuItem>
                    <MenuItem value="online">En ligne</MenuItem>
                    <MenuItem value="offline">Hors ligne</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: '#032B5A' }}>
                  Prix: {priceRange[0]}-{priceRange[1]} MAD
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(_, value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={500}
                  step={10}
                  valueLabelDisplay="auto"
                  sx={{ color: '#F4C542' }}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </Card>

      {isUrgent && (
        <Alert
          severity="warning"
          icon={<FlashOnIcon />}
          sx={{ mb: 3, bgcolor: '#fff3cd', border: '1px solid #F4C542', borderRadius: 2 }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
            Demande urgente: Un supplément de 100 MAD sera ajouté au prix final
          </Typography>
        </Alert>
      )}

      {technicians.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#032B5A' }}>
            {filteredTechnicians.length} technicien(s) trouvé(s)
            {filteredTechnicians.length !== technicians.length && ` (sur ${technicians.length})`}
          </Typography>
        </Box>
      )}

      {loading && (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <TechnicianCardSkeleton />
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && technicians.length > 0 && (
        <Grid container spacing={3}>
          {/* Left Side - Technician List */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              {paginatedTechnicians.map((technician) => (
              <Grid item xs={12} sm={6} key={technician.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid #f0f0f0',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                      borderColor: '#F4C542',
                    },
                  }}
                  onClick={() => handleQuickView(technician)}
                >
                  {/* Header with photo and badges */}
                  <Box
                    sx={{
                      position: 'relative',
                      height: 180,
                      bgcolor: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2,
                    }}
                  >
                    <Avatar
                      src={technician.profilePictureUrl}
                      alt={technician.user?.name}
                      sx={{
                        width: 110,
                        height: 110,
                        bgcolor: '#032B5A',
                        color: '#F4C542',
                        fontSize: 42,
                        fontWeight: 700,
                        border: '4px solid #F4C542',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                      }}
                    >
                      {technician.user?.name?.charAt(0).toUpperCase()}
                    </Avatar>

                    {/* Badges */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        zIndex: 2,
                      }}
                    >
                      {technician.subscriptions && technician.subscriptions.length > 0 && technician.subscriptions[0].plan === 'PREMIUM' && (
                        <Chip
                          label="Premium"
                          size="small"
                          sx={{
                            bgcolor: '#F4C542',
                            color: '#032B5A',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            boxShadow: '0 2px 8px rgba(244, 197, 66, 0.3)',
                          }}
                        />
                      )}
                      <Chip
                        icon={
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: technician.isOnline ? '#4caf50' : '#9e9e9e',
                            }}
                          />
                        }
                        label={technician.isOnline ? 'En ligne' : 'Hors ligne'}
                        size="small"
                        sx={{
                          bgcolor: technician.isOnline ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                          color: technician.isOnline ? '#4caf50' : '#9e9e9e',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          border: `1px solid ${technician.isOnline ? '#4caf50' : '#9e9e9e'}`,
                        }}
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                    {/* Name and City */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 0.5 }}>
                        {technician.user?.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: '#9e9e9e' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {technician.user?.city}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Rating and Experience - Top */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={technician.averageRating} readOnly precision={0.1} size="small" sx={{ color: '#F4C542' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#032B5A' }}>
                          {technician.averageRating.toFixed(1)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WorkIcon sx={{ fontSize: 16, color: '#9e9e9e' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {technician.yearsOfExperience} ans d'expérience
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Skills as pills */}
                    <Box sx={{ mb: 2, minHeight: 60 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {technician.skills.slice(0, 3).map((skill, index) => (
                          <Chip
                            key={index}
                            label={`${getServiceIcon(skill)} ${skill}`}
                            size="small"
                            sx={{
                              bgcolor: '#f8f9fa',
                              color: '#032B5A',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              border: '1px solid #e0e0e0',
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: '#F4C542',
                                color: '#032B5A',
                              },
                            }}
                          />
                        ))}
                        {technician.skills.length > 3 && (
                          <Chip
                            label={`+${technician.skills.length - 3}`}
                            size="small"
                            sx={{
                              bgcolor: '#F4C542',
                              color: '#032B5A',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Price */}
                    <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f0f0f0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                            Tarif
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#F4C542', fontWeight: 700 }}>
                            {technician.hourlyRate ? `${technician.hourlyRate} MAD/h` : technician.basePrice ? `${technician.basePrice} MAD` : 'Sur devis'}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBook(technician);
                          }}
                          sx={{
                            bgcolor: '#032B5A',
                            color: 'white',
                            '&:hover': { bgcolor: '#021d3f' },
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2,
                            borderRadius: 2,
                          }}
                        >
                          Réserver
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#032B5A',
                      '&.Mui-selected': {
                        bgcolor: '#F4C542',
                        color: '#032B5A',
                        fontWeight: 700,
                      },
                    },
                  }}
                />
              </Box>
            )}
          </Grid>

          {/* Right Side - Map */}
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 2, 
                boxShadow: 3, 
                borderRadius: 3,
                position: { md: 'sticky' },
                top: { md: 20 },
                height: { md: 'fit-content' },
                maxHeight: { md: 'calc(100vh - 40px)' },
                overflow: 'hidden',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
                Carte des techniciens
              </Typography>
              <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TechnicianMap
                  technicians={filteredTechnicians}
                  onTechnicianClick={(technician) => handleQuickView(technician)}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {technicians.length === 0 && !loading && (
        <Card
          sx={{
            mt: 3,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid #e8eaed',
            bgcolor: 'white',
          }}
        >
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                Aucun technicien trouvé
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Essayez de modifier vos critères de recherche ou sélectionnez une autre ville.
              </Typography>
              <Button
                variant="outlined"
                onClick={clearFilters}
                sx={{
                  borderColor: '#032B5A',
                  color: '#032B5A',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#021d3f', bgcolor: 'rgba(3, 43, 90, 0.05)' },
                }}
              >
                Réinitialiser les filtres
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quick View Modal */}
      <TechnicianQuickView
        open={quickViewOpen}
        technician={selectedTechnician}
        onClose={() => setQuickViewOpen(false)}
        onBook={handleBook}
        isUrgent={isUrgent}
        categoryId={category}
      />
    </Container>
  );
};

export default SearchTechnicians;
