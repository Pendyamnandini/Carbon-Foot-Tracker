import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, Button, Box, Stack, MenuItem, TextField } from '@mui/material';
import api from '../api';
import { useTranslation } from '../context/LanguageContext';

const FeedbackManagement = () => {
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/feedbacks');
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch (e) {
      setError(t('admin.feedbackFailRetrieve'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/api/admin/feedbacks/${id}/status?status=${status}`);
      if (res.data.success) {
        setSuccess(t('admin.feedbackSuccessUpdate'));
        fetchFeedbacks();
      }
    } catch (err) {
      setError(t('admin.feedbackFailUpdate'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED': return 'success.main';
      case 'IN_PROGRESS': return 'secondary.main';
      default: return 'warning.main';
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (filterStatus === 'ALL') return true;
    return f.status === filterStatus;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>{t('admin.feedbackLoading')}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          {t('admin.feedbackTitle')}
        </Typography>

        <TextField
          select
          label={t('admin.filterStatus')}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ width: 180 }}
          size="small"
        >
          <MenuItem value="ALL">{t('admin.allFeedback')}</MenuItem>
          <MenuItem value="OPEN">{t('admin.statusOpen')}</MenuItem>
          <MenuItem value="IN_PROGRESS">{t('admin.statusInProgress')}</MenuItem>
          <MenuItem value="RESOLVED">{t('admin.statusResolved')}</MenuItem>
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.feedbackTableDate')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.feedbackTableUser')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.feedbackTableCategory')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('admin.feedbackTableText')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="center">{t('admin.supportStatus')}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="center">{t('admin.supportActions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFeedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">{t('admin.noFeedbacks')}</TableCell>
              </TableRow>
            ) : (
              filteredFeedbacks.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>{new Date(f.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{f.userName}</TableCell>
                  <TableCell>{f.category}</TableCell>
                  <TableCell>{f.feedbackText}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: getStatusColor(f.status) }}>
                    {f.status}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {f.status === 'OPEN' && (
                        <Button variant="outlined" color="secondary" size="small" onClick={() => handleUpdateStatus(f.id, 'IN_PROGRESS')}>
                          {t('admin.statusInProgress')}
                        </Button>
                      )}
                      {f.status !== 'RESOLVED' && (
                        <Button variant="contained" color="success" size="small" onClick={() => handleUpdateStatus(f.id, 'RESOLVED')}>
                          {t('admin.resolveBtn')}
                        </Button>
                      )}
                      {f.status === 'RESOLVED' && (
                        <Typography variant="caption" color="text.secondary">{t('admin.completed')}</Typography>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default FeedbackManagement;
