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
  CircularProgress,
  Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HeroBanner from '../components/HeroBanner';
import HomePageMiniDashboard from '../components/HomePageMiniDashboard';
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
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [services, setServices] = useState<Category[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  // Fetch top 3 technicians
  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const data = await techniciansApi.getAvailable();
        // Sort by rating and take top 3
        const sorted = data
          .filter(t => t.verificationStatus === 'APPROVED')
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 3);
        setTechnicians(sorted);
      } catch (error) {
        console.error('Failed to load technicians:', error);
      } finally {
        setLoadingTechs(false);
      }
    };
    loadTechnicians();
  }, []);

  // Fetch top 3 services
  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await categoriesApi.getAll();
        // Get top 3 most popular services
        const popularServices = ['Plomberie', 'Électricité', 'Climatisation'];
        const filtered = data
          .filter(cat => popularServices.includes(cat.name))
          .slice(0, 3);
        setServices(filtered);
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setLoadingServices(false);
      }
    };
    loadServices();
  }, []);

  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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

      {/* Main Content - New Layout */}
      <Container maxWidth="xl" sx={{ mt: { xs: 4, md: 6 } }}>
        <Grid container spacing={3}>
          {/* Left Side - Mini Dashboard (only for logged-in users) */}
          {user && (
            <Grid item xs={12} md={3}>
              <HomePageMiniDashboard onLogout={handleLogout} />
            </Grid>
          )}

          {/* Right Side - Services and Technicians */}
          <Grid item xs={12} md={user ? 9 : 12}>
            <Grid container spacing={3}>
              {/* Services List Section */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid #e8eaed',
                    bgcolor: 'white',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: '#032B5A',
                      p: 3,
                      background: 'linear-gradient(135deg, #032B5A 0%, #021d3f 100%)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          bgcolor: '#F4C542',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 16px rgba(244, 197, 66, 0.3)',
                        }}
                      >
                        <BuildIcon sx={{ fontSize: 32, color: '#032B5A' }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: 'white',
                            fontSize: '1.5rem',
                            mb: 0.5,
                          }}
                        >
                          Nos Services
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Découvrez tous nos services de maintenance et réparation
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    {loadingServices ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress sx={{ color: '#032B5A' }} />
                      </Box>
                    ) : services.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
                        Aucun service disponible
                      </Typography>
                    ) : (
                      <Grid container spacing={3}>
                        {services.map((service) => (
                          <Grid item xs={12} sm={6} md={4} key={service.id}>
                            <Card
                              onClick={() => navigate(`/search?category=${service.id}`)}
                              sx={{
                                height: '100%',
                                borderRadius: 3,
                                border: '1px solid #e8eaed',
                                bgcolor: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                overflow: 'hidden',
                                '&:hover': {
                                  transform: 'translateY(-8px)',
                                  boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                                  borderColor: '#F4C542',
                                },
                              }}
                            >
                              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <Box
                                  sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 3,
                                    bgcolor: '#F4C542',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                    boxShadow: '0 4px 16px rgba(244, 197, 66, 0.3)',
                                  }}
                                >
                                  {getServiceIcon(service.name)}
                                </Box>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 700,
                                    color: '#032B5A',
                                    mb: 1.5,
                                    fontSize: '1.15rem',
                                  }}
                                >
                                  {service.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mb: 2.5,
                                    fontSize: '0.9rem',
                                    lineHeight: 1.6,
                                    minHeight: 48,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {service.description || 'Service professionnel de qualité'}
                                </Typography>
                                <Button
                                  fullWidth
                                  variant="contained"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/search?category=${service.id}`);
                                  }}
                                  sx={{
                                    bgcolor: '#032B5A',
                                    color: 'white',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    py: 1.2,
                                    borderRadius: 2,
                                    boxShadow: '0 4px 12px rgba(3, 43, 90, 0.2)',
                                    '&:hover': {
                                      bgcolor: '#021d3f',
                                      transform: 'scale(1.02)',
                                    },
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  Trouver un technicien
                                </Button>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Technicians List Section */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid #e8eaed',
                    bgcolor: 'white',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: '#032B5A',
                      p: 3,
                      background: 'linear-gradient(135deg, #032B5A 0%, #021d3f 100%)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 3,
                          bgcolor: '#F4C542',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 16px rgba(244, 197, 66, 0.3)',
                        }}
                      >
                        <StarIcon sx={{ fontSize: 32, color: '#032B5A' }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: 'white',
                            fontSize: '1.5rem',
                            mb: 0.5,
                          }}
                        >
                          Nos Techniciens
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                          Trouvez le professionnel idéal pour vos besoins
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    {loadingTechs ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress sx={{ color: '#032B5A' }} />
                      </Box>
                    ) : technicians.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
                        Aucun technicien disponible
                      </Typography>
                    ) : (
                      <Grid container spacing={3}>
                        {technicians.map((technician) => {
                          const imageIndex = (technician.id?.charCodeAt(0) || 1) % 8 + 1;
                          const technicianImage = `/images/technicians/technician_${imageIndex}.svg`;
                          const skills = typeof technician.skills === 'string' 
                            ? JSON.parse(technician.skills || '[]') 
                            : technician.skills || [];

                          return (
                            <Grid item xs={12} sm={6} md={4} key={technician.id}>
                              <Card
                                sx={{
                                  height: '100%',
                                  borderRadius: 3,
                                  border: '1px solid #e8eaed',
                                  bgcolor: 'white',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                  overflow: 'hidden',
                                  '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                                    borderColor: '#F4C542',
                                  },
                                }}
                              >
                                <CardContent sx={{ p: 3 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Badge
                                      overlap="circular"
                                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                      badgeContent={
                                        <Box
                                          sx={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: '50%',
                                            bgcolor: technician.isOnline ? '#4caf50' : '#9e9e9e',
                                            border: '2px solid white',
                                          }}
                                        />
                                      }
                                    >
                                      <Avatar
                                        src={normalizeImageUrl(technician.profilePictureUrl || technicianImage)}
                                        sx={{
                                          width: 72,
                                          height: 72,
                                          bgcolor: '#032B5A',
                                          color: '#F4C542',
                                          fontWeight: 700,
                                          fontSize: '1.75rem',
                                          border: '3px solid #F4C542',
                                        }}
                                      >
                                        {technician.user?.name?.charAt(0).toUpperCase() || 'T'}
                                      </Avatar>
                                    </Badge>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          fontWeight: 700,
                                          color: '#032B5A',
                                          mb: 0.5,
                                          fontSize: '1.1rem',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {technician.user?.name || 'Technicien'}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                        <Rating
                                          value={technician.averageRating}
                                          readOnly
                                          size="small"
                                          precision={0.5}
                                          sx={{
                                            '& .MuiRating-iconFilled': {
                                              color: '#F4C542',
                                            },
                                          }}
                                        />
                                        <Typography
                                          variant="body2"
                                          sx={{ color: '#032B5A', fontWeight: 700, fontSize: '0.9rem' }}
                                        >
                                          {technician.averageRating.toFixed(1)}
                                        </Typography>
                                      </Box>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                          {technician.user?.city || 'Ville'}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>

                                  {technician.yearsOfExperience && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                        {technician.yearsOfExperience} ans d'expérience
                                      </Typography>
                                    </Box>
                                  )}

                                  {skills.length > 0 && (
                                    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                      {skills.slice(0, 2).map((skill: string, idx: number) => (
                                        <Chip
                                          key={idx}
                                          label={skill}
                                          size="small"
                                          sx={{
                                            bgcolor: '#f8f9fa',
                                            color: '#032B5A',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            border: '1px solid #e8eaed',
                                            borderRadius: 2,
                                            height: 24,
                                          }}
                                        />
                                      ))}
                                      {skills.length > 2 && (
                                        <Chip
                                          label={`+${skills.length - 2}`}
                                          size="small"
                                          sx={{
                                            bgcolor: '#F4C542',
                                            color: '#032B5A',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            height: 24,
                                          }}
                                        />
                                      )}
                                    </Box>
                                  )}

                                  <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => navigate(`/technician/view/${technician.id}`)}
                                    sx={{
                                      bgcolor: '#032B5A',
                                      color: 'white',
                                      textTransform: 'none',
                                      fontWeight: 600,
                                      py: 1.2,
                                      borderRadius: 2,
                                      boxShadow: '0 4px 12px rgba(3, 43, 90, 0.2)',
                                      '&:hover': {
                                        bgcolor: '#021d3f',
                                        transform: 'scale(1.02)',
                                      },
                                      transition: 'all 0.2s ease',
                                    }}
                                  >
                                    Réserver maintenant
                                  </Button>
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
            </Grid>
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
