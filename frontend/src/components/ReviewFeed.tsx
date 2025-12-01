import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  Avatar,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { reviewsApi, Review } from '../api/reviews';
import { format } from 'date-fns';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';

interface ReviewWithDetails extends Review {
  reviewerName?: string;
  revieweeName?: string;
  bookingPhotos?: string[];
}

const ReviewFeed: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reviewsApi.getAll();
      setReviews(data.slice(0, 6)); // Show latest 6 reviews
      // Don't show error if data is just empty array
      if (data.length === 0) {
        setError(''); // Clear any previous error
      }
    } catch (err: any) {
      // Only show error if it's a real error, not just empty data
      if (err.response?.status !== 404 && err.response?.status !== 200) {
        console.error('Error loading reviews:', err);
        setError(err.response?.data?.error || 'Failed to load reviews');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress sx={{ color: '#F4C542' }} size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  if (reviews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
          Aucun avis pour le moment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Soyez le premier à laisser un avis après votre service!
        </Typography>
      </Box>
    );
  }

  // Calculate average rating from all reviews
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <Box sx={{ mb: 10 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
          Avis Clients
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
          Découvrez ce que nos clients disent de nos services
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ fontSize: 32, color: '#F4C542' }} />
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#032B5A' }}>
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
              / 5.0
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ borderColor: '#e0e0e0', height: 40 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating 
              value={averageRating} 
              readOnly 
              precision={0.1}
              size="large"
              sx={{ 
                '& .MuiRating-iconFilled': { color: '#F4C542' },
                '& .MuiRating-iconEmpty': { color: '#e0e0e0' },
              }}
            />
            <Chip
              label={`${reviews.length} avis vérifiés`}
              sx={{ 
                bgcolor: '#F4C542', 
                color: '#032B5A', 
                fontWeight: 700,
                fontSize: '0.875rem',
                px: 2,
                py: 0.5,
                height: 'auto',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Reviews Grid */}
      <Grid container spacing={3}>
        {reviews.map((review) => {
          const imageIndex = (review.reviewerId?.charCodeAt(0) || 1) % 8 + 1;
          const reviewerImage = `/images/technicians/technician_${imageIndex}.svg`;

          return (
            <Grid item xs={12} md={6} key={review.id}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid #e0e0e0',
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                    borderColor: '#F4C542',
                  },
                }}
              >
                {/* Quote Icon */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: 24,
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: '#F4C542',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(244, 197, 66, 0.3)',
                    zIndex: 1,
                  }}
                >
                  <FormatQuoteIcon sx={{ fontSize: 28, color: '#032B5A' }} />
                </Box>

                <CardContent sx={{ p: 4, pt: 5 }}>
                  {/* Rating */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Rating 
                      value={review.rating} 
                      readOnly 
                      size="small"
                      sx={{ 
                        '& .MuiRating-iconFilled': { color: '#F4C542' },
                        '& .MuiRating-iconEmpty': { color: '#e0e0e0' },
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#F4C542', ml: 0.5 }}>
                      {review.rating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      / 5
                    </Typography>
                  </Box>

                  {/* Comment */}
                  {review.comment && (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 3, 
                        color: '#032B5A', 
                        lineHeight: 1.8,
                        fontStyle: 'italic',
                        fontSize: '1.05rem',
                        fontWeight: 500,
                      }}
                    >
                      "{review.comment}"
                    </Typography>
                  )}

                  {/* Photos */}
                  {review.bookingPhotos && review.bookingPhotos.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                      {review.bookingPhotos.slice(0, 3).map((photo, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={photo}
                          alt={`Photo ${idx + 1}`}
                          sx={{
                            width: 70,
                            height: 70,
                            objectFit: 'cover',
                            borderRadius: 2,
                            border: '2px solid #e0e0e0',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { 
                              opacity: 0.8,
                              borderColor: '#F4C542',
                              transform: 'scale(1.05)',
                            },
                          }}
                          onClick={() => window.open(photo, '_blank')}
                        />
                      ))}
                      {review.bookingPhotos.length > 3 && (
                        <Box
                          sx={{
                            width: 70,
                            height: 70,
                            borderRadius: 2,
                            border: '2px dashed #e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#f5f5f5',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: '#F4C542',
                              bgcolor: '#fffbf0',
                            },
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 600, color: '#032B5A' }}>
                            +{review.bookingPhotos.length - 3}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

                  {/* Reviewer Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={reviewerImage}
                        alt={review.reviewerName}
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: '#032B5A',
                          border: '3px solid #F4C542',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      >
                        {review.reviewerName?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#032B5A', mb: 0.5 }}>
                          {review.reviewerName || 'Client'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(review.createdAt), 'dd MMMM yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      icon={<BuildIcon sx={{ fontSize: 18, color: '#032B5A' }} />}
                      label={review.revieweeName || 'Technicien'}
                      size="medium"
                      sx={{ 
                        bgcolor: '#f8f9fa',
                        color: '#032B5A',
                        fontWeight: 600,
                        border: '1px solid #e0e0e0',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#F4C542',
                          color: '#032B5A',
                          borderColor: '#F4C542',
                        },
                      }}
                      onClick={() => {
                        if (review.revieweeId) {
                          navigate(`/technician/view/${review.revieweeId}`);
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ReviewFeed;
