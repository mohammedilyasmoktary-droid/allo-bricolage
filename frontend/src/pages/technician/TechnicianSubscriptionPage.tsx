import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const TechnicianSubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'FREE_TRIAL' | 'BASIC' | 'PREMIUM' | null>(null);

  const handleSelectPlan = (plan: 'FREE_TRIAL' | 'BASIC' | 'PREMIUM') => {
    setSelectedPlan(plan);
    // Navigate to registration with selected plan
    navigate(`/technicien/register?plan=${plan}`);
  };

  const plans = [
    {
      id: 'FREE_TRIAL' as const,
      name: 'Essai Gratuit',
      price: 0,
      period: '7 jours',
      popular: false,
      benefits: [
        '7 jours d\'essai gratuit',
        'Maximum 3 demandes',
        'Listage standard',
        'Support de base',
      ],
      color: '#032B5A',
    },
    {
      id: 'BASIC' as const,
      name: 'Basique',
      price: 99,
      period: 'par mois',
      popular: false,
      benefits: [
        'Demandes illimitées',
        'Listage normal',
        'Support standard',
        'Accès complet à la plateforme',
      ],
      color: '#2196f3',
    },
    {
      id: 'PREMIUM' as const,
      name: 'Premium',
      price: 199,
      period: 'par mois',
      popular: true,
      benefits: [
        'Demandes illimitées',
        'Listage prioritaire',
        'Badge "Premium"',
        'Accès aux statistiques',
        'Support prioritaire',
      ],
      color: '#F4C542',
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 0 }, py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2, color: '#032B5A' }}>
          Plans d'Abonnement pour Techniciens
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 700, mx: 'auto' }}>
          Choisissez le plan qui correspond à vos besoins et développez votre activité
        </Typography>
      </Box>

      {!user && (
        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          Vous devez créer un compte technicien pour souscrire à un plan. Après avoir sélectionné un plan, vous serez redirigé vers la page d'inscription.
        </Alert>
      )}

      <Grid container spacing={4}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: plan.popular ? `3px solid ${plan.color}` : '2px solid #e0e0e0',
                borderRadius: 3,
                position: 'relative',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              {plan.popular && (
                <Chip
                  label="Populaire"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: plan.color,
                    color: plan.id === 'PREMIUM' ? '#032B5A' : 'white',
                    fontWeight: 700,
                    zIndex: 1,
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, p: 4, pt: plan.popular ? 6 : 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Chip
                    label={plan.name}
                    sx={{
                      bgcolor: plan.color,
                      color: plan.id === 'PREMIUM' ? '#032B5A' : 'white',
                      fontWeight: 600,
                      mb: 2,
                      px: 2,
                      py: 0.5,
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.5, mt: 2 }}>
                    <Typography variant="h3" sx={{ color: plan.color, fontWeight: 700 }}>
                      {plan.price}
                    </Typography>
                    {plan.price > 0 && (
                      <>
                        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                          MAD
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          /{plan.period}
                        </Typography>
                      </>
                    )}
                    {plan.price === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {plan.period}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  {plan.benefits.map((benefit, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 1.5,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: '#f8f9fa',
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 20, color: plan.color }} />
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#032B5A' }}>
                        {benefit}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant={plan.popular ? 'contained' : 'outlined'}
                  onClick={() => handleSelectPlan(plan.id)}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: plan.popular ? plan.color : 'transparent',
                    color: plan.popular ? (plan.id === 'PREMIUM' ? '#032B5A' : 'white') : plan.color,
                    borderColor: plan.color,
                    '&:hover': {
                      bgcolor: plan.popular ? plan.color : `${plan.color}15`,
                      borderColor: plan.color,
                    },
                    textTransform: 'none',
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: '1rem',
                    mt: 'auto',
                  }}
                >
                  Choisir {plan.name}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="body2" color="text.secondary">
          Tous les plans incluent un essai gratuit de 7 jours • Annulation à tout moment
        </Typography>
      </Box>
    </Box>
  );
};

export default TechnicianSubscriptionPage;

