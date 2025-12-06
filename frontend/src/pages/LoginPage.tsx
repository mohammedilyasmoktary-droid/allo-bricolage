import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset loading state on mount to prevent stuck state
  useEffect(() => {
    setLoading(false);
  }, []);

  // Redirect to unified dashboard after successful login
  // Only redirect if we're on the login page (not already redirected)
  useEffect(() => {
    if (user && window.location.pathname === '/login') {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', email.trim());
      await login(email.trim(), password);
      console.log('Login successful, navigation will happen automatically via useEffect');
      // Navigation will be handled by useEffect that watches user changes
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        code: err.code,
        status: err.response?.status,
      });
      
      // Handle different error formats
      let errorMessage = 'Erreur de connexion. Vérifiez vos identifiants.';
      
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error') || err.message?.includes('ERR_NETWORK')) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré sur le port 5000.';
      } else if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
        errorMessage = 'La connexion a expiré. Veuillez réessayer.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.map((e: any) => e.msg || e.message).join(', ');
      }
      
      setError(errorMessage);
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        py: 4,
        px: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          borderRadius: 4,
          border: '1px solid #e0e0e0',
        }}
      >
        <CardContent sx={{ p: 5 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
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
              <LoginIcon sx={{ fontSize: 36, color: '#032B5A' }} />
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#032B5A', mb: 1 }}>
              Connexion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connectez-vous à votre compte
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: '#f44336',
                },
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#F4C542' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#F4C542',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#F4C542',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#F4C542',
                },
              }}
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#F4C542' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                      sx={{ color: '#032B5A' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#F4C542',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#F4C542',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#F4C542',
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!isFormValid || loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              sx={{
                bgcolor: '#032B5A',
                color: 'white',
                '&:hover': {
                  bgcolor: '#021d3f',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e',
                },
                textTransform: 'none',
                borderRadius: 2,
                py: 1.5,
                mb: 3,
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(3, 43, 90, 0.3)',
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/forgot-password')}
              disabled={loading}
              sx={{
                textDecoration: 'none',
                color: '#032B5A',
                fontWeight: 600,
                '&:hover': {
                  color: '#F4C542',
                  textDecoration: 'underline',
                },
              }}
            >
              Mot de passe oublié?
            </Link>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              pt: 2,
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Pas encore de compte?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/register')}
                disabled={loading}
                sx={{
                  textDecoration: 'none',
                  color: '#032B5A',
                  fontWeight: 700,
                  '&:hover': {
                    color: '#F4C542',
                    textDecoration: 'underline',
                  },
                }}
              >
                S'inscrire
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
