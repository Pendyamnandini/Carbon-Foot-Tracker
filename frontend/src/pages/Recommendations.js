import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Card, CardContent, Typography, Box, Alert, CircularProgress, Grid,
  Avatar, Chip, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Paper, LinearProgress, TextField, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ParkIcon from '@mui/icons-material/Park';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import StarIcon from '@mui/icons-material/Star';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import InfoIcon from '@mui/icons-material/Info';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BlockIcon from '@mui/icons-material/Block';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddIcon from '@mui/icons-material/Add';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api';
import { useTranslation } from '../context/LanguageContext';

const Recommendations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabIndex, setTabIndex] = useState(0); // 0: Active, 1: History, 2: Analytics
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Date Range States
  const [period, setPeriod] = useState('30DAYS'); // 30DAYS, 7DAYS, CUSTOM
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));

  // Dialog State
  const [detailRec, setDetailRec] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      let url = '/api/recommendations';
      const params = new URLSearchParams();
      
      if (period === '7DAYS') {
        const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
        const end = new Date().toISOString().substring(0, 10);
        params.append('startDate', start);
        params.append('endDate', end);
      } else if (period === '30DAYS') {
        const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
        const end = new Date().toISOString().substring(0, 10);
        params.append('startDate', start);
        params.append('endDate', end);
      } else if (period === 'CUSTOM') {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const res = await api.get(`${url}?${params.toString()}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      setError(t('recs.retrieveError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setError('');
      setSuccess('');
      const res = await api.put(`/api/recommendations/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setSuccess(t('recs.successUpdate'));
        fetchDashboardData();
      }
    } catch (err) {
      setError(t('recs.failUpdate'));
    }
  };

  const getIconDetails = (category) => {
    switch (category) {
      case 'TRANSPORT':
        return { icon: <DirectionsBusIcon sx={{ fontSize: 24 }} />, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)' };
      case 'ELECTRICITY':
        return { icon: <FlashOnIcon sx={{ fontSize: 24 }} />, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.08)' };
      case 'FOOD':
        return { icon: <RestaurantIcon sx={{ fontSize: 24 }} />, color: '#f87171', bg: 'rgba(248, 113, 113, 0.08)' };
      case 'SHOPPING':
        return { icon: <ShoppingCartIcon sx={{ fontSize: 24 }} />, color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.08)' };
      default:
        return { icon: <ParkIcon sx={{ fontSize: 24 }} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' };
    }
  };

  const getPriorityDetails = (priority) => {
    switch (priority) {
      case 'Critical':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' };
      case 'High':
        return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' };
      case 'Medium':
        return { color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)' };
      default:
        return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' };
    }
  };

  const handleCustomRangeSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Handle empty onboarding state
  if (data && data.insufficientData) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card sx={{ p: 4, textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Avatar sx={{ mx: 'auto', mb: 3, width: 80, height: 80, bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'primary.main' }}>
            <TipsAndUpdatesIcon sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            {t('recs.insufficientDataTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxW: 600, mx: 'auto' }}>
            {t('recs.insufficientDataDesc')}
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {[
              { label: t('activity.logTitle') + ' (' + t('dashboard.catTransport') + ')', cat: 'TRANSPORT', color: '#06b6d4' },
              { label: t('activity.logTitle') + ' (' + t('dashboard.catElectricity') + ')', cat: 'ELECTRICITY', color: '#fbbf24' },
              { label: t('activity.logTitle') + ' (' + t('dashboard.catFood') + ')', cat: 'FOOD', color: '#f87171' },
              { label: t('activity.logTitle') + ' (' + t('dashboard.catShopping') + ')', cat: 'SHOPPING', color: '#a78bfa' }
            ].map((btn, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(`/activities/log?category=${t('dashboard.cat' + btn.cat.charAt(0) + btn.cat.slice(1).toLowerCase())}`)}
                  sx={{
                    py: 1.5,
                    color: btn.color,
                    borderColor: btn.color + '44',
                    '&:hover': {
                      borderColor: btn.color,
                      bg: btn.color + '05'
                    }
                  }}
                  startIcon={<AddIcon />}
                >
                  {t('dashboard.cat' + btn.cat.charAt(0) + btn.cat.slice(1).toLowerCase())}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Container>
    );
  }

  // Filter Active / History items
  const filteredActive = data.activeRecommendations.filter(
    (r) => categoryFilter === 'ALL' || r.category === categoryFilter
  );

  const filteredHistory = data.historyRecommendations.filter(
    (r) => categoryFilter === 'ALL' || r.category === categoryFilter
  );

  // Chart preparation
  const categoryChartData = [
    { name: 'Transport', value: data.activeRecommendations.filter(r => r.category === 'TRANSPORT').reduce((sum, r) => sum + r.estimatedMonthlySavings, 0), color: '#06b6d4' },
    { name: 'Electricity', value: data.activeRecommendations.filter(r => r.category === 'ELECTRICITY').reduce((sum, r) => sum + r.estimatedMonthlySavings, 0), color: '#fbbf24' },
    { name: 'Food', value: data.activeRecommendations.filter(r => r.category === 'FOOD').reduce((sum, r) => sum + r.estimatedMonthlySavings, 0), color: '#f87171' },
    { name: 'Shopping', value: data.activeRecommendations.filter(r => r.category === 'SHOPPING').reduce((sum, r) => sum + r.estimatedMonthlySavings, 0), color: '#a78bfa' }
  ].filter(item => item.value > 0);

  const impactChartData = data.activeRecommendations.map(r => ({
    name: r.title.length > 20 ? r.title.substring(0, 20) + '...' : r.title,
    co2: r.estimatedMonthlySavings
  })).slice(0, 5);

  const completionChartData = [
    { name: 'Completed', value: data.historyRecommendations.filter(r => r.status === 'COMPLETED').length, color: '#10b981' },
    { name: 'Active', value: data.activeRecommendations.length, color: '#06b6d4' },
    { name: 'Ignored', value: data.historyRecommendations.filter(r => r.status === 'NOT_INTERESTED').length, color: '#6b7280' }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Title & Filter Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 4, gap: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <TipsAndUpdatesIcon sx={{ fontSize: '2.8rem', color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={850}>
              {t('recs.personalizedEngine')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('recs.intelligentSuggestions')}
            </Typography>
          </Box>
        </Box>

        {/* Date Selector */}
        <Stack direction="row" spacing={1} sx={{ p: 0.5, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
          <Button size="small" variant={period === '7DAYS' ? 'contained' : 'text'} onClick={() => setPeriod('7DAYS')}>{t('recs.period7Short')}</Button>
          <Button size="small" variant={period === '30DAYS' ? 'contained' : 'text'} onClick={() => setPeriod('30DAYS')}>{t('recs.period30Short')}</Button>
          <Button size="small" variant={period === 'CUSTOM' ? 'contained' : 'text'} onClick={() => setPeriod('CUSTOM')}>{t('recs.periodCustomShort')}</Button>
        </Stack>
      </Box>

      {/* Custom Date Form */}
      {period === 'CUSTOM' && (
        <Card component="form" onSubmit={handleCustomRangeSubmit} sx={{ p: 2, mb: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <CalendarMonthIcon color="action" />
          <TextField
            label={t('goals.formStart')}
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label={t('goals.formEnd')}
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button type="submit" variant="contained" size="small">{t('recs.applyRange')}</Button>
        </Card>
      )}

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* KPI Dashboard cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: t('recs.activeRecsCount'), value: data.totalRecommendations, sub: t('recs.activeTips'), color: '#06b6d4' },
          { label: t('recs.badgeCritical'), value: data.criticalRecommendations, sub: t('recs.needsAction'), color: '#ef4444' },
          { label: t('recs.potentialMonthlySavings'), value: `${data.potentialMonthlySavings} kg`, sub: t('landing.co2Equiv'), color: '#10b981' },
          { label: t('recs.potentialAnnualSavings'), value: `${data.potentialAnnualSavings} kg`, sub: t('landing.co2Equiv'), color: '#3b82f6' },
          { label: t('dashboard.periodEcoScore'), value: `${data.sustainabilityScore}/100`, sub: t('recs.calculatedScore'), color: '#fbbf24' },
          { label: t('recs.topSourceCategory'), value: data.highestEmissionCategory, sub: t('recs.highestEmissions'), color: '#f87171' },
          { label: t('recs.implementationRate'), value: `${data.recommendationSuccessRate.toFixed(0)}%`, sub: t('recs.completionRate'), color: '#a78bfa' },
          { label: t('recs.goalImpactPotential'), value: `${data.goalProgressImpact.toFixed(1)}%`, sub: t('recs.carbonReduction'), color: '#ec4899' }
        ].map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{
              borderLeft: `5px solid ${card.color}`,
              transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }
            }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} uppercase>{card.label}</Typography>
                <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5, color: 'text.primary' }}>{card.value}</Typography>
                <Typography variant="caption" color="text.secondary">{card.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Personalized Insights Banner */}
      <Card sx={{
        mb: 4,
        background: 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(16,185,129,0.06) 100%)',
        border: '1px solid rgba(6,182,212,0.1)'
      }}>
        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 3 }}>
          <Avatar sx={{ bgcolor: 'rgba(6,182,212,0.1)', color: '#06b6d4' }}>
            <QueryStatsIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} gutterBottom color="primary.main">
              {t('recs.personalInsights')}
            </Typography>
            <Stack spacing={1}>
              {data.personalizedInsights.map((insight, idx) => (
                <Typography key={idx} variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon sx={{ fontSize: 14, color: 'primary.main' }} /> {insight}
                </Typography>
              ))}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Tab Select & Category Filter */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ mb: 3, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} textColor="primary" indicatorColor="primary">
          <Tab label={t('recs.tabActive')} sx={{ fontWeight: 800 }} />
          <Tab label={t('recs.tabHistory')} sx={{ fontWeight: 800 }} />
          <Tab label={t('recs.tabAnalytics')} sx={{ fontWeight: 800 }} />
        </Tabs>

        {/* Category quick filters */}
        <Stack direction="row" spacing={1} sx={{ my: 1 }}>
          {['ALL', 'TRANSPORT', 'ELECTRICITY', 'FOOD', 'SHOPPING'].map((cat) => (
            <Chip
              key={cat}
              label={cat === 'ALL' ? t('recs.filterAll') : cat === 'TRANSPORT' ? t('dashboard.catTransport') : cat === 'ELECTRICITY' ? t('dashboard.catElectricity') : cat === 'FOOD' ? t('dashboard.catFood') : t('dashboard.catShopping')}
              size="small"
              onClick={() => setCategoryFilter(cat)}
              color={categoryFilter === cat ? 'primary' : 'default'}
              variant={categoryFilter === cat ? 'filled' : 'outlined'}
              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
            />
          ))}
        </Stack>
      </Box>

      {/* Content Area */}
      {tabIndex === 0 && (
        <Grid container spacing={3}>
          {filteredActive.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent' }}>
                <Typography color="text.secondary">{t('recs.noActive')}</Typography>
              </Paper>
            </Grid>
          ) : (
            filteredActive.map((rec) => {
              const iconDetails = getIconDetails(rec.category);
              const priority = getPriorityDetails(rec.impact);
              return (
                <Grid item xs={12} md={6} key={rec.id}>
                  <Card sx={{
                    position: 'relative',
                    borderLeft: `6px solid ${iconDetails.color}`,
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start" sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ bgcolor: iconDetails.bg, color: iconDetails.color }}>
                            {iconDetails.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={850}>{rec.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{rec.category}</Typography>
                          </Box>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Chip label={rec.impact} size="small" sx={{ bgcolor: priority.bg, color: priority.color, fontWeight: 800, fontSize: '0.65rem' }} />
                          <Chip label={rec.difficulty} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                        </Stack>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                        {rec.message}
                      </Typography>

                      {/* Micro Statistics */}
                      <Grid container spacing={2} sx={{ mb: 3, p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1.5 }}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" display="block">{t('recs.currentEmission')}</Typography>
                          <Typography variant="subtitle2" fontWeight={800}>{rec.currentEmissions} kg CO₂</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" display="block">{t('recs.monthlySavings')}</Typography>
                          <Typography variant="subtitle2" fontWeight={800} color="primary.main">{rec.estimatedMonthlySavings} kg</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" display="block">{t('recs.reductionPct')}</Typography>
                          <Typography variant="subtitle2" fontWeight={800} color="secondary.main">{rec.carbonReductionPercentage}%</Typography>
                        </Grid>
                      </Grid>

                      {/* Action buttons */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Button
                          size="small"
                          color="info"
                          startIcon={<InfoIcon />}
                          onClick={() => setDetailRec(rec)}
                        >
                          {t('recs.actionDetails')}
                        </Button>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            startIcon={<AccessTimeIcon />}
                            onClick={() => handleUpdateStatus(rec.id, 'REMIND_ME_LATER')}
                          >
                            {t('recs.actionSnooze')}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<BlockIcon />}
                            onClick={() => handleUpdateStatus(rec.id, 'NOT_INTERESTED')}
                          >
                            {t('recs.actionIgnore')}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleUpdateStatus(rec.id, 'COMPLETED')}
                          >
                            {t('recs.actionImplement')}
                          </Button>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}

      {tabIndex === 1 && (
        <Grid container spacing={3}>
          {filteredHistory.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent' }}>
                <Typography color="text.secondary">{t('recs.noHistory')}</Typography>
              </Paper>
            </Grid>
          ) : (
            filteredHistory.map((rec) => {
              const iconDetails = getIconDetails(rec.category);
              const isCompleted = 'COMPLETED' === rec.status;
              const isLater = 'REMIND_ME_LATER' === rec.status;
              return (
                <Grid item xs={12} key={rec.id}>
                  <Card sx={{ borderLeft: `6px solid ${isCompleted ? '#10b981' : isLater ? '#fbbf24' : '#6b7280'}`, opacity: 0.85 }}>
                    <CardContent sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justify: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Box display="flex" alignItems="center" gap={2} sx={{ flexGrow: 1 }}>
                        <Avatar sx={{ bgcolor: iconDetails.bg, color: iconDetails.color }}>
                          {iconDetails.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800}>{rec.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{rec.category} • Saved {rec.estimatedMonthlySavings} kg CO₂/mo</Typography>
                        </Box>
                      </Box>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          label={rec.status.replace('_', ' ')}
                          color={isCompleted ? 'success' : isLater ? 'warning' : 'default'}
                          size="small"
                          sx={{ fontWeight: 800, fontSize: '0.65rem' }}
                        />
                        {rec.status !== 'IN_PROGRESS' && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => handleUpdateStatus(rec.id, 'IN_PROGRESS')}
                          >
                            {t('recs.actionReactivate')}
                          </Button>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}

      {tabIndex === 2 && (
        <Grid container spacing={4}>
          {categoryChartData.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent' }}>
                <Typography color="text.secondary">{t('recs.noDataAnalytics')}</Typography>
              </Paper>
            </Grid>
          ) : (
            <>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                      {t('recs.categorySavingsTitle')}
                    </Typography>
                    <Box sx={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                            data={categoryChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, value, percent }) =>
                              percent > 0.05 ? `${value.toLocaleString()} kg` : ''
                            }
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} kg`, 'Savings']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                      {t('recs.topImpactRecs')}
                    </Typography>
                    <Box sx={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={impactChartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value} kg`, 'CO₂ Savings']} />
                          <Bar dataKey="co2" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                            {impactChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill="#06b6d4" />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      )}

      {/* Details Dialog */}
      {detailRec && (
        <Dialog open={!!detailRec} onClose={() => setDetailRec(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TipsAndUpdatesIcon color="primary" /> {detailRec.title}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={800} uppercase display="block" mb={0.5}>
                  {t('recs.explanation')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {detailRec.explanation}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={800} uppercase display="block" mb={0.5}>
                  {t('recs.sustainabilityTip')}
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'action.hover', borderLeft: '4px solid #10b981' }}>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    💡 {detailRec.sustainabilityTip}
                  </Typography>
                </Paper>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary" display="block">{t('recs.categoryTitle')}</Typography>
                  <Chip label={detailRec.category} size="small" color="primary" variant="outlined" sx={{ fontWeight: 800, mt: 0.5 }} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary" display="block">{t('recs.dialogDifficulty')}</Typography>
                  <Chip label={detailRec.difficulty} size="small" variant="outlined" sx={{ fontWeight: 800, mt: 0.5 }} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary" display="block">{t('recs.dialogImpact')}</Typography>
                  <Chip label={detailRec.impact} size="small" color="secondary" sx={{ fontWeight: 800, mt: 0.5 }} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary" display="block">{t('recs.dialogConfidence')}</Typography>
                  <Chip label={detailRec.confidence} size="small" sx={{ fontWeight: 800, mt: 0.5 }} />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">{t('recs.currentEmission')}</Typography>
                  <Typography variant="h6" fontWeight={800} color="primary.main">{detailRec.estimatedMonthlySavings} kg CO₂</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">{t('recs.potentialAnnualSavings')}</Typography>
                  <Typography variant="h6" fontWeight={800} color="secondary.main">{detailRec.estimatedAnnualSavings} kg CO₂</Typography>
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              variant="contained"
              startIcon={<DirectionsBusIcon />}
              onClick={() => {
                setDetailRec(null);
                navigate(`/activities/log?category=${detailRec.category}`);
              }}
            >
              {t('recs.logActivity')}
            </Button>
            <Button onClick={() => setDetailRec(null)} color="inherit">
              {t('recs.close')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default Recommendations;
