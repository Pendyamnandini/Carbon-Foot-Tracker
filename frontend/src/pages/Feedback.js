import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Grid, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../api';

const CATEGORIES = ['BUG', 'FEATURE_REQUEST', 'UI_FEEDBACK', 'GENERAL'];

const Feedback = () => {
  const [feedbackText, setFeedbackText] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [feedbacks, setFeedbacks] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/api/feedback');
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch (e) {
      setError('Could not retrieve feedback history.');
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/api/feedback', { feedbackText, category });
      if (res.data.success) {
        setSuccess('Feedback submitted successfully! Thank you.');
        setFeedbackText('');
        fetchFeedbacks();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED': return 'success.main';
      case 'IN_PROGRESS': return 'secondary.main';
      default: return 'warning.main';
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
        User Feedback
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {/* Submission Card */}
      <Card sx={{ mb: 5 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
            Submit Feedback or Report a Bug
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Category"
                  fullWidth
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Feedback Details"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* History */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Your Feedback History
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Details</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No feedback submitted yet.</TableCell>
              </TableRow>
            ) : (
              feedbacks.map((f) => (
                <TableRow key={f.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{new Date(f.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{f.category}</TableCell>
                  <TableCell>{f.feedbackText}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: getStatusColor(f.status) }}>
                    {f.status}
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

export default Feedback;
