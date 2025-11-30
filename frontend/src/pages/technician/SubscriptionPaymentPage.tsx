import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionsApi } from '../../api/subscriptions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import StarIcon from '@mui/icons-material/Star';

const SubscriptionPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = (searchParams.get('plan') as 'BASIC' | 'PREMIUM') || 'BASIC';

  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'WAFACASH' | 'BANK_TRANSFER'>('CARD');
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getPlanPrice = (plan: string, period: string): number => {
    const monthlyPrice = plan === 'BASIC' ? 99 : 199;
    return period === 'MONTHLY' ? monthlyPrice : monthlyPrice * 12 * 0.9; // 10% discount for yearly
  };

  const amount = getPlanPrice(plan, billingPeriod);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      // Validate card details if card payment
      if (paymentMethod === 'CARD') {
        if (!cardNumber || !cardExpiry || !cardCVC || !cardName) {
          setError('Veuillez remplir tous les champs de la carte');
          setSubmitting(false);
          return;
        }
      }

      // Validate receipt for bank transfer
      if (paymentMethod === 'BANK_TRANSFER' && !receiptFile) {
        setError('Veuillez télécharger le reçu de virement');
        setSubmitting(false);
        return;
      }

      const data = {
        plan,
        paymentMethod,
        billingPeriod,
        receipt: receiptFile || undefined,
      };

      const result = await subscriptionsApi.create(data);
      setSuccess(true);
      setActiveStep(2);
    } catch (err: any) {
      console.error('Failed to create subscription:', err);
      setError(err.response?.data?.error || 'Échec du paiement. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Sélection du plan', 'Paiement', 'Confirmation'];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 0 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/technician/subscription')} sx={{ color: '#032B5A' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A' }}>
            Paiement de l'abonnement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complétez votre abonnement en quelques étapes
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Step 1: Plan Selection */}
      {activeStep === 0 && (
        <Card sx={{ boxShadow: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A', mb: 3 }}>
              Plan sélectionné
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: plan === 'PREMIUM' ? '#fffbf0' : '#e3f2fd',
                    borderRadius: 3,
                    border: `2px solid ${plan === 'PREMIUM' ? '#F4C542' : '#2196f3'}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <StarIcon sx={{ fontSize: 40, color: plan === 'PREMIUM' ? '#F4C542' : '#2196f3' }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A' }}>
                        {plan === 'BASIC' ? 'Plan Basique' : 'Plan Premium'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan === 'BASIC'
                          ? 'Accès complet aux missions'
                          : 'Priorité et fonctionnalités avancées'}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Période de facturation
                    </Typography>
                    <FormControl fullWidth>
                      <RadioGroup
                        value={billingPeriod}
                        onChange={(e) => setBillingPeriod(e.target.value as 'MONTHLY' | 'YEARLY')}
                        row
                      >
                        <FormControlLabel
                          value="MONTHLY"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Mensuel
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {plan === 'BASIC' ? '99 MAD/mois' : '199 MAD/mois'}
                              </Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="YEARLY"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                Annuel
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {plan === 'BASIC' ? '1,069 MAD/an' : '2,149 MAD/an'}
                                <Typography component="span" sx={{ color: '#4caf50', ml: 0.5, fontWeight: 600 }}>
                                  (10% de réduction)
                                </Typography>
                              </Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
                    Récapitulatif
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Plan
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                      {plan === 'BASIC' ? 'Basique' : 'Premium'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Période
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                      {billingPeriod === 'MONTHLY' ? 'Mensuel' : 'Annuel'}
                    </Typography>
                  </Box>
                  {billingPeriod === 'YEARLY' && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                        Réduction (10%)
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                        -{plan === 'BASIC' ? '119' : '239'} MAD
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      Total
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#F4C542' }}>
                      {amount.toFixed(2)} MAD
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
                sx={{
                  bgcolor: '#032B5A',
                  '&:hover': { bgcolor: '#021d3f' },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Continuer vers le paiement
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Payment */}
      {activeStep === 1 && (
        <Card sx={{ boxShadow: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A', mb: 3 }}>
              Méthode de paiement
            </Typography>

            <FormControl component="fieldset" fullWidth sx={{ mb: 4 }}>
              <FormLabel component="legend" sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
                Choisissez votre méthode de paiement
              </FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              >
                <Card
                  sx={{
                    mb: 2,
                    border: paymentMethod === 'CARD' ? '2px solid #032B5A' : '1px solid #e0e0e0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#032B5A',
                      bgcolor: '#f8f9fa',
                    },
                  }}
                  onClick={() => setPaymentMethod('CARD')}
                >
                  <FormControlLabel
                    value="CARD"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                        <CreditCardIcon sx={{ fontSize: 32, color: '#032B5A' }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                            Carte bancaire
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Visa, Mastercard, CMI
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Card>

                <Card
                  sx={{
                    mb: 2,
                    border: paymentMethod === 'WAFACASH' ? '2px solid #032B5A' : '1px solid #e0e0e0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#032B5A',
                      bgcolor: '#f8f9fa',
                    },
                  }}
                  onClick={() => setPaymentMethod('WAFACASH')}
                >
                  <FormControlLabel
                    value="WAFACASH"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                        <PaymentIcon sx={{ fontSize: 32, color: '#032B5A' }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                            Wafacash
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Paiement mobile rapide
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Card>

                <Card
                  sx={{
                    mb: 2,
                    border: paymentMethod === 'BANK_TRANSFER' ? '2px solid #032B5A' : '1px solid #e0e0e0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#032B5A',
                      bgcolor: '#f8f9fa',
                    },
                  }}
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                >
                  <FormControlLabel
                    value="BANK_TRANSFER"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                        <AccountBalanceIcon sx={{ fontSize: 32, color: '#032B5A' }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                            Virement bancaire
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Téléchargez le reçu après virement
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Card>
              </RadioGroup>
            </FormControl>

            {/* Card Payment Form */}
            {paymentMethod === 'CARD' && (
              <Paper sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#032B5A', mb: 3 }}>
                  Informations de la carte
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nom sur la carte"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Nom complet"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Numéro de carte"
                      value={cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                        setCardNumber(value);
                      }}
                      placeholder="1234 5678 9012 3456"
                      inputProps={{ maxLength: 19 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreditCardIcon sx={{ color: '#032B5A' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Date d'expiration"
                      value={cardExpiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setCardExpiry(value);
                      }}
                      placeholder="MM/AA"
                      inputProps={{ maxLength: 5 }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVC"
                      value={cardCVC}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                        setCardCVC(value);
                      }}
                      placeholder="123"
                      inputProps={{ maxLength: 3 }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  Vos informations de paiement sont sécurisées et cryptées
                </Alert>
              </Paper>
            )}

            {/* Bank Transfer Receipt Upload */}
            {paymentMethod === 'BANK_TRANSFER' && (
              <Paper sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
                  Informations de virement
                </Typography>
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Coordonnées bancaires :
                    </Typography>
                    <Typography variant="body2">IBAN: MA64 0011 0000 0000 0000 0000 000</Typography>
                    <Typography variant="body2">Banque: Bank of Morocco</Typography>
                    <Typography variant="body2">Bénéficiaire: Allo Bricolage SARL</Typography>
                  </Box>
                </Alert>
                <input
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id="receipt-upload"
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReceiptFile(e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="receipt-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<AccountBalanceIcon />}
                    sx={{
                      textTransform: 'none',
                      borderColor: '#032B5A',
                      color: '#032B5A',
                      '&:hover': { borderColor: '#021d3f', bgcolor: 'rgba(3, 43, 90, 0.05)' },
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    Télécharger le reçu de virement
                  </Button>
                </label>
                {receiptFile && (
                  <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                    Fichier sélectionné: {receiptFile.name}
                  </Alert>
                )}
              </Paper>
            )}

            {/* Wafacash Info */}
            {paymentMethod === 'WAFACASH' && (
              <Paper sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3, mb: 3 }}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Instructions Wafacash :
                    </Typography>
                    <Typography variant="body2">
                      Après confirmation, vous recevrez un lien de paiement Wafacash. Suivez les instructions pour
                      compléter le paiement.
                    </Typography>
                  </Box>
                </Alert>
              </Paper>
            )}

            {/* Summary */}
            <Paper sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
                Récapitulatif
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Plan
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                  {plan === 'BASIC' ? 'Basique' : 'Premium'} ({billingPeriod === 'MONTHLY' ? 'Mensuel' : 'Annuel'})
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
                  Total à payer
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#F4C542' }}>
                  {amount.toFixed(2)} MAD
                </Typography>
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                startIcon={<ArrowBackIcon />}
                sx={{
                  textTransform: 'none',
                  borderColor: '#032B5A',
                  color: '#032B5A',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Retour
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting || (paymentMethod === 'BANK_TRANSFER' && !receiptFile)}
                endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                sx={{
                  bgcolor: '#F4C542',
                  color: '#032B5A',
                  '&:hover': { bgcolor: '#e0b038' },
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1rem',
                }}
              >
                {submitting ? 'Traitement...' : 'Confirmer et payer'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {activeStep === 2 && (
        <Card sx={{ boxShadow: 4, borderRadius: 3, border: '1px solid #e0e0e0', textAlign: 'center' }}>
          <CardContent sx={{ p: 6 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#4caf50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
              Paiement confirmé !
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Votre abonnement {plan === 'BASIC' ? 'Basique' : 'Premium'} a été activé avec succès.
              {paymentMethod === 'BANK_TRANSFER' &&
                ' Votre paiement sera vérifié sous peu et votre abonnement sera activé.'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/technician/subscription')}
              sx={{
                bgcolor: '#032B5A',
                '&:hover': { bgcolor: '#021d3f' },
                textTransform: 'none',
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              Retour à mon abonnement
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SubscriptionPaymentPage;




