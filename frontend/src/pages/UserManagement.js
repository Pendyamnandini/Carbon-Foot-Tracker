import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, Avatar, Box, Chip } from '@mui/material';
import api from '../api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (e) {
      setError('Could not retrieve user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Loading user directory...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
        User Account Directory
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>User Profile</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Email Address</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Mobile</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Platform Role</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="center">Account Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }} src={u.profileImageUrl ? `http://127.0.0.1:8080${u.profileImageUrl}` : undefined}>
                      {u.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>{u.fullName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.mobileNumber || 'N/A'}</TableCell>
                <TableCell>
                  <Chip label={u.role} size="small" color={u.role === 'ADMIN' ? 'error' : u.role === 'ORG_ADMIN' ? 'secondary' : 'default'} />
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={u.active ? 'ACTIVE' : 'SUSPENDED'} 
                    size="small" 
                    color={u.active ? 'success' : 'error'} 
                    variant="outlined" 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default UserManagement;
