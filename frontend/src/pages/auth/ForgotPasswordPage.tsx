import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { authApi } from '../../api/auth';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      setSuccess(true);
      
      // In development, show the reset link if provided
      if (response.resetLink && process.env.NODE_ENV === 'development') {
        console.log('Reset link:', response.resetLink);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Échec de l\'envoi de l\'email de réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', boxShadow: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/login')}
            sx={{ mb: 3, textTransform: 'none', color: '#032B5A' }}
          >
            Retour à la connexion
          </Button>

          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#032B5A', mb: 1 }}>
            Mot de passe oublié?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </Typography>

          {success ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Un email de réinitialisation a été envoyé à {email}. Veuillez vérifier votre boîte de réception.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: '#F4C542',
                  color: '#032B5A',
                  '&:hover': { bgcolor: '#e0b038' },
                  textTransform: 'none',
                  py: 1.5,
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Envoyer le lien de réinitialisation'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;


