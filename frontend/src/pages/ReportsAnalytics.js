import React, { useState, useEffect } from 'react';
import { Container, Card, Typography, Box, Alert, Grid } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as ChartTooltip } from 'recharts';
import api from '../api';
import { useTranslation } from '../context/LanguageContext';

const ReportsAnalytics = () => {
  const { t } = useTranslation();
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
          [t('dashboard.periodEmissions')]: parseFloat(grouped[key].sum.toFixed(1)),
          [t('dashboard.dailyAverage')]: parseFloat((grouped[key].sum / grouped[key].count).toFixed(1))
        }));

        setData(formatted);
      }
    } catch (e) {
      setError(t('admin.reportsCompiling'));
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
        <Typography>{t('admin.reportsCompiling')}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
        {t('admin.reportsTitle')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('admin.reportsSubtitle')}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
              {t('admin.reportsEmissionsLabel')}
            </Typography>
            {data.length === 0 ? (
              <Box height={300} display="flex" justifyContent="center" alignItems="center">
                <Typography color="text.secondary">{t('admin.reportsNoData')}</Typography>
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
                    <Bar dataKey={t('dashboard.periodEmissions')} fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={t('dashboard.dailyAverage')} fill="#fbbf24" radius={[4, 4, 0, 0]} />
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
