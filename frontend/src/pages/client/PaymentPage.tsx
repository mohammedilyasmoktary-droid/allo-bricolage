import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Avatar,
  Rating,
  TextareaAutosize,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsApi, Booking } from '../../api/bookings';
import { reviewsApi, CreateReviewData } from '../../api/reviews';
import { useAuth } from '../../contexts/AuthContext';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BuildIcon from '@mui/icons-material/Build';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InfoIcon from '@mui/icons-material/Info';
import LockIcon from '@mui/icons-material/Lock';
import TextField from '@mui/material/TextField';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StarIcon from '@mui/icons-material/Star';
import { generateBookingPDF, BookingPDFData } from '../../utils/pdfGenerator';

const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'WAFACASH' | 'BANK_TRANSFER'>('CASH');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) return;
      try {
        const data = await bookingsApi.getById(bookingId);
        setBooking(data);
        
        // Load existing review if payment is paid
        if (data.paymentStatus === 'PAID' && data.reviews && data.reviews.length > 0) {
          const clientReview = data.reviews.find((r: any) => r.reviewerId === user?.id);
          if (clientReview) {
            setExistingReview(clientReview);
            setReviewRating(clientReview.rating);
            setReviewComment(clientReview.comment || '');
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Échec du chargement de la réservation');
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [bookingId, user]);

  const handlePayment = async () => {
    if (!bookingId) return;
    
    // Validate required fields based on payment method
    if (paymentMethod === 'CARD' && !transactionId.trim()) {
      setError('Transaction ID is required for card payments. Please enter the transaction ID from your payment gateway.');
      return;
    }
    
    if ((paymentMethod === 'WAFACASH' || paymentMethod === 'BANK_TRANSFER') && !receipt) {
      setError('Receipt is required for Wafacash and bank transfer payments. Please upload a receipt.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const result = await bookingsApi.processPayment(bookingId, paymentMethod, receipt || undefined, transactionId || undefined);
      setBooking(result);
      setSuccess(true);
      // Reload booking to get updated data
      const updated = await bookingsApi.getById(bookingId);
      setBooking(updated);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Échec du traitement du paiement');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!booking) return;
    
    const pdfData: BookingPDFData = {
      bookingId: booking.id,
      clientName: booking.client?.name || 'N/A',
      clientEmail: booking.client?.email || 'N/A',
      clientPhone: booking.client?.phone || 'N/A',
      technicianName: booking.technician?.name || 'N/A',
      technicianPhone: booking.technician?.phone || 'N/A',
      serviceCategory: booking.category?.name || 'N/A',
      description: booking.description,
      address: booking.address,
      city: booking.city,
      scheduledDate: booking.scheduledDateTime,
      status: booking.status,
      estimatedPrice: booking.estimatedPrice,
      finalPrice: booking.finalPrice,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      receiptUrl: booking.receiptUrl,
      transactionId: booking.transactionId,
      createdAt: booking.createdAt,
      review: existingReview ? {
        rating: existingReview.rating,
        comment: existingReview.comment,
        createdAt: existingReview.createdAt,
      } : undefined,
    };
    
    await generateBookingPDF(pdfData);
  };

  const handleSubmitReview = async () => {
    if (!booking || !booking.technicianId) return;
    
    setSubmittingReview(true);
    try {
      const reviewData: CreateReviewData = {
        bookingId: booking.id,
        revieweeId: booking.technicianId,
        rating: reviewRating,
        comment: reviewComment || undefined,
      };
      
      await reviewsApi.create(reviewData);
      setReviewSuccess(true);
      
      // Reload booking to get updated review
      const updated = await bookingsApi.getById(booking.id);
      setBooking(updated);
      const clientReview = updated.reviews?.find((r: any) => r.reviewerId === user?.id);
      if (clientReview) {
        setExistingReview(clientReview);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Échec de la soumission de l\'avis');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#F4C542' }} size={50} />
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, md: 0 }, py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/client/bookings')}
            sx={{
              bgcolor: '#f5f5f5',
              '&:hover': { bgcolor: '#e0e0e0' },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A' }}>
            Paiement
          </Typography>
        </Box>

        <Card
          sx={{
            boxShadow: 3,
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Alert
              severity="error"
              icon={<InfoIcon />}
              sx={{
                mb: 4,
                borderRadius: 2,
                bgcolor: '#ffebee',
                border: '2px solid #f44336',
                '& .MuiAlert-icon': {
                  color: '#f44336',
                },
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                {error || 'Réservation non trouvée'}
              </Typography>
            </Alert>

            <Button
              variant="contained"
              onClick={() => navigate('/client/bookings')}
              startIcon={<ArrowBackIcon />}
              sx={{
                bgcolor: '#032B5A',
                '&:hover': { bgcolor: '#021d3f' },
                textTransform: 'none',
                borderRadius: 2,
                py: 1.5,
                px: 4,
                fontWeight: 600,
                boxShadow: 2,
              }}
            >
              Retour aux réservations
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const isPaymentPending = booking.status === 'AWAITING_PAYMENT';
  const isPaymentProcessed = booking.paymentStatus === 'PAID' || booking.paymentStatus === 'PENDING';
  const canReview = booking.paymentStatus === 'PAID' && booking.status === 'COMPLETED' && !existingReview;

  const finalPrice = booking.finalPrice || booking.estimatedPrice || 0;

  const paymentMethods = [
    {
      value: 'CASH' as const,
      icon: <PaymentIcon sx={{ fontSize: 32, color: '#F4C542' }} />,
      title: 'Espèces',
      description: 'Paiement en espèces lorsque le technicien arrive',
      color: '#4caf50',
    },
    {
      value: 'CARD' as const,
      icon: <CreditCardIcon sx={{ fontSize: 32, color: '#F4C542' }} />,
      title: 'Carte bancaire',
      description: 'Paiement sécurisé par carte bancaire (Stripe)',
      color: '#2196f3',
    },
    {
      value: 'WAFACASH' as const,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#F4C542' }} />,
      title: 'Wafacash',
      description: 'Paiement via Wafacash',
      color: '#ff9800',
    },
    {
      value: 'BANK_TRANSFER' as const,
      icon: <AccountBalanceIcon sx={{ fontSize: 32, color: '#F4C542' }} />,
      title: 'Virement bancaire',
      description: 'Transfert bancaire direct',
      color: '#9c27b0',
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 0 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => navigate('/client/bookings')}
          sx={{
            bgcolor: '#f5f5f5',
            '&:hover': { bgcolor: '#e0e0e0' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A' }}>
          {isPaymentProcessed ? 'Détails du Paiement' : 'Paiement'}
        </Typography>
        {isPaymentProcessed && (
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPDF}
            sx={{
              ml: 'auto',
              borderColor: '#032B5A',
              color: '#032B5A',
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': {
                borderColor: '#021d3f',
                bgcolor: 'rgba(3, 43, 90, 0.05)',
              },
            }}
          >
            Télécharger PDF
          </Button>
        )}
      </Box>

      {success && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{
            mb: 4,
            borderRadius: 2,
            bgcolor: '#e8f5e9',
            border: '2px solid #4caf50',
            '& .MuiAlert-icon': {
              color: '#4caf50',
            },
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
            ✅ {paymentMethod === 'CASH' 
              ? 'Payment method selected! The technician will confirm receipt when payment is received.'
              : paymentMethod === 'CARD'
              ? 'Payment initiated! Awaiting verification.'
              : 'Receipt uploaded! The technician will verify and confirm your payment.'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {paymentMethod === 'CASH' 
              ? 'You will be notified when the technician confirms receipt.'
              : 'You will be notified once the payment is verified and confirmed.'}
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 4,
            borderRadius: 2,
            bgcolor: '#ffebee',
            border: '2px solid #f44336',
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Panel - Payment Methods or Receipt Display */}
        <Grid item xs={12} md={8}>
          {isPaymentPending ? (
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <LockIcon sx={{ color: '#F4C542', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A' }}>
                    Méthode de paiement
                  </Typography>
                </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, ml: 6 }}>
                Sélectionnez votre méthode de paiement préférée
              </Typography>

              <Grid container spacing={2}>
                {paymentMethods.map((method) => (
                  <Grid item xs={12} sm={6} key={method.value}>
                    <Paper
                      onClick={() => setPaymentMethod(method.value)}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        border: paymentMethod === method.value ? '3px solid #F4C542' : '2px solid #e0e0e0',
                        borderRadius: 3,
                        bgcolor: paymentMethod === method.value ? '#fffbf0' : 'white',
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderColor: '#F4C542',
                          bgcolor: '#fffbf0',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(244, 197, 66, 0.2)',
                        },
                        boxShadow: paymentMethod === method.value ? '0 4px 12px rgba(244, 197, 66, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: paymentMethod === method.value ? '#F4C542' : '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s',
                          }}
                        >
                          <Box sx={{ color: paymentMethod === method.value ? '#032B5A' : '#9e9e9e' }}>
                            {method.icon}
                          </Box>
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A' }}>
                              {method.title}
                            </Typography>
                            {paymentMethod === method.value && (
                              <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {method.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {paymentMethod === 'CARD' && (
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID from payment gateway"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Alert
                    severity="warning"
                    icon={<InfoIcon />}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      bgcolor: '#fff3e0',
                      border: '1px solid #ff9800',
                      '& .MuiAlert-icon': {
                        color: '#ff9800',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#032B5A' }}>
                      ⚠️ Payment gateway integration required. For now, enter a transaction ID to simulate payment processing. The payment will remain PENDING until verified.
                    </Typography>
                  </Alert>
                </Box>
              )}

              {(paymentMethod === 'WAFACASH' || paymentMethod === 'BANK_TRANSFER') && (
                <Box sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      border: '2px dashed #e0e0e0',
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      bgcolor: receipt ? '#f5f5f5' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: '#F4C542',
                        bgcolor: '#fffbf0',
                      },
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      id="receipt-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setReceipt(file);
                        }
                      }}
                    />
                    <label htmlFor="receipt-upload">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <CloudUploadIcon sx={{ fontSize: 48, color: receipt ? '#4caf50' : '#9e9e9e' }} />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                          {receipt ? receipt.name : 'Upload Payment Receipt'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {receipt ? 'Receipt uploaded successfully' : 'Click to upload receipt (Image or PDF)'}
                        </Typography>
                      </Box>
                    </label>
                  </Box>
                  <Alert
                    severity="info"
                    icon={<InfoIcon />}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      bgcolor: '#e3f2fd',
                      border: '1px solid #2196f3',
                      '& .MuiAlert-icon': {
                        color: '#2196f3',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#032B5A' }}>
                      {paymentMethod === 'WAFACASH'
                        ? 'Upload your Wafacash payment receipt. The technician will verify and confirm the payment.'
                        : 'Upload your bank transfer receipt. The technician will verify and confirm the payment.'}
                    </Typography>
                  </Alert>
                </Box>
              )}

              {paymentMethod === 'CASH' && (
                <Alert
                  severity="info"
                  icon={<InfoIcon />}
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    bgcolor: '#e8f5e9',
                    border: '1px solid #4caf50',
                    '& .MuiAlert-icon': {
                      color: '#4caf50',
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#032B5A' }}>
                    💵 You will pay in cash when the technician arrives. The technician will confirm receipt of payment.
                  </Typography>
                </Alert>
              )}

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handlePayment}
                  disabled={processing}
                  startIcon={!processing && <PaymentIcon />}
                  sx={{
                    bgcolor: '#F4C542',
                    color: '#032B5A',
                    '&:hover': { bgcolor: '#e0b038' },
                    textTransform: 'none',
                    py: 1.75,
                    borderRadius: 2,
                    fontWeight: 700,
                    boxShadow: 3,
                    fontSize: '1.1rem',
                  }}
                >
                  {processing ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1, color: '#032B5A' }} />
                      Traitement en cours...
                    </>
                  ) : (
                    `Payer ${finalPrice.toFixed(2)} MAD`
                  )}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/client/bookings')}
                  sx={{
                    textTransform: 'none',
                    borderColor: '#9e9e9e',
                    color: '#9e9e9e',
                    '&:hover': { borderColor: '#757575', bgcolor: 'rgba(158, 158, 158, 0.05)' },
                    borderRadius: 2,
                    py: 1.75,
                    minWidth: 120,
                  }}
                >
                  Annuler
                </Button>
              </Box>
            </CardContent>
          </Card>
          ) : isPaymentProcessed ? (
            <>
              {/* Receipt Display Card */}
              {booking.receiptUrl && (
                <Card
                  sx={{
                    boxShadow: 3,
                    borderRadius: 3,
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden',
                    mb: 3,
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <ReceiptIcon sx={{ color: '#F4C542', fontSize: 28 }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A' }}>
                        Reçu de Paiement
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        border: '2px solid #e0e0e0',
                        borderRadius: 2,
                        p: 2,
                        bgcolor: '#f8f9fa',
                        textAlign: 'center',
                      }}
                    >
                      {booking.receiptUrl.endsWith('.pdf') ? (
                        <Box>
                          <PictureAsPdfIcon sx={{ fontSize: 64, color: '#F4C542', mb: 2 }} />
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', mb: 2 }}>
                            Reçu PDF téléchargé
                          </Typography>
                          <Button
                            variant="outlined"
                            href={booking.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              borderColor: '#032B5A',
                              color: '#032B5A',
                              textTransform: 'none',
                              '&:hover': {
                                borderColor: '#021d3f',
                                bgcolor: 'rgba(3, 43, 90, 0.05)',
                              },
                            }}
                          >
                            Voir le reçu
                          </Button>
                        </Box>
                      ) : (
                        <Box>
                          <img
                            src={booking.receiptUrl}
                            alt="Receipt"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '400px',
                              borderRadius: '8px',
                              objectFit: 'contain',
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                    {booking.transactionId && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          ID de transaction: <strong>{booking.transactionId}</strong>
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Payment Status Card */}
              <Card
                sx={{
                  boxShadow: 3,
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden',
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CheckCircleIcon sx={{ color: booking.paymentStatus === 'PAID' ? '#4caf50' : '#ff9800', fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A' }}>
                      Statut du Paiement
                    </Typography>
                  </Box>
                  <Chip
                    label={booking.paymentStatus === 'PAID' ? 'Payé' : booking.paymentStatus === 'PENDING' ? 'En attente' : 'Non payé'}
                    color={booking.paymentStatus === 'PAID' ? 'success' : booking.paymentStatus === 'PENDING' ? 'warning' : 'default'}
                    sx={{ mb: 2, fontWeight: 700 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Méthode: {booking.paymentMethod === 'CASH' ? 'Espèces' : booking.paymentMethod === 'CARD' ? 'Carte bancaire' : booking.paymentMethod === 'WAFACASH' ? 'Wafacash' : 'Virement bancaire'}
                  </Typography>
                </CardContent>
              </Card>
            </>
          ) : null}

          {/* Booking Details Card */}
          <Card
            sx={{
              boxShadow: 3,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3, color: '#032B5A' }}>
                Détails de la réservation
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BuildIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Service
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', ml: 4 }}>
                    {booking.category?.name || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Technicien
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 4 }}>
                    {booking.technicianProfile?.profilePictureUrl && (
                      <Avatar
                        src={booking.technicianProfile.profilePictureUrl}
                        sx={{ width: 32, height: 32, border: '2px solid #F4C542' }}
                      >
                        {booking.technician?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                      {booking.technician?.name || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOnIcon sx={{ color: '#F4C542', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Adresse
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#032B5A', ml: 4 }}>
                    {booking.address}, {booking.city}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Review Section */}
          {canReview && (
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                mt: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <StarIcon sx={{ color: '#F4C542', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A' }}>
                    Donner votre avis
                  </Typography>
                </Box>
                {reviewSuccess && (
                  <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    Votre avis a été soumis avec succès!
                  </Alert>
                )}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#032B5A' }}>
                    Note
                  </Typography>
                  <Rating
                    value={reviewRating}
                    onChange={(_, newValue) => setReviewRating(newValue || 5)}
                    size="large"
                    sx={{ color: '#F4C542' }}
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#032B5A' }}>
                    Commentaire (optionnel)
                  </Typography>
                  <TextareaAutosize
                    minRows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Partagez votre expérience..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                </Box>
                <Button
                  variant="contained"
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  startIcon={!submittingReview && <StarIcon />}
                  sx={{
                    bgcolor: '#F4C542',
                    color: '#032B5A',
                    '&:hover': { bgcolor: '#e0b038' },
                    textTransform: 'none',
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                    fontWeight: 700,
                  }}
                >
                  {submittingReview ? 'Envoi...' : 'Soumettre l\'avis'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Existing Review Display */}
          {existingReview && (
            <Card
              sx={{
                boxShadow: 3,
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                overflow: 'hidden',
                mt: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <StarIcon sx={{ color: '#F4C542', fontSize: 28 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#032B5A' }}>
                    Votre Avis
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Rating value={existingReview.rating} readOnly size="large" sx={{ color: '#F4C542' }} />
                </Box>
                {existingReview.comment && (
                  <Typography variant="body1" sx={{ color: '#032B5A', mb: 2 }}>
                    {existingReview.comment}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Publié le {new Date(existingReview.createdAt).toLocaleDateString('fr-FR')}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Panel - Summary */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              position: { md: 'sticky' },
              top: { md: 100 },
              boxShadow: 3,
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#032B5A', mb: 3 }}>
                Récapitulatif
              </Typography>

              <Divider sx={{ mb: 3, borderColor: '#e0e0e0' }} />

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Service
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                  {booking.category?.name || 'N/A'}
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AttachMoneyIcon sx={{ color: '#F4C542', fontSize: 28 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Montant total
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#F4C542',
                    ml: 4,
                    textShadow: '0 2px 4px rgba(244, 197, 66, 0.2)',
                  }}
                >
                  {finalPrice.toFixed(2)} MAD
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

              <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LockIcon sx={{ color: '#4caf50', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                    Paiement sécurisé
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Vos informations de paiement sont protégées et sécurisées.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentPage;
