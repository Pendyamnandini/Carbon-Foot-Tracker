import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Grid, LinearProgress, Paper, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';
import StarIcon from '@mui/icons-material/Star';
import DateRangeIcon from '@mui/icons-material/DateRange';
import api from '../api';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [goalTitle, setGoalTitle] = useState('');
  const [targetReduction, setTargetReduction] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10));

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/api/goals');
      if (res.data.success) {
        setGoals(res.data.data);
      }
    } catch (e) {
      setError('Could not retrieve goals.');
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (parseFloat(targetReduction) <= 0 || parseFloat(targetReduction) > 100) {
      setError('Target reduction percentage must be between 1% and 100%');
      return;
    }

    setLoading(true);

    const payload = {
      goalTitle,
      targetReductionPercentage: parseFloat(targetReduction),
      startDate,
      targetDate
    };

    try {
      const res = await api.post('/api/goals', payload);
      if (res.data.success) {
        setSuccess('Goal established successfully!');
        setGoalTitle('');
        setTargetReduction('');
        fetchGoals();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to establish goal.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.delete(`/api/goals/${id}`);
      if (res.data.success) {
        setSuccess('Goal deleted successfully!');
        fetchGoals();
      }
    } catch (err) {
      setError('Goal deletion failed.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
        Sustainability Goals
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {/* Goal Creator Card */}
      <Card sx={{ mb: 5 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
            🎯 Establish Custom Sustainability Goal
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Goal Title (e.g. 15% Commute Reduction)"
                  fullWidth
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Target Reduction (%)"
                  type="number"
                  fullWidth
                  required
                  value={targetReduction}
                  onChange={(e) => setTargetReduction(e.target.value)}
                  inputProps={{ min: '1', max: '100', step: 'any' }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Target End Date"
                  type="date"
                  fullWidth
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" color="primary" disabled={loading} startIcon={<FlagIcon />}>
                  {loading ? 'Creating...' : 'Create Goal'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Goals Tracker List */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
        Your Goals & Target Progress
      </Typography>

      <Stack spacing={3}>
        {goals.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(17,24,39,0.3)', borderColor: 'divider' }}>
            <Typography color="text.secondary">You don't have any active carbon reduction goals.</Typography>
          </Paper>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id} sx={{ p: 3, transition: 'all 0.3s ease-in-out', borderLeft: goal.status === 'COMPLETED' ? '6px solid #10b981' : '6px solid #06b6d4' }}>
              <Grid container spacing={2} alignItems="center">
                {/* Goal Meta Details */}
                <Grid item xs={12} sm={7}>
                  <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                    <Typography variant="h6" fontWeight={800} color="text.primary">
                      {goal.goalTitle}
                    </Typography>
                    <Chip 
                      label={goal.status} 
                      size="small" 
                      color={goal.status === 'COMPLETED' ? 'primary' : 'secondary'}
                      sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
                    />
                  </Box>
                  <Stack direction="row" spacing={3} sx={{ color: 'text.secondary', mt: 1 }}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <StarIcon sx={{ fontSize: '1rem', color: 'warning.main' }} />
                      <Typography variant="caption" fontWeight={600}>
                        Target: {goal.targetReductionPercentage}% Reduction
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <DateRangeIcon sx={{ fontSize: '1rem' }} />
                      <Typography variant="caption">
                        {goal.startDate} to {goal.targetDate}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Trash Icon */}
                <Grid item xs={12} sm={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 1 }}>
                  <IconButton color="error" onClick={() => handleDelete(goal.id)} size="small" sx={{ '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.08)' } }}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>

                {/* Progress Bar Row */}
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ width: '100%' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={goal.currentProgress} 
                        color={goal.status === 'COMPLETED' ? 'primary' : 'secondary'}
                        sx={{ height: 12, borderRadius: 6, bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                      />
                    </Box>
                    <Box sx={{ minWidth: 45 }}>
                      <Typography variant="body2" fontWeight={800} color={goal.status === 'COMPLETED' ? 'primary.main' : 'secondary.main'}>
                        {goal.currentProgress.toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          ))
        )}
      </Stack>
    </Container>
  );
};

export default Goals;
