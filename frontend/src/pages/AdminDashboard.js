import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Alert, CircularProgress, Stack, Paper, Divider } from '@mui/material';
import api from '../api';
import PeopleIcon from '@mui/icons-material/People';
import SpeedIcon from '@mui/icons-material/Speed';
import ForumIcon from '@mui/icons-material/Forum';
import StarIcon from '@mui/icons-material/Star';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/admin/reports');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      setError('Could not retrieve platform metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
        Platform Administration
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {data && (
        <Grid container spacing={3}>
          {/* User Metrics */}
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card-hover">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Users</Typography>
                    <Typography variant="h4" fontWeight={800} mt={1}>{data.totalUsers}</Typography>
                    <Typography variant="caption" color="primary">{data.newUsers} registered this week</Typography>
                  </Box>
                  <PeopleIcon color="primary" sx={{ fontSize: 32 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Activity Metrics */}
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card-hover">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Activities logged</Typography>
                    <Typography variant="h4" fontWeight={800} mt={1}>{data.totalActivities}</Typography>
                    <Typography variant="caption" color="text.secondary">Active user average: {data.averageCarbonFootprint.toFixed(1)} kg</Typography>
                  </Box>
                  <SpeedIcon color="secondary" sx={{ fontSize: 32 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Feedback Metrics */}
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card-hover">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>User Feedback</Typography>
                    <Typography variant="h4" fontWeight={800} mt={1}>{data.totalFeedback}</Typography>
                    <Typography variant="caption" color="warning.main">{data.pendingFeedback} unresolved queries</Typography>
                  </Box>
                  <ForumIcon color="warning" sx={{ fontSize: 32 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Platform Performance */}
          <Grid item xs={12} sm={6} md={3}>
            <Card className="glass-card-hover">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Max Monthly Footprint</Typography>
                    <Typography variant="body2" fontWeight={800} mt={1.5} noWrap sx={{ maxWidth: 160 }}>
                      {data.highestFootprintUser}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Min: {data.lowestFootprintUser}</Typography>
                  </Box>
                  <StarIcon sx={{ fontSize: 32, color: '#e879f9' }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Activity Breakdown */}
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Activity Category Counts
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">TRANSPORT ({data.transportActivities} logs)</Typography>
                  <ProgressBar value={data.totalActivities > 0 ? (data.transportActivities / data.totalActivities) * 100 : 0} color="#06b6d4" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">ELECTRICITY ({data.electricityActivities} logs)</Typography>
                  <ProgressBar value={data.totalActivities > 0 ? (data.electricityActivities / data.totalActivities) * 100 : 0} color="#fbbf24" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">FOOD ({data.foodActivities} logs)</Typography>
                  <ProgressBar value={data.totalActivities > 0 ? (data.foodActivities / data.totalActivities) * 100 : 0} color="#f87171" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">SHOPPING ({data.shoppingActivities} logs)</Typography>
                  <ProgressBar value={data.totalActivities > 0 ? (data.shoppingActivities / data.totalActivities) * 100 : 0} color="#10b981" />
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Badge distribution breakdown */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                Badges Awarded Distribution
              </Typography>
              <List sx={{ p: 0 }}>
                {Object.keys(data.badgeDistribution).length === 0 ? (
                  <Typography color="text.secondary" p={2}>No achievement badges awarded yet.</Typography>
                ) : (
                  Object.keys(data.badgeDistribution).map((key) => (
                    <Box key={key} display="flex" justifyContent="space-between" alignItems="center" py={1.5} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" fontWeight={600}>{key}</Typography>
                      <Typography variant="body2" fontWeight={700} color="primary.main">{data.badgeDistribution[key]} users</Typography>
                    </Box>
                  ))
                )}
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

const ProgressBar = ({ value, color }) => (
  <Box display="flex" alignItems="center" gap={2} mt={0.5}>
    <Box sx={{ width: '100%', height: 8, bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 4, overflow: 'hidden' }}>
      <Box sx={{ width: `${value}%`, height: '100%', bgcolor: color }} />
    </Box>
    <Typography variant="caption" fontWeight={700} sx={{ minWidth: 30 }}>{value.toFixed(0)}%</Typography>
  </Box>
);

const List = ({ children, sx }) => <Box sx={{ display: 'flex', flexDirection: 'column', ...sx }}>{children}</Box>;

export default AdminDashboard;
