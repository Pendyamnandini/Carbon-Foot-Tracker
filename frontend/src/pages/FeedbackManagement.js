import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Alert, Button, Box, Stack, MenuItem, TextField } from '@mui/material';
import api from '../api';

const FeedbackManagement = () => {
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
      setError('Could not retrieve user feedbacks.');
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
        setSuccess('Feedback status updated successfully!');
        fetchFeedbacks();
      }
    } catch (err) {
      setError('Failed to update status.');
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
        <Typography>Loading user feedbacks...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          User Feedback Management
        </Typography>

        <TextField
          select
          label="Filter Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={{ width: 180 }}
          size="small"
        >
          <MenuItem value="ALL">All Feedback</MenuItem>
          <MenuItem value="OPEN">Open</MenuItem>
          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
          <MenuItem value="RESOLVED">Resolved</MenuItem>
        </TextField>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Content</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="center">Status</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="center">Resolution Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredFeedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No feedbacks match selection.</TableCell>
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
                          In Progress
                        </Button>
                      )}
                      {f.status !== 'RESOLVED' && (
                        <Button variant="contained" color="success" size="small" onClick={() => handleUpdateStatus(f.id, 'RESOLVED')}>
                          Resolve
                        </Button>
                      )}
                      {f.status === 'RESOLVED' && (
                        <Typography variant="caption" color="text.secondary">Completed</Typography>
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
