import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CircularProgress, CardMedia, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoriesApi, Category } from '../api/categories';
import HeroBanner from '../components/HeroBanner';
import LiveTechnicians from '../components/LiveTechnicians';
import TechnicianShowcase from '../components/TechnicianShowcase';
import ReviewFeed from '../components/ReviewFeed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import PaymentIcon from '@mui/icons-material/Payment';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import BrushIcon from '@mui/icons-material/Brush';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import LockIcon from '@mui/icons-material/Lock';
import HandymanIcon from '@mui/icons-material/Handyman';
import KitchenIcon from '@mui/icons-material/Kitchen';
import ConstructionIcon from '@mui/icons-material/Construction';
import BuildIcon from '@mui/icons-material/Build';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        // Filter to show only the 8 most important service categories
        const importantCategories = [
          'Plomberie',
          'Électricité',
          'Climatisation',
          'Chauffage',
          'Peinture',
          'Serrurerie',
          'Menuiserie',
          'Maçonnerie',
        ];
        const filtered = data.filter((cat) => importantCategories.includes(cat.name));
        setCategories(filtered);
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Set empty array on error to prevent crash
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);


  // Get icon for each service category
  const getCategoryIcon = (name: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Plomberie': <PlumbingIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Électricité': <ElectricalServicesIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Peinture': <BrushIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Climatisation': <AcUnitIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Chauffage': <LocalFireDepartmentIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Carrelage': <SquareFootIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Serrurerie': <LockIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Petits travaux': <HandymanIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Équipements': <KitchenIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Maçonnerie': <ConstructionIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Menuiserie': <ConstructionIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
    };
    return iconMap[name] || <BuildIcon sx={{ fontSize: 48, color: '#032B5A' }} />;
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Live Technicians Section */}
      <Box sx={{ mb: 8 }}>
        <LiveTechnicians />
      </Box>

      {/* Services Catalog Section */}
      <Box sx={{ mb: 10 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 1, color: '#032B5A', textAlign: 'center' }}>
          Nos Services
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
          Découvrez notre large gamme de services de maintenance et réparation
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 24px rgba(3, 43, 90, 0.15)',
                    },
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                  onClick={() => {
                    if (user?.role === 'CLIENT') {
                      navigate(`/service/${category.id}`);
                    } else if (!user) {
                      navigate('/register');
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      height: 140, 
                      bgcolor: '#f8f9fa', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      borderBottom: '2px solid #e0e0e0',
                    }}
                  >
                    <Box
                      sx={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        bgcolor: '#F4C542',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(244, 197, 66, 0.3)',
                      }}
                    >
                      {getCategoryIcon(category.name)}
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#032B5A', mb: 1.5 }}>
                      {category.name}
                    </Typography>
                    {category.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, minHeight: 48 }}>
                        {category.description}
                      </Typography>
                    )}
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: '#032B5A',
                        color: 'white',
                        '&:hover': { bgcolor: '#021d3f' },
                        textTransform: 'none',
                        mt: 'auto',
                        fontWeight: 500,
                        py: 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (user?.role === 'CLIENT') {
                          navigate(`/service/${category.id}`);
                        } else if (!user) {
                          navigate('/register');
                        }
                      }}
                    >
                      Réserver
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Technician Showcase Section */}
      <Box sx={{ mb: 10 }}>
        <TechnicianShowcase />
      </Box>

      {/* Review Feed Section */}
      <Box sx={{ mb: 10 }}>
        <ReviewFeed />
      </Box>

      {/* Subscription Plans Section */}
      {(!user || user.role === 'TECHNICIAN') && (
        <Box sx={{ mb: 10, py: 6, bgcolor: '#f8f9fa', borderRadius: 3, px: 3 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600, mb: 2, color: '#032B5A', textAlign: 'center' }}
          >
            Plans d'Abonnement pour Techniciens
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, textAlign: 'center', color: 'text.secondary', maxWidth: 800, mx: 'auto' }}
          >
            Choisissez le plan qui correspond à vos besoins et développez votre activité
          </Typography>

          <Grid container spacing={4} sx={{ maxWidth: 1200, mx: 'auto', mt: 2 }}>
            {/* Free Trial Plan */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid #e0e0e0',
                  borderRadius: 3,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Chip
                      label="Essai Gratuit"
                      sx={{
                        bgcolor: '#032B5A',
                        color: 'white',
                        fontWeight: 600,
                        mb: 2,
                        px: 2,
                        py: 0.5,
                      }}
                    />
                    <Typography variant="h3" sx={{ color: '#032B5A', fontWeight: 700, mb: 1 }}>
                      0 MAD
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      7 jours d'essai
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    {[
                      '7 jours d\'essai gratuit',
                      'Maximum 3 demandes',
                      'Listage standard',
                      'Support de base',
                    ].map((benefit, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#032B5A' }} />
                        <Typography variant="body2">{benefit}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      if (user?.role === 'TECHNICIAN') {
                        navigate('/technician/subscription');
                      } else {
                        navigate('/register?role=TECHNICIAN');
                      }
                    }}
                    sx={{
                      borderColor: '#032B5A',
                      color: '#032B5A',
                      '&:hover': {
                        borderColor: '#021d3f',
                        bgcolor: 'rgba(3, 43, 90, 0.05)',
                      },
                      textTransform: 'none',
                      py: 1.5,
                      fontWeight: 600,
                      mt: 'auto',
                    }}
                  >
                    Commencer l'essai
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Basic Plan */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid #F4C542',
                  borderRadius: 3,
                  position: 'relative',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(244, 197, 66, 0.3)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: 20,
                    bgcolor: '#F4C542',
                    color: '#032B5A',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Populaire
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Chip
                      label="Basique"
                      sx={{
                        bgcolor: '#F4C542',
                        color: '#032B5A',
                        fontWeight: 600,
                        mb: 2,
                        px: 2,
                        py: 0.5,
                      }}
                    />
                    <Typography variant="h3" sx={{ color: '#032B5A', fontWeight: 700, mb: 1 }}>
                      99 MAD
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      par mois
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    {[
                      'Demandes illimitées',
                      'Listage normal',
                      'Support standard',
                      'Accès complet à la plateforme',
                    ].map((benefit, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#F4C542' }} />
                        <Typography variant="body2">{benefit}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      if (user?.role === 'TECHNICIAN') {
                        navigate('/technician/subscription');
                      } else {
                        navigate('/register?role=TECHNICIAN');
                      }
                    }}
                    sx={{
                      bgcolor: '#F4C542',
                      color: '#032B5A',
                      '&:hover': {
                        bgcolor: '#e0b038',
                      },
                      textTransform: 'none',
                      py: 1.5,
                      fontWeight: 600,
                      mt: 'auto',
                    }}
                  >
                    Choisir Basique
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Premium Plan */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid #032B5A',
                  borderRadius: 3,
                  bgcolor: 'rgba(3, 43, 90, 0.02)',
                  position: 'relative',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(3, 43, 90, 0.2)',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: 20,
                    bgcolor: '#032B5A',
                    color: '#F4C542',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <StarIcon sx={{ fontSize: 16 }} />
                  Premium
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Chip
                      label="Premium"
                      sx={{
                        bgcolor: '#032B5A',
                        color: '#F4C542',
                        fontWeight: 600,
                        mb: 2,
                        px: 2,
                        py: 0.5,
                      }}
                    />
                    <Typography variant="h3" sx={{ color: '#032B5A', fontWeight: 700, mb: 1 }}>
                      199 MAD
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      par mois
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    {[
                      'Demandes illimitées',
                      'Listage prioritaire',
                      'Badge "Premium"',
                      'Accès aux statistiques',
                      'Support prioritaire',
                    ].map((benefit, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: '#F4C542' }} />
                        <Typography variant="body2" sx={{ fontWeight: index < 2 ? 500 : 400 }}>
                          {benefit}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      if (user?.role === 'TECHNICIAN') {
                        navigate('/technician/subscription');
                      } else {
                        navigate('/register?role=TECHNICIAN');
                      }
                    }}
                    sx={{
                      bgcolor: '#032B5A',
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#021d3f',
                      },
                      textTransform: 'none',
                      py: 1.5,
                      fontWeight: 600,
                      mt: 'auto',
                    }}
                  >
                    Choisir Premium
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Tous les plans incluent un essai gratuit de 7 jours • Annulation à tout moment
            </Typography>
          </Box>
        </Box>
      )}

      {/* Features Section - Professional */}
      <Box sx={{ mb: 10, py: 8, bgcolor: '#f8f9fa', borderRadius: 4, px: { xs: 3, md: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, mb: 2, color: '#032B5A' }}
          >
            Pourquoi choisir Allo Bricolage ?
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto' }}>
            La plateforme de confiance pour tous vos besoins de maintenance et réparation au Maroc
          </Typography>
        </Box>
        <Grid container spacing={4} sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                p: 4,
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                transition: 'all 0.3s',
                bgcolor: 'white',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                  borderColor: '#F4C542',
                },
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#F4C542',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: '0 4px 16px rgba(244, 197, 66, 0.3)',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 48, color: '#032B5A' }} />
              </Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
                Techniciens qualifiés
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Tous nos techniciens sont vérifiés et certifiés pour garantir un service de qualité professionnelle
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                p: 4,
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                transition: 'all 0.3s',
                bgcolor: 'white',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                  borderColor: '#F4C542',
                },
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#F4C542',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: '0 4px 16px rgba(244, 197, 66, 0.3)',
                }}
              >
                <BuildIcon sx={{ fontSize: 48, color: '#032B5A' }} />
              </Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
                Services variés
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Plomberie, électricité, menuiserie, peinture, climatisation et bien plus encore pour tous vos besoins
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                p: 4,
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                transition: 'all 0.3s',
                bgcolor: 'white',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                  borderColor: '#F4C542',
                },
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: '#F4C542',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: '0 4px 16px rgba(244, 197, 66, 0.3)',
                }}
              >
                <PaymentIcon sx={{ fontSize: 48, color: '#032B5A' }} />
              </Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
                Paiement sécurisé
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Plusieurs méthodes de paiement disponibles (espèces, carte, virement, Wafacash) pour votre confort
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default HomePage;

