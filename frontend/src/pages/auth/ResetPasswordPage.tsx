import React, { useState, useEffect } from 'react';
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
import { useNavigate, useSearchParams } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { authApi } from '../../api/auth';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token de réinitialisation manquant. Veuillez utiliser le lien fourni dans votre email.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!token) {
      setError('Token de réinitialisation manquant');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Échec de la réinitialisation du mot de passe');
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
            Réinitialiser le mot de passe
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Entrez votre nouveau mot de passe ci-dessous.
          </Typography>

          {success ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Votre mot de passe a été réinitialisé avec succès. Redirection vers la page de connexion...
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Nouveau mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                helperText="Minimum 6 caractères"
              />

              <TextField
                fullWidth
                label="Confirmer le mot de passe"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
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
                disabled={loading || !token}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Réinitialiser le mot de passe'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPasswordPage;




