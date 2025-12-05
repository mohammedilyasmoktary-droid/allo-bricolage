import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PendingIcon from '@mui/icons-material/Pending';
import BlockIcon from '@mui/icons-material/Block';
import { adminApi } from '../../api/admin';

interface Technician {
  id: string;
  userId: string;
  skills: string[];
  yearsOfExperience: number;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: {
    name: string;
    email: string;
    phone: string;
    city: string;
  };
}

const AdminTechnicians: React.FC = () => {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadTechnicians();
  }, []);

  useEffect(() => {
    filterTechnicians();
  }, [technicians, searchTerm, statusFilter]);

  const loadTechnicians = async () => {
    try {
      const data = await adminApi.getTechnicians();
      setTechnicians(data);
      setFilteredTechnicians(data);
    } catch (error) {
      console.error('Failed to load technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTechnicians = () => {
    let filtered = [...technicians];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tech) =>
          tech.user.name.toLowerCase().includes(term) ||
          tech.user.email.toLowerCase().includes(term) ||
          tech.user.city.toLowerCase().includes(term) ||
          tech.skills.some((skill) => skill.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((tech) => tech.verificationStatus === statusFilter);
    }

    setFilteredTechnicians(filtered);
  };

  const handleVerify = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await adminApi.updateVerificationStatus(id, status);
      loadTechnicians();
    } catch (error) {
      console.error('Failed to update verification status:', error);
    }
  };

  const stats = {
    total: technicians.length,
    approved: technicians.filter((t) => t.verificationStatus === 'APPROVED').length,
    pending: technicians.filter((t) => t.verificationStatus === 'PENDING').length,
    rejected: technicians.filter((t) => t.verificationStatus === 'REJECTED').length,
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      APPROVED: 'Approuvé',
      PENDING: 'En attente',
      REJECTED: 'Rejeté',
    };
    return labels[status] || status;
  };

  return (
    <Box sx={{ pb: 4, bgcolor: '#fafbfc', minHeight: '100vh', py: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: '#032B5A',
              fontSize: { xs: '1.75rem', md: '2.25rem' }
            }}
          >
            Gestion des techniciens
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e8eaed',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(3, 43, 90, 0.15)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: '#032B5A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 28, color: 'white' }} />
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: '#032B5A' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e8eaed',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(76, 175, 80, 0.15)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: '#4caf50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <VerifiedUserIcon sx={{ fontSize: 28, color: 'white' }} />
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: '#4caf50' }}>
                  {stats.approved}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Approuvés
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e8eaed',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(244, 197, 66, 0.15)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: '#F4C542',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PendingIcon sx={{ fontSize: 28, color: '#032B5A' }} />
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: '#F4C542' }}>
                  {stats.pending}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  En attente
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                bgcolor: 'white',
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e8eaed',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(244, 67, 54, 0.15)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: '#f44336',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BlockIcon sx={{ fontSize: 28, color: 'white' }} />
                  </Box>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: '#f44336' }}>
                  {stats.rejected}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  Rejetés
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter Bar */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e8eaed',
            bgcolor: 'white',
          }}
        >
          <CardContent sx={{ p: 3.5 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par nom, email, ville ou compétence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#9e9e9e' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#fafbfc',
                      border: '1px solid #e8eaed',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                        borderColor: '#F4C542',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'white',
                        borderColor: '#F4C542',
                        boxShadow: '0 0 0 3px rgba(244, 197, 66, 0.1)',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#032B5A', fontWeight: 500 }}>Statut</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Statut"
                    sx={{
                      borderRadius: 2,
                      bgcolor: '#fafbfc',
                      border: '1px solid #e8eaed',
                      '&:hover': {
                        borderColor: '#F4C542',
                      },
                      '&.Mui-focused': {
                        borderColor: '#F4C542',
                      },
                    }}
                  >
                    <MenuItem value="all">Tous</MenuItem>
                    <MenuItem value="APPROVED">Approuvé</MenuItem>
                    <MenuItem value="PENDING">En attente</MenuItem>
                    <MenuItem value="REJECTED">Rejeté</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Box
                  sx={{
                    bgcolor: '#f8f9fa',
                    borderRadius: 2,
                    p: 1.5,
                    textAlign: 'center',
                    border: '1px solid #e8eaed',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#032B5A', mb: 0.5 }}>
                    {filteredTechnicians.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    technicien{filteredTechnicians.length > 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Table Section */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#032B5A' }} />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e8eaed',
            overflow: 'hidden',
            bgcolor: 'white',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafbfc', borderBottom: '2px solid #e8eaed' }}>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2.5, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Technicien
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2.5, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Contact
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2.5, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Localisation
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2.5, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Compétences
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2.5, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Expérience
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2.5, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Statut
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2.5, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTechnicians.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      Aucun technicien trouvé
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTechnicians.map((tech) => (
                  <TableRow
                    key={tech.id}
                    sx={{
                      '&:hover': {
                        bgcolor: '#fafbfc',
                      },
                      borderBottom: '1px solid #e8eaed',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell sx={{ py: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: '#032B5A',
                            color: '#F4C542',
                            width: 48,
                            height: 48,
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            boxShadow: '0 2px 8px rgba(3, 43, 90, 0.2)',
                          }}
                        >
                          {tech.user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A', fontSize: '0.95rem' }}>
                          {tech.user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5, color: '#032B5A', fontWeight: 500 }}>
                          {tech.user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                          {tech.user.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#032B5A' }}>
                        {tech.user.city}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxWidth: 280 }}>
                        {tech.skills.slice(0, 2).map((skill, idx) => (
                          <Chip
                            key={idx}
                            label={skill}
                            size="small"
                            sx={{
                              bgcolor: '#f8f9fa',
                              color: '#032B5A',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              border: '1px solid #e8eaed',
                              height: 26,
                              borderRadius: 1.5,
                            }}
                          />
                        ))}
                        {tech.skills.length > 2 && (
                          <Chip
                            label={`+${tech.skills.length - 2}`}
                            size="small"
                            sx={{
                              bgcolor: '#F4C542',
                              color: '#032B5A',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              height: 26,
                              borderRadius: 1.5,
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#032B5A' }}>
                        {tech.yearsOfExperience} ans
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Chip
                        label={getStatusLabel(tech.verificationStatus)}
                        size="small"
                        icon={
                          tech.verificationStatus === 'APPROVED' ? (
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                          ) : tech.verificationStatus === 'REJECTED' ? (
                            <CancelIcon sx={{ fontSize: 16 }} />
                          ) : undefined
                        }
                        sx={{
                          bgcolor:
                            tech.verificationStatus === 'APPROVED'
                              ? '#e8f5e9'
                              : tech.verificationStatus === 'REJECTED'
                              ? '#ffebee'
                              : '#fff3e0',
                          color:
                            tech.verificationStatus === 'APPROVED'
                              ? '#2e7d32'
                              : tech.verificationStatus === 'REJECTED'
                              ? '#c62828'
                              : '#e65100',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: '1px solid',
                          borderColor:
                            tech.verificationStatus === 'APPROVED'
                              ? '#4caf50'
                              : tech.verificationStatus === 'REJECTED'
                              ? '#f44336'
                              : '#F4C542',
                          height: 28,
                          '& .MuiChip-icon': {
                            color: 'inherit',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {tech.verificationStatus === 'PENDING' ? (
                          <>
                            <Tooltip title="Approuver">
                              <IconButton
                                size="small"
                                onClick={() => handleVerify(tech.id, 'APPROVED')}
                                sx={{
                                  bgcolor: '#4caf50',
                                  color: 'white',
                                  width: 36,
                                  height: 36,
                                  '&:hover': {
                                    bgcolor: '#388e3c',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Rejeter">
                              <IconButton
                                size="small"
                                onClick={() => handleVerify(tech.id, 'REJECTED')}
                                sx={{
                                  bgcolor: '#f44336',
                                  color: 'white',
                                  width: 36,
                                  height: 36,
                                  '&:hover': {
                                    bgcolor: '#d32f2f',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Voir le profil">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/technician/view/${tech.id}`)}
                              sx={{
                                bgcolor: '#032B5A',
                                color: 'white',
                                width: 36,
                                height: 36,
                                '&:hover': {
                                  bgcolor: '#021d3f',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminTechnicians;

