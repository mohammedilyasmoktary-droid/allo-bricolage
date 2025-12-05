import React, { useState, useEffect } from 'react';
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
    <Box sx={{ pb: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#032B5A',
            mb: 3,
            fontSize: { xs: '1.75rem', md: '2rem' }
          }}
        >
          Gestion des techniciens
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                bgcolor: '#032B5A',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(3, 43, 90, 0.2)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                bgcolor: '#4caf50',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {stats.approved}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Approuvés
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                bgcolor: '#F4C542',
                color: '#032B5A',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(244, 197, 66, 0.2)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {stats.pending}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  En attente
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                bgcolor: '#f44336',
                color: 'white',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                  {stats.rejected}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Rejetés
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter Bar */}
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par nom, email, ville ou compétence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#fafbfc',
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                      },
                      '&.Mui-focused': {
                        bgcolor: 'white',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Statut"
                    sx={{
                      borderRadius: 2,
                      bgcolor: '#fafbfc',
                    }}
                  >
                    <MenuItem value="all">Tous</MenuItem>
                    <MenuItem value="APPROVED">Approuvé</MenuItem>
                    <MenuItem value="PENDING">En attente</MenuItem>
                    <MenuItem value="REJECTED">Rejeté</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  {filteredTechnicians.length} technicien{filteredTechnicians.length > 1 ? 's' : ''} trouvé{filteredTechnicians.length > 1 ? 's' : ''}
                </Typography>
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
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafbfc' }}>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2 }}>Technicien</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2 }}>Localisation</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2 }}>Compétences</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2 }}>Expérience</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#032B5A', py: 2, textAlign: 'center' }}>Actions</TableCell>
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
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: '#032B5A',
                            color: '#F4C542',
                            width: 40,
                            height: 40,
                            fontWeight: 700,
                          }}
                        >
                          {tech.user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#032B5A' }}>
                          {tech.user.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5, color: '#032B5A' }}>
                          {tech.user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tech.user.phone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {tech.user.city}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 250 }}>
                        {tech.skills.slice(0, 2).map((skill, idx) => (
                          <Chip
                            key={idx}
                            label={skill}
                            size="small"
                            sx={{
                              bgcolor: '#f8f9fa',
                              color: '#032B5A',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              border: '1px solid #e8eaed',
                              height: 24,
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
                              fontWeight: 600,
                              height: 24,
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {tech.yearsOfExperience} ans
                      </Typography>
                    </TableCell>
                    <TableCell>
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
                          '& .MuiChip-icon': {
                            color: 'inherit',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
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
                                  '&:hover': {
                                    bgcolor: '#388e3c',
                                  },
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
                                  '&:hover': {
                                    bgcolor: '#d32f2f',
                                  },
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
                              sx={{
                                bgcolor: '#032B5A',
                                color: 'white',
                                '&:hover': {
                                  bgcolor: '#021d3f',
                                },
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

