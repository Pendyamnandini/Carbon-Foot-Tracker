import React, { useState, useEffect } from 'react';
import { Container, Card, Typography, Box, Alert, Grid } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as ChartTooltip } from 'recharts';
import api from '../api';

const ReportsAnalytics = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/admin/activities');
      if (res.data.success) {
        const list = res.data.data;
        // Group by category and average emission
        const grouped = list.reduce((acc, current) => {
          const cat = current.category;
          if (!acc[cat]) {
            acc[cat] = { count: 0, sum: 0 };
          }
          acc[cat].count += 1;
          acc[cat].sum += current.carbonEmission;
          return acc;
        }, {});

        const formatted = Object.keys(grouped).map((key) => ({
          name: key,
          'Total Emissions': parseFloat(grouped[key].sum.toFixed(1)),
          'Average Emission': parseFloat((grouped[key].sum / grouped[key].count).toFixed(1))
        }));

        setData(formatted);
      }
    } catch (e) {
      setError('Could not compile platform analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Compiling reports and analytics...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
        Platform Analytics & Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Aggregated indicators detailing total carbon footprint metrics and averages across all platform categories.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
              Total Emissions by Category (kg CO2)
            </Typography>
            {data.length === 0 ? (
              <Box height={300} display="flex" justifyContent="center" alignItems="center">
                <Typography color="text.secondary">No activity logs recorded on the platform.</Typography>
              </Box>
            ) : (
              <Box height={350}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <ChartTooltip 
                      contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="Total Emissions" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Average Emission" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReportsAnalytics;
