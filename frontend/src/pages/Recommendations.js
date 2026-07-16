import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, Box, Alert, CircularProgress, Grid, Avatar, Chip, Stack } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ParkIcon from '@mui/icons-material/Park';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import api from '../api';

const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/recommendations');
      if (res.data.success) {
        setRecs(res.data.data);
      }
    } catch (e) {
      setError('Could not retrieve suggestions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getIconDetails = (category) => {
    switch (category) {
      case 'TRANSPORT':
        return { icon: <DirectionsBusIcon sx={{ fontSize: 28 }} />, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' };
      case 'ELECTRICITY':
        return { icon: <FlashOnIcon sx={{ fontSize: 28 }} />, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)' };
      case 'FOOD':
        return { icon: <RestaurantIcon sx={{ fontSize: 28 }} />, color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)' };
      case 'SHOPPING':
        return { icon: <ShoppingCartIcon sx={{ fontSize: 28 }} />, color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)' };
      default:
        return { icon: <ParkIcon sx={{ fontSize: 28 }} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
        <TipsAndUpdatesIcon sx={{ fontSize: '2.5rem', color: 'primary.main' }} />
        <Typography variant="h4" fontWeight={800}>
          Personalized Eco Insights
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.05rem', lineHeight: 1.6 }}>
        Our rule-based engine scans your logging habits over the past 7 days to deliver weekly custom energy and emission reduction recommendations.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {recs.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No insights generated yet. Keep logging activities to receive custom tips!</Typography>
            </Card>
          </Grid>
        ) : (
          recs.map((rec, index) => {
            const iconDetails = getIconDetails(rec.category);
            return (
              <Grid item xs={12} key={index}>
                <Card 
                  sx={{ 
                    display: 'flex', 
                    p: 3, 
                    alignItems: 'center', 
                    gap: 3,
                    borderLeft: `6px solid ${iconDetails.color}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.01)',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: iconDetails.bg, 
                      color: iconDetails.color, 
                      width: 60, 
                      height: 60,
                      border: `1px solid ${iconDetails.color}33`
                    }}
                  >
                    {iconDetails.icon}
                  </Avatar>
                  
                  <CardContent sx={{ p: '0 !important', flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip 
                        label={rec.category} 
                        size="small" 
                        sx={{ 
                          bgcolor: iconDetails.bg, 
                          color: iconDetails.color, 
                          fontWeight: 800, 
                          fontSize: '0.65rem', 
                          height: 20 
                        }} 
                      />
                      <Chip 
                        label="Actionable Tip" 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700 }} 
                      />
                    </Stack>
                    <Typography variant="h6" fontWeight={800} color="text.primary" gutterBottom>
                      {rec.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {rec.message}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
    </Container>
  );
};

export default Recommendations;
