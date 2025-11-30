import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { categoriesApi, Category } from '../../api/categories';
import { techniciansApi } from '../../api/technicians';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ScheduleIcon from '@mui/icons-material/Schedule';

const ServiceDetailPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [technicianCount, setTechnicianCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    loadServiceDetails();
  }, [categoryId]);

  const loadServiceDetails = async () => {
    setLoading(true);
    try {
      if (categoryId) {
        const categories = await categoriesApi.getAll();
        const foundCategory = categories.find((c) => c.id === categoryId);
        setCategory(foundCategory || null);

        // Get technician stats for this category
        const technicians = await techniciansApi.getAvailable(undefined, undefined, undefined);
        const categoryTechs = technicians.filter((tech) =>
          tech.skills.some((skill) => skill.toLowerCase().includes(foundCategory?.name.toLowerCase() || ''))
        );
        setTechnicianCount(categoryTechs.length);
        if (categoryTechs.length > 0) {
          const totalRating = categoryTechs.reduce((sum, tech) => sum + tech.averageRating, 0);
          setAvgRating(totalRating / categoryTechs.length);
        }
      }
    } catch (error) {
      console.error('Failed to load service details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!category) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 4, p: { xs: 2, md: 0 } }}>
        <Alert severity="error">Service non trouvé</Alert>
      </Box>
    );
  }

  // Mock data - in production, get from backend
  const serviceDetails: Record<string, any> = {
    'Plomberie': {
      priceRange: '150 - 500 MAD',
      estimatedTime: '30 min - 2h',
      included: [
        'Diagnostic du problème',
        'Réparation ou remplacement',
        'Nettoyage après intervention',
        'Garantie 30 jours',
      ],
      description: 'Service professionnel de plomberie pour tous vos besoins: fuites, canalisations, chauffe-eau, robinets, etc.',
    },
    'Électricité': {
      priceRange: '200 - 800 MAD',
      estimatedTime: '1h - 3h',
      included: [
        'Diagnostic électrique',
        'Réparation ou installation',
        'Vérification de sécurité',
        'Garantie 30 jours',
      ],
      description: 'Électriciens certifiés pour installations, réparations et dépannages électriques sécurisés.',
    },
    'Peinture': {
      priceRange: '300 - 1500 MAD',
      estimatedTime: '2h - 1 jour',
      included: [
        'Préparation des surfaces',
        'Application de peinture',
        'Nettoyage complet',
        'Garantie 60 jours',
      ],
      description: 'Services de peinture intérieure et extérieure avec matériaux de qualité.',
    },
    'Climatisation': {
      priceRange: '250 - 1000 MAD',
      estimatedTime: '1h - 4h',
      included: [
        'Diagnostic du système',
        'Nettoyage et maintenance',
        'Réparation si nécessaire',
        'Garantie 90 jours',
      ],
      description: 'Installation, maintenance et réparation de climatiseurs et systèmes de ventilation.',
    },
  };

  const details = serviceDetails[category.name] || {
    priceRange: '150 - 500 MAD',
    estimatedTime: '1h - 3h',
    included: ['Service professionnel', 'Garantie incluse'],
    description: category.description || 'Service de qualité pour tous vos besoins.',
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4, p: { xs: 2, md: 0 } }}>
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
            {category.name}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
            {details.description}
          </Typography>

          <Card sx={{ mb: 4, boxShadow: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A', mb: 3 }}>
                Ce qui est inclus:
              </Typography>
              <List>
                {details.included.map((item: string, index: number) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: '#F4C542' }} />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A', mb: 3 }}>
                Statistiques
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: '#F4C542', fontWeight: 700 }}>
                      {technicianCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Techniciens
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                      <Rating value={avgRating} readOnly precision={0.1} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Note moyenne
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#032B5A', fontWeight: 600 }}>
                      {details.priceRange}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Prix
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#032B5A', fontWeight: 600 }}>
                      {details.estimatedTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Durée
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100, boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A', mb: 3 }}>
                Réserver ce service
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AttachMoneyIcon sx={{ color: '#F4C542' }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    À partir de {details.priceRange.split(' - ')[0]}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ color: '#F4C542' }} />
                  <Typography variant="body1" color="text.secondary">
                    {details.estimatedTime}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ScheduleIcon />}
                onClick={() => {
                  if (user?.role === 'CLIENT') {
                    navigate(`/client/search?category=${category.id}&autoSearch=true`);
                  } else {
                    navigate('/login');
                  }
                }}
                sx={{
                  bgcolor: '#F4C542',
                  color: '#032B5A',
                  '&:hover': { bgcolor: '#e0b038' },
                  textTransform: 'none',
                  py: 1.5,
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Réserver maintenant
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<FlashOnIcon />}
                onClick={() => {
                  if (user?.role === 'CLIENT') {
                    navigate(`/client/search?category=${category.id}&urgent=true&autoSearch=true`);
                  } else {
                    navigate('/login');
                  }
                }}
                sx={{
                  borderColor: '#032B5A',
                  color: '#032B5A',
                  '&:hover': { borderColor: '#021d3f', bgcolor: 'rgba(3, 43, 90, 0.05)' },
                  textTransform: 'none',
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Demande urgente (1h) +100 MAD
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ServiceDetailPage;

