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
} from '@mui/material';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      const data = await adminApi.getTechnicians();
      setTechnicians(data);
    } catch (error) {
      console.error('Failed to load technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await adminApi.updateVerificationStatus(id, status);
      loadTechnicians();
    } catch (error) {
      console.error('Failed to update verification status:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Gestion des techniciens
      </Typography>

      {loading ? (
        <Typography>Chargement...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Ville</TableCell>
                <TableCell>Compétences</TableCell>
                <TableCell>Expérience</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {technicians.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell>{tech.user.name}</TableCell>
                  <TableCell>{tech.user.email}</TableCell>
                  <TableCell>{tech.user.phone}</TableCell>
                  <TableCell>{tech.user.city}</TableCell>
                  <TableCell>{tech.skills.join(', ')}</TableCell>
                  <TableCell>{tech.yearsOfExperience} ans</TableCell>
                  <TableCell>
                    <Chip
                      label={tech.verificationStatus}
                      color={
                        tech.verificationStatus === 'APPROVED'
                          ? 'success'
                          : tech.verificationStatus === 'REJECTED'
                          ? 'error'
                          : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {tech.verificationStatus === 'PENDING' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleVerify(tech.id, 'APPROVED')}
                          sx={{ textTransform: 'none' }}
                        >
                          Approuver
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => handleVerify(tech.id, 'REJECTED')}
                          sx={{ textTransform: 'none' }}
                        >
                          Rejeter
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminTechnicians;

