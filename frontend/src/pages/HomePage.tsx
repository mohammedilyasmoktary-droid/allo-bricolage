import React from 'react';
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
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HeroBanner from '../components/HeroBanner';
import LiveTechnicians from '../components/LiveTechnicians';
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

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    <Box sx={{ pb: { xs: 4, md: 8 } }}>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Why Choose AlloBricolage Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fafbfc' }}>
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
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'white' }}>
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
              Allo Bricolage en Chiffres
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
              Des résultats qui parlent d'eux-mêmes
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 4 }}>
            {statistics.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: { xs: 2.5, md: 4 },
                    border: '1px solid #e8eaed',
                    borderRadius: 3,
                    bgcolor: 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 32px rgba(3, 43, 90, 0.15)',
                      borderColor: '#F4C542',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 60, md: 80 },
                      height: { xs: 60, md: 80 },
                      borderRadius: '50%',
                      bgcolor: '#F4C542',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 4px 16px rgba(244, 197, 66, 0.3)',
                    }}
                  >
                    {React.cloneElement(stat.icon, {
                      sx: { fontSize: { xs: 32, md: 42 }, color: '#032B5A' }
                    })}
                  </Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#032B5A',
                      mb: 1,
                      fontSize: { xs: '1.75rem', md: '2.5rem' }
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      fontSize: { xs: '0.85rem', md: '1rem' }
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
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fafbfc' }}>
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
                      position: 'absolute',
                      top: -20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: '#F4C542',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(244, 197, 66, 0.4)',
                      zIndex: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#032B5A',
                        fontWeight: 800,
                        fontSize: '1.25rem'
                      }}
                    >
                      {step.number}
                    </Typography>
                  </Box>
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
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: 'white' }}>
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

      {/* Live Technicians Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fafbfc' }}>
        <Container maxWidth="lg">
          <LiveTechnicians />
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
