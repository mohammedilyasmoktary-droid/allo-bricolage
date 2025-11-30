import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            bgcolor: '#f5f5f5',
            p: 2,
          }}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <ErrorOutlineIcon sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: '#032B5A', mb: 2 }}>
                Une erreur s'est produite
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {this.state.error?.message || 'Une erreur inattendue s\'est produite'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
                sx={{
                  bgcolor: '#032B5A',
                  '&:hover': { bgcolor: '#021d3f' },
                  textTransform: 'none',
                }}
              >
                Recharger la page
              </Button>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

