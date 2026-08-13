import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, Avatar, Box, Chip } from '@mui/material';
import api from '../api';
import { useTranslation } from '../context/LanguageContext';

const UserManagement = () => {
  const { t } = useTranslation();
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
      setError(t('admin.errorUserDirectory'));
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
        <Typography>{t('admin.loadingUserDirectory')}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
        {t('admin.userDirectoryTitle')}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.userProfile')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.usersTableEmail')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('profile.mobileNumber')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.usersTableRole')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="center">{t('admin.usersTableStatus')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }} src={u.profileImageUrl ? `${process.env.REACT_APP_API_URL || ""}${u.profileImageUrl}` : undefined}>
                      {u.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>{u.fullName}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.mobileNumber || t('admin.na')}</TableCell>
                <TableCell>
                  <Chip label={u.role} size="small" color={u.role === 'ADMIN' ? 'error' : u.role === 'ORG_ADMIN' ? 'secondary' : 'default'} />
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    label={u.active ? t('admin.statusActive') : t('admin.statusSuspended')} 
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
