import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Rating,
  Chip,
  CircularProgress,
  Badge,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';
import { techniciansApi, Technician } from '../api/technicians';
import { categoriesApi, Category } from '../api/categories';
import { normalizeImageUrl } from '../utils/imageUrl';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BuildIcon from '@mui/icons-material/Build';
import StarIcon from '@mui/icons-material/Star';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import HandymanIcon from '@mui/icons-material/Handyman';
import ChairIcon from '@mui/icons-material/Chair';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';

const UnifiedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [services, setServices] = useState<Category[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    loadTechnicians();
    loadServices();
  }, []);

  const loadTechnicians = async () => {
    try {
      const data = await techniciansApi.getAvailable();
      const sorted = data
        .filter(t => t.verificationStatus === 'APPROVED')
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 6);
      setTechnicians(sorted);
    } catch (error) {
      console.error('Failed to load technicians:', error);
    } finally {
      setLoadingTechs(false);
    }
  };

  const loadServices = async () => {
    try {
      const data = await categoriesApi.getAll();
      // Get popular services
      const popularServices = ['Plomberie', 'Électricité', 'Climatisation', 'Bricolage', 'Montage meubles', 'Réparations diverses'];
      const filtered = data.filter(cat => popularServices.includes(cat.name));
      setServices(filtered);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const getServiceIcon = (name: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Plomberie': <PlumbingIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Électricité': <ElectricalServicesIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Climatisation': <AcUnitIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Bricolage': <HandymanIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Montage meubles': <ChairIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
      'Réparations diverses': <HomeRepairServiceIcon sx={{ fontSize: 48, color: '#032B5A' }} />,
    };
    return iconMap[name] || <BuildIcon sx={{ fontSize: 48, color: '#032B5A' }} />;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fafbfc' }}>
      {/* Sidebar */}
      <DashboardSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <Box sx={{ flex: 1, ml: '280px', p: 4 }}>
        <Container maxWidth="xl">
          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A', mb: 1 }}>
              Bienvenue, {user.name} 👋
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Trouvez rapidement un technicien ou un service pour vos besoins
            </Typography>
          </Box>

          {/* Techniciens disponibles maintenant */}
          <Card
            sx={{
              mb: 4,
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
                    Techniciens disponibles maintenant
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
                    const mainCategory = skills.length > 0 ? skills[0] : 'Service';

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

                            {mainCategory && (
                              <Box sx={{ mb: 2 }}>
                                <Chip
                                  label={mainCategory}
                                  size="small"
                                  sx={{
                                    bgcolor: '#F4C542',
                                    color: '#032B5A',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    height: 28,
                                  }}
                                />
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
                              Réserver
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

          {/* Services Populaires */}
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
                    Services Populaires
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Découvrez nos services de maintenance et réparation
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
                            Réserver maintenant
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default UnifiedDashboard;

