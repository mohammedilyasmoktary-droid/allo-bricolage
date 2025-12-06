import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Chip,
  Avatar,
  Rating,
  Container,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HeroBanner from '../components/HeroBanner';
import { techniciansApi, Technician } from '../api/technicians';
import { categoriesApi, Category } from '../api/categories';
import { normalizeImageUrl } from '../utils/imageUrl';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BuildIcon from '@mui/icons-material/Build';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [topTechnicians, setTopTechnicians] = useState<Technician[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Category[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'CLIENT') {
        navigate('/dashboard/client', { replace: true });
      } else if (user.role === 'TECHNICIAN') {
        navigate('/dashboard/technicien', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  // Fetch top technicians
  useEffect(() => {
    const loadTopTechnicians = async () => {
      try {
        const data = await techniciansApi.getAvailable();
        // Sort by rating and take top 3
        const sorted = data
          .filter(t => t.verificationStatus === 'APPROVED')
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 3);
        setTopTechnicians(sorted);
      } catch (error) {
        console.error('Failed to load top technicians:', error);
      } finally {
        setLoadingTechs(false);
      }
    };
    loadTopTechnicians();
  }, []);

  // Fetch featured services
  useEffect(() => {
    const loadFeaturedServices = async () => {
      try {
        const data = await categoriesApi.getAll();
        // Get top 3 most popular services
        const popularServices = ['Plomberie', 'Électricité', 'Climatisation'];
        const filtered = data
          .filter(cat => popularServices.includes(cat.name))
          .slice(0, 3);
        setFeaturedServices(filtered);
      } catch (error) {
        console.error('Failed to load featured services:', error);
      } finally {
        setLoadingServices(false);
      }
    };
    loadFeaturedServices();
  }, []);

  // Get icon for service
  const getServiceIcon = (name: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Plomberie': <PlumbingIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Électricité': <ElectricalServicesIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Climatisation': <AcUnitIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
    };
    return iconMap[name] || <BuildIcon sx={{ fontSize: 48, color: '#032B5A' }} />;
  };

  // Testimonials data
  const testimonials = [
    {
      name: 'Ahmed B.',
      rating: 5,
      text: 'Service rapide et professionnel, je recommande !',
      city: 'Casablanca'
    },
    {
      name: 'Fatima L.',
      rating: 5,
      text: 'Technicien ponctuel et travail de qualité.',
      city: 'Rabat'
    },
    {
      name: 'Mohamed K.',
      rating: 5,
      text: 'Excellent service, très satisfait du résultat final.',
      city: 'Marrakech'
    },
    {
      name: 'Aicha M.',
      rating: 5,
      text: 'Plateforme fiable, technicien compétent et à l\'heure.',
      city: 'Fès'
    }
  ];

  // Statistics data
  const statistics = [
    { value: '+5000', label: 'Clients satisfaits', icon: <PeopleIcon /> },
    { value: '+300', label: 'Techniciens vérifiés', icon: <VerifiedUserIcon /> },
    { value: '98%', label: 'Taux de satisfaction', icon: <ThumbUpIcon /> },
    { value: '24h', label: 'Délai moyen d\'intervention', icon: <AccessTimeIcon /> }
  ];

  // How it works steps
  const steps = [
    {
      number: 1,
      title: 'Choisissez un service',
      description: 'Sélectionnez le type de service dont vous avez besoin',
      icon: <SearchIcon />
    },
    {
      number: 2,
      title: 'Sélectionnez un technicien',
      description: 'Parcourez les profils et choisissez le professionnel idéal',
      icon: <PersonIcon />
    },
    {
      number: 3,
      title: 'Réservez la date et l\'heure',
      description: 'Planifiez votre intervention selon vos disponibilités',
      icon: <CalendarTodayIcon />
    },
    {
      number: 4,
      title: 'Le technicien intervient rapidement',
      description: 'Votre technicien arrive à l\'heure et effectue le travail',
      icon: <BuildIcon />
    }
  ];

  return (
    <Box sx={{ pb: { xs: 4, md: 8 }, position: 'relative' }}>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Main Content with Services/Technicians on Left and Mini Dashboard on Right */}
      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 6 } }}>
        <Grid container spacing={3}>
          {/* Left Side - Services and Technicians */}
          <Grid item xs={12} lg={8}>
            {/* Top Services Section */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: '#F4C542',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BuildIcon sx={{ fontSize: 28, color: '#032B5A' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', fontSize: '1.25rem' }}>
                    Top Services
                  </Typography>
                </Box>
                {loadingServices ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#032B5A' }} />
                  </Box>
                ) : featuredServices.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Aucun service disponible
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {featuredServices.map((service, index) => (
                      <Grid item xs={12} sm={4} key={service.id}>
                        <Card
                          onClick={() => navigate(`/search?category=${service.id}`)}
                          sx={{
                            height: '100%',
                            borderRadius: 2,
                            border: '1px solid #e8eaed',
                            bgcolor: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                              borderColor: '#F4C542',
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                            <Box
                              sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 2,
                                bgcolor: '#F4C542',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                              }}
                            >
                              {getServiceIcon(service.name)}
                            </Box>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                                color: '#032B5A',
                                mb: 1,
                                fontSize: '1rem',
                              }}
                            >
                              {service.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: '0.8rem',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {service.description || 'Service professionnel'}
                            </Typography>
                            <Box
                              sx={{
                                mt: 1.5,
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                bgcolor: '#032B5A',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                mx: 'auto',
                              }}
                            >
                              {index + 1}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>

            {/* Top Technicians Section */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: '#F4C542',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <StarIcon sx={{ fontSize: 28, color: '#032B5A' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', fontSize: '1.25rem' }}>
                    Top Techniciens
                  </Typography>
                </Box>
                {loadingTechs ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#032B5A' }} />
                  </Box>
                ) : topTechnicians.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    Aucun technicien disponible
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {topTechnicians.map((technician, index) => {
                      const imageIndex = (technician.id?.charCodeAt(0) || 1) % 8 + 1;
                      const technicianImage = `/images/technicians/technician_${imageIndex}.svg`;

                      return (
                        <Grid item xs={12} sm={4} key={technician.id}>
                          <Card
                            onClick={() => navigate(`/technician/view/${technician.id}`)}
                            sx={{
                              height: '100%',
                              borderRadius: 2,
                              border: '1px solid #e8eaed',
                              bgcolor: 'white',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                borderColor: '#F4C542',
                              },
                            }}
                          >
                            <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                              <Avatar
                                src={normalizeImageUrl(technician.profilePictureUrl || technicianImage)}
                                sx={{
                                  width: 80,
                                  height: 80,
                                  mx: 'auto',
                                  mb: 2,
                                  bgcolor: '#032B5A',
                                  color: '#F4C542',
                                  fontWeight: 700,
                                  fontSize: '2rem',
                                }}
                              >
                                {technician.user?.name?.charAt(0).toUpperCase() || 'T'}
                              </Avatar>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 700,
                                  color: '#032B5A',
                                  mb: 1,
                                  fontSize: '1rem',
                                }}
                              >
                                {technician.user?.name || 'Technicien'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                                <Rating
                                  value={technician.averageRating}
                                  readOnly
                                  size="small"
                                  precision={0.5}
                                  sx={{ fontSize: '0.9rem' }}
                                />
                                <Typography variant="body2" sx={{ color: '#032B5A', fontWeight: 700, fontSize: '0.9rem' }}>
                                  {technician.averageRating.toFixed(1)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1.5 }}>
                                <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                  {technician.user?.city || 'Ville'}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  bgcolor: '#F4C542',
                                  color: '#032B5A',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.9rem',
                                  fontWeight: 700,
                                  mx: 'auto',
                                }}
                              >
                                {index + 1}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Side - Mini Dashboard */}
          <Grid item xs={12} lg={4}>
            <Box
              sx={{
                position: { lg: 'sticky' },
                top: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {/* Platform Statistics */}
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 2.5, fontSize: '1rem' }}>
                    Statistiques
                  </Typography>
                  <Grid container spacing={2}>
                    {statistics.map((stat, index) => (
                      <Grid item xs={6} key={index}>
                        <Box
                          sx={{
                            textAlign: 'center',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: '#fafbfc',
                            border: '1px solid #e8eaed',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 1,
                              color: '#032B5A',
                            }}
                          >
                            {stat.icon}
                          </Box>
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: '#032B5A',
                              mb: 0.5,
                              fontSize: '1.5rem',
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              {/* Quick Info Card */}
              <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8eaed' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <VerifiedUserIcon sx={{ color: '#032B5A', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', fontSize: '1rem' }}>
                      Pourquoi nous choisir
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18, mt: 0.25 }} />
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        Garantie Satisfait ou Refait
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18, mt: 0.25 }} />
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        Techniciens Vérifiés
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18, mt: 0.25 }} />
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        Assurance Responsabilité Civile
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Why Choose AlloBricolage Section */}
      <Box sx={{ py: { xs: 7, md: 11 }, bgcolor: '#fafbfc' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                color: '#032B5A',
                mb: 2,
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              Pourquoi choisir Allo Bricolage ?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: 700,
                mx: 'auto',
                fontSize: { xs: '0.95rem', md: '1.1rem' }
              }}
            >
              La plateforme de confiance pour tous vos besoins de maintenance et réparation au Maroc
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: { xs: 3, md: 4 },
                  border: '1px solid #e8eaed',
                  borderRadius: 3,
                  bgcolor: 'white',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                    borderColor: '#F4C542',
                  },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 70, md: 90 },
                    height: { xs: 70, md: 90 },
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
                  <CheckCircleIcon sx={{ fontSize: { xs: 40, md: 50 }, color: '#032B5A' }} />
                </Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#032B5A',
                    mb: 2,
                    fontSize: { xs: '1.15rem', md: '1.35rem' }
                  }}
                >
                  Garantie Satisfait ou Refait
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.8,
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}
                >
                  Nous garantissons un travail conforme, ou nous revenons gratuitement.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: { xs: 3, md: 4 },
                  border: '1px solid #e8eaed',
                  borderRadius: 3,
                  bgcolor: 'white',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                    borderColor: '#F4C542',
                  },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 70, md: 90 },
                    height: { xs: 70, md: 90 },
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
                  <VerifiedUserIcon sx={{ fontSize: { xs: 40, md: 50 }, color: '#032B5A' }} />
                </Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#032B5A',
                    mb: 2,
                    fontSize: { xs: '1.15rem', md: '1.35rem' }
                  }}
                >
                  Techniciens Vérifiés
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.8,
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}
                >
                  Chaque technicien est contrôlé : documents, expérience, et évaluations.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: { xs: 3, md: 4 },
                  border: '1px solid #e8eaed',
                  borderRadius: 3,
                  bgcolor: 'white',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                    borderColor: '#F4C542',
                  },
                }}
              >
                <Box
                  sx={{
                    width: { xs: 70, md: 90 },
                    height: { xs: 70, md: 90 },
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
                  <SecurityIcon sx={{ fontSize: { xs: 40, md: 50 }, color: '#032B5A' }} />
                </Box>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#032B5A',
                    mb: 2,
                    fontSize: { xs: '1.15rem', md: '1.35rem' }
                  }}
                >
                  Assurance Responsabilité Civile
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.8,
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}
                >
                  Vos travaux sont couverts en cas de dommages.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Platform Statistics Section */}
      <Box sx={{ py: { xs: 7, md: 11 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                color: '#032B5A',
                mb: 3,
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              Allo Bricolage en Chiffres
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 }, maxWidth: 900, mx: 'auto' }}>
            <Typography
              variant="body1"
              sx={{
                color: '#032B5A',
                fontSize: { xs: '1rem', md: '1.2rem' },
                lineHeight: 1.8,
                fontWeight: 400,
              }}
            >
              Allo Bricolage accompagne depuis des années des milliers de clients dans leurs besoins de maintenance. Grâce à nos techniciens certifiés et évalués, nous garantissons un service fiable, rapide et sécurisé.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 4 }}>
            {statistics.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: { xs: 3, md: 4 },
                    border: '1px solid #e8eaed',
                    borderRadius: 3,
                    bgcolor: 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                      borderColor: '#F4C542',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 70, md: 90 },
                      height: { xs: 70, md: 90 },
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
                    {React.cloneElement(stat.icon, {
                      sx: { fontSize: { xs: 36, md: 48 }, color: '#032B5A' }
                    })}
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#032B5A',
                      mb: 1.5,
                      fontSize: { xs: '1.9rem', md: '2.75rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      fontSize: { xs: '0.9rem', md: '1.05rem' }
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: { xs: 7, md: 11 }, bgcolor: '#fafbfc' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                color: '#032B5A',
                mb: 2,
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              Comment ça marche ?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: 700,
                mx: 'auto',
                fontSize: { xs: '0.95rem', md: '1.1rem' }
              }}
            >
              Quatre étapes simples pour obtenir le service dont vous avez besoin
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {steps.map((step, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: { xs: 3, md: 4 },
                    border: '1px solid #e8eaed',
                    borderRadius: 3,
                    bgcolor: 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                      borderColor: '#F4C542',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 70, md: 90 },
                      height: { xs: 70, md: 90 },
                      borderRadius: '50%',
                      bgcolor: '#032B5A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      mt: 2,
                      boxShadow: '0 4px 16px rgba(3, 43, 90, 0.2)',
                    }}
                  >
                    {React.cloneElement(step.icon, {
                      sx: { fontSize: { xs: 40, md: 50 }, color: '#F4C542' }
                    })}
                  </Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: '#032B5A',
                      mb: 1.5,
                      fontSize: { xs: '1.05rem', md: '1.2rem' }
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                      fontSize: { xs: '0.85rem', md: '0.95rem' }
                    }}
                  >
                    {step.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Customer Reviews Section */}
      <Box sx={{ py: { xs: 7, md: 11 }, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontWeight: 700,
                color: '#032B5A',
                mb: 2,
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              Ce que disent nos clients
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: 700,
                mx: 'auto',
                fontSize: { xs: '0.95rem', md: '1.1rem' }
              }}
            >
              Découvrez les témoignages de nos clients satisfaits
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    p: { xs: 2.5, md: 3.5 },
                    border: '1px solid #e8eaed',
                    borderRadius: 3,
                    bgcolor: 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                      borderColor: '#F4C542',
                    },
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Rating value={testimonial.rating} readOnly size="small" sx={{ color: '#F4C542', mb: 1.5 }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#032B5A',
                        fontWeight: 500,
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        lineHeight: 1.6,
                        mb: 2,
                      }}
                    >
                      "{testimonial.text}"
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: '#032B5A',
                        color: '#F4C542',
                        width: { xs: 36, md: 40 },
                        height: { xs: 36, md: 40 },
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        fontWeight: 700,
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: '#032B5A',
                          fontSize: { xs: '0.85rem', md: '0.95rem' }
                        }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.75rem', md: '0.8rem' }
                        }}
                      >
                        {testimonial.city}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

    </Box>
  );
};

export default HomePage;
