import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Card, CardContent, Stack, Button, Chip,
  Select, MenuItem, FormControl, InputLabel, TextField, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress
} from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BoltIcon from '@mui/icons-material/Bolt';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import DownloadIcon from '@mui/icons-material/Download';
import TimelineIcon from '@mui/icons-material/Timeline';
import GridViewIcon from '@mui/icons-material/GridView';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import api from '../api';
import { useTranslation } from '../context/LanguageContext';

const categoryColors = {
  TRANSPORT: '#3b82f6',
  ELECTRICITY: '#fbbf24',
  FOOD: '#10b981',
  SHOPPING: '#ec4899'
};

const categoryIcons = {
  TRANSPORT: <DirectionsCarIcon />,
  ELECTRICITY: <BoltIcon />,
  FOOD: <RestaurantIcon />,
  SHOPPING: <ShoppingBagIcon />
};

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Custom period states
  const [periodType, setPeriodType] = useState('DAILY'); // 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedWeek, setSelectedWeek] = useState('2026-W30'); 
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [selectedYear, setSelectedYear] = useState(2026);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'score') setActiveTab(0);
    else if (tab === 'charts') setActiveTab(1);
    else if (tab === 'recs') setActiveTab(2);
    else if (tab === 'timeline') setActiveTab(3);
    else if (tab === 'benchmarking') setActiveTab(4);
    else if (tab === 'exports') setActiveTab(5); // exports doesn't exist yet but mapped here
  }, [location.search]);

  // Consolidated Analytics Data States
  const [totalEmissions, setTotalEmissions] = useState(0);
  const [sustainabilityScore, setSustainabilityScore] = useState(100);
  const [transportTotal, setTransportTotal] = useState(0);
  const [electricityTotal, setElectricityTotal] = useState(0);
  const [foodTotal, setFoodTotal] = useState(0);
  const [shoppingTotal, setShoppingTotal] = useState(0);
  const [previousPeriodEmissions, setPreviousPeriodEmissions] = useState(0);
  const [percentageChange, setPercentageChange] = useState(0);
  const [trendLabel, setTrendLabel] = useState('STABLE');
  const [trendData, setTrendData] = useState([]);
  const [recommendationsList, setRecommendationsList] = useState([]);
  const [benchmark, setBenchmark] = useState(null);
  const [insights, setInsights] = useState([]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (periodType === 'DAILY') {
        endpoint = `/api/v1/analytics/daily?date=${selectedDate}`;
      } else if (periodType === 'WEEKLY') {
        const [year, weekPart] = selectedWeek.split('-W');
        endpoint = `/api/v1/analytics/weekly?week=${parseInt(weekPart, 10)}&year=${parseInt(year, 10)}`;
      } else if (periodType === 'MONTHLY') {
        const [year, month] = selectedMonth.split('-');
        endpoint = `/api/v1/analytics/monthly?month=${parseInt(month, 10)}&year=${parseInt(year, 10)}`;
      } else if (periodType === 'YEARLY') {
        endpoint = `/api/v1/analytics/yearly?year=${selectedYear}`;
      } else if (periodType === 'CUSTOM') {
        endpoint = `/api/v1/analytics/date-range?startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await api.get(endpoint);
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setTotalEmissions(data.totalEmissions);
        setSustainabilityScore(data.sustainabilityScore);
        setTransportTotal(data.transportTotal);
        setElectricityTotal(data.electricityTotal);
        setFoodTotal(data.foodTotal);
        setShoppingTotal(data.shoppingTotal);
        setPreviousPeriodEmissions(data.previousPeriodEmissions);
        setPercentageChange(data.percentageChange);
        setTrendLabel(data.trendLabel);
        setTrendData(data.trend || []);
        setRecommendationsList(data.recommendations || []);
        setBenchmark(data.benchmarking);
        setInsights(data.insights || []);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [periodType, selectedDate, selectedWeek, selectedMonth, selectedYear, startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Helper function to resolve period boundaries for exports
  const getPeriodStartEndDates = () => {
    if (periodType === 'DAILY') {
      return { start: selectedDate, end: selectedDate };
    }
    if (periodType === 'WEEKLY') {
      const [year, weekPart] = selectedWeek.split('-W');
      const y = parseInt(year, 10);
      const w = parseInt(weekPart, 10);
      const simple = new Date(y, 0, 1 + (w - 1) * 7);
      const dow = simple.getDay();
      const ISOweekStart = simple;
      if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
      }
      const end = new Date(ISOweekStart);
      end.setDate(ISOweekStart.getDate() + 6);
      return { start: ISOweekStart.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
    if (periodType === 'MONTHLY') {
      const [year, month] = selectedMonth.split('-');
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }
    if (periodType === 'YEARLY') {
      return { start: `${selectedYear}-01-01`, end: `${selectedYear}-12-31` };
    }
    if (periodType === 'CUSTOM') {
      return { start: startDate, end: endDate };
    }
    return { start: startDate, end: endDate };
  };

  // Derived Aggregate KPI Calculations for Selected Category
  const getSelectedCategoryValue = () => {
    if (selectedCategory === 'ALL') return totalEmissions;
    if (selectedCategory === 'TRANSPORT') return transportTotal;
    if (selectedCategory === 'ELECTRICITY') return electricityTotal;
    if (selectedCategory === 'FOOD') return foodTotal;
    if (selectedCategory === 'SHOPPING') return shoppingTotal;
    return totalEmissions;
  };

  const selectedTotalEmissions = getSelectedCategoryValue();

  const getPeriodDays = () => {
    if (periodType === 'DAILY') return 1;
    if (periodType === 'WEEKLY') return 7;
    if (periodType === 'MONTHLY') {
      const [year, month] = selectedMonth.split('-');
      return new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
    }
    if (periodType === 'YEARLY') return 365;
    if (periodType === 'CUSTOM') {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 30;
  };

  const periodDays = getPeriodDays();
  const dailyAvg = selectedTotalEmissions / periodDays;
  const weeklyAvg = dailyAvg * 7;
  const monthlyAvg = dailyAvg * 30;
  const estimatedAnnual = dailyAvg * 365;

  const peakDayObj = trendData.reduce((max, item) => {
    return item.emissions > (max.val || 0) ? { date: item.label, val: item.emissions } : max;
  }, { date: 'N/A', val: 0 });

  const lowestDayObj = trendData.reduce((min, item) => {
    return (min.val === undefined || item.emissions < min.val) ? { date: item.label, val: item.emissions } : min;
  }, { date: 'N/A', val: undefined });

  // Category percentage factor for trend charts
  const categoryContributionPct = totalEmissions > 0 ? (selectedTotalEmissions / totalEmissions) : 1.0;

  // Render trend data points
  const activeTrendData = trendData.map(item => ({
    label: item.label,
    emissions: Number((item.emissions * categoryContributionPct).toFixed(1))
  }));

  const categoryBreakdown = [
    { category: 'TRANSPORT', emissionValue: transportTotal, percentageContribution: totalEmissions > 0 ? (transportTotal / totalEmissions) * 100 : 0 },
    { category: 'ELECTRICITY', emissionValue: electricityTotal, percentageContribution: totalEmissions > 0 ? (electricityTotal / totalEmissions) * 100 : 0 },
    { category: 'FOOD', emissionValue: foodTotal, percentageContribution: totalEmissions > 0 ? (foodTotal / totalEmissions) * 100 : 0 },
    { category: 'SHOPPING', emissionValue: shoppingTotal, percentageContribution: totalEmissions > 0 ? (shoppingTotal / totalEmissions) * 100 : 0 }
  ];

  // Recommendations Filtered by Selected Category
  const filteredRecommendations = selectedCategory === 'ALL'
    ? recommendationsList
    : recommendationsList.filter(r => r.category === selectedCategory);

  // Journey Timeline Demo Events
  const journeyEvents = [
    { title: 'Account Registration', date: '2026-01-10', desc: 'Joined CarbonTracker Sustainability Platform', icon: <WorkspacePremiumIcon color="primary" /> },
    { title: 'First Activity Logged', date: '2026-01-11', desc: `Logged 15.2 ${t('analytics.kgCo2')} transport commuting`, icon: <DirectionsCarIcon color="secondary" /> },
    { title: 'First Goal Created', date: '2026-01-15', desc: 'Set target to cut electricity emissions by 20%', icon: <BoltIcon color="primary" /> },
    { title: 'Milestone: 7-Day Streak Badge', date: '2026-01-18', desc: 'Earned 7-Day Streak Badge for continuous logging', icon: <WorkspacePremiumIcon color="secondary" /> },
    { title: 'Goal Completed: Eco Saver 10kg', date: '2026-02-01', desc: `Reduced 10 ${t('analytics.kgCo2e')} verified carbon savings`, icon: <TrendingDownIcon color="primary" /> }
  ];

  // Export PDF handler
  const handleDownloadPDF = async () => {
    try {
      const dates = getPeriodStartEndDates();
      const response = await api.get(`/api/v1/exports/user?format=pdf&startDate=${dates.start}&endDate=${dates.end}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carbon_analytics_report_${selectedCategory}_${dates.start}_to_${dates.end}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export PDF report', err);
    }
  };

  // Export CSV handler
  const handleDownloadCSV = async () => {
    try {
      const dates = getPeriodStartEndDates();
      const response = await api.get(`/api/v1/exports/user?format=csv&startDate=${dates.start}&endDate=${dates.end}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carbon_analytics_report_${selectedCategory}_${dates.start}_to_${dates.end}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV report', err);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header & Controls */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
            {t('analytics.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('analytics.subtitle')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleDownloadCSV}>
            {t('dashboard.exportCSV')}
          </Button>
          <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={handleDownloadPDF}>
            {t('dashboard.exportPDF')}
          </Button>
        </Stack>
      </Stack>

      {/* FILTER CONTROLS BAR */}
      <Paper className="glass-card" sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <Grid container spacing={2.5} alignItems="center">
          {/* 1. Period Type Select */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('analytics.inputPeriodType')}</InputLabel>
              <Select value={periodType} label={t('analytics.periodType')} onChange={(e) => setPeriodType(e.target.value)}>
                <MenuItem value="DAILY">{t('analytics.dailyAnalytics')}</MenuItem>
                <MenuItem value="WEEKLY">{t('analytics.weeklyAnalytics')}</MenuItem>
                <MenuItem value="MONTHLY">{t('analytics.monthlyAnalytics')}</MenuItem>
                <MenuItem value="YEARLY">{t('analytics.yearlyAnalytics')}</MenuItem>
                <MenuItem value="CUSTOM">{t('analytics.customDateRange')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* 2. Category Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('analytics.inputCategoryFilter')}</InputLabel>
              <Select value={selectedCategory} label={t('analytics.categoryFilter')} onChange={(e) => setSelectedCategory(e.target.value)}>
                <MenuItem value="ALL">{t('recs.filterAll')}</MenuItem>
                <MenuItem value="TRANSPORT">{t('analytics.transportAnalytics')}</MenuItem>
                <MenuItem value="ELECTRICITY">{t('analytics.electricityAnalytics')}</MenuItem>
                <MenuItem value="FOOD">{t('analytics.foodAnalytics')}</MenuItem>
                <MenuItem value="SHOPPING">{t('analytics.shoppingAnalytics')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* 3 & 4. Dynamic Period Inputs */}
          {periodType === 'DAILY' && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={t('analytics.selectDate')}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          {periodType === 'WEEKLY' && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                type="week"
                label={t('analytics.selectWeek')}
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          {periodType === 'MONTHLY' && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                type="month"
                label={t('analytics.selectMonth')}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          )}

          {periodType === 'YEARLY' && (
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t('analytics.inputSelectYear')}</InputLabel>
                <Select value={selectedYear} label={t('analytics.selectYear')} onChange={(e) => setSelectedYear(e.target.value)}>
                  {[2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {periodType === 'CUSTOM' && (
            <>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={t('analytics.startDate')}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={t('analytics.endDate')}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          {/* 5. Apply Filter */}
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" color="primary" startIcon={<FilterAltIcon />} onClick={fetchAnalytics}>
              Apply Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* CATEGORY SELECTOR CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { key: 'ALL', label: t('analytics.catAll'), desc: t('analytics.descAll') },
          { key: 'TRANSPORT', label: t('analytics.catTransport'), desc: t('analytics.descTransport') },
          { key: 'ELECTRICITY', label: t('analytics.catElectricity'), desc: t('analytics.descElectricity') },
          { key: 'FOOD', label: t('analytics.catFood'), desc: t('analytics.descFood') },
          { key: 'SHOPPING', label: t('analytics.catShopping'), desc: t('analytics.descShopping') }
        ].map((item) => {
          const isSelected = selectedCategory === item.key;
          const color = categoryColors[item.key] || '#10b981';
          return (
            <Grid item xs={12} sm={6} md={2.4} key={item.key}>
              <Card
                className="glass-card-hover"
                onClick={() => setSelectedCategory(item.key)}
                sx={{
                  cursor: 'pointer',
                  borderLeft: isSelected ? `5px solid ${color}` : '1px solid transparent',
                  background: isSelected ? `${color}15` : 'background.paper',
                  boxShadow: isSelected ? `0 8px 25px ${color}33` : undefined,
                  transition: 'all 0.2s ease'
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                    <Box sx={{ color }}>{categoryIcons[item.key] || <GridViewIcon />}</Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {item.label}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* TABS FOR DEEP-DIVE VIEWS */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} indicatorColor="primary">
          <Tab label={t('analytics.tabKpiOverview')} icon={<SpeedIcon />} iconPosition="start" />
          <Tab label={t('analytics.tabBreakdownCharts')} icon={<AutoGraphIcon />} iconPosition="start" />
          <Tab label={t('analytics.tabForecastsRecs')} icon={<TrendingDownIcon />} iconPosition="start" />
          <Tab label={t('analytics.tabHeatmapTimeline')} icon={<TimelineIcon />} iconPosition="start" />
          <Tab label={t('analytics.tabBenchmarkingBi')} icon={<EqualizerIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {loading && <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />}

      {/* TAB 0: KPI OVERVIEW GRID */}
      {activeTab === 0 && (
        <Stack spacing={4}>
          {/* Section 1: Emissions Overview */}
          <Box>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
              {t('analytics.emissionsOverviewKpis')} ({selectedCategory})
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">{t('analytics.totalPeriodCarbonFootprint')} ({selectedCategory})</Typography>
                  <Typography variant="h4" fontWeight={900} color="primary.main">{selectedTotalEmissions.toFixed(1)} kg</Typography>
                  <Typography variant="caption" color="text.secondary">{t('analytics.co2Equivalent')}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">{t('analytics.dailyAverage')}</Typography>
                  <Typography variant="h4" fontWeight={900}>{dailyAvg.toFixed(1)} kg</Typography>
                  <Typography variant="caption" color="text.secondary">{t('analytics.perActiveDay')} ({selectedCategory})</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">{t('analytics.weeklyAverage')}</Typography>
                  <Typography variant="h4" fontWeight={900}>{weeklyAvg.toFixed(1)} kg</Typography>
                  <Typography variant="caption" color="text.secondary">{t('analytics.proj7Day')}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">{t('analytics.monthlyAverage')}</Typography>
                  <Typography variant="h4" fontWeight={900}>{monthlyAvg.toFixed(1)} kg</Typography>
                  <Typography variant="caption" color="text.secondary">{t('analytics.proj30Day')}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">{t('analytics.previousPeriod')}</Typography>
                  <Typography variant="h4" fontWeight={900} color="secondary.main">{previousPeriodEmissions.toFixed(1)} kg</Typography>
                  <Typography variant="caption" color="text.secondary">{t('analytics.baselineComparison')}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">{t('analytics.peakDay')}</Typography>
                  <Typography variant="h5" fontWeight={800} color="error.main">{peakDayObj.date || 'N/A'}</Typography>
                  <Typography variant="caption" color="text.secondary">{peakDayObj.val !== undefined ? `${peakDayObj.val.toFixed(1)} {t('analytics.kgCo2')}` : t('analytics.noData')}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">{t('analytics.lowestDay')}</Typography>
                  <Typography variant="h5" fontWeight={800} color="success.main">{lowestDayObj.date || 'N/A'}</Typography>
                  <Typography variant="caption" color="text.secondary">{lowestDayObj.val !== undefined ? `${lowestDayObj.val.toFixed(1)} {t('analytics.kgCo2')}` : t('analytics.noData')}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">{t('analytics.periodOverPeriod')}</Typography>
                  <Typography variant="h4" fontWeight={900} color={percentageChange <= 0 ? "success.main" : "error.main"}>
                    {percentageChange.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{t('analytics.trendStatus')}: {trendLabel}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Section 2: Sustainability Performance */}
          <Box>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
              {t('analytics.sustainabilityPerf')} ({selectedCategory})
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('analytics.sustainabilityScore')}</Typography>
                  <Stack direction="row" alignItems="center" spacing={2} my={1}>
                    <Typography variant="h3" fontWeight={900} color="primary.main">{sustainabilityScore.toFixed(0)} / 100</Typography>
                    <Chip label={sustainabilityScore >= 80 ? t('analytics.excellent') : sustainabilityScore >= 60 ? t('analytics.good') : t('analytics.needsImprovement')} color={sustainabilityScore >= 70 ? "success" : "warning"} size="small" />
                  </Stack>
                  <LinearProgress variant="determinate" value={sustainabilityScore} sx={{ height: 8, borderRadius: 4 }} />
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('analytics.estAnnualTrajectory')} ({selectedCategory})</Typography>
                  <Typography variant="h3" fontWeight={900}>{estimatedAnnual.toFixed(0)} kg</Typography>
                  <Typography variant="caption" color="text.secondary">{t('analytics.co2eAnnualProj')}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('analytics.goalSuccessOdds')}</Typography>
                  <Stack direction="row" alignItems="center" spacing={2} my={1}>
                    <Typography variant="h3" fontWeight={900} color="secondary.main">{Math.max(30, Math.min(98, Math.round(sustainabilityScore + 5)))}%</Typography>
                    <Chip label={t('analytics.calculatedOdds')} color="primary" size="small" />
                  </Stack>
                  <LinearProgress variant="determinate" value={Math.max(30, Math.min(98, Math.round(sustainabilityScore + 5)))} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Section 3: Dynamic Category Intelligence Text Insights */}
          <Paper className="glass-card" sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoGraphIcon color="primary" /> Category Intelligence Narrative ({selectedCategory})
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {insights.length > 0 ? (
                insights.map((text, idx) => (
                  <Paper key={idx} elevation={0} sx={{ p: 2, bg: 'background.default', borderRadius: 3, borderLeft: '4px solid #10b981' }}>
                    <Typography variant="body1" fontWeight={500}>{text}</Typography>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary">{t('analytics.loggingGeneratesInsights')}</Typography>
              )}
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* TAB 1: BREAKDOWN & COMPARISON CHARTS */}
      {activeTab === 1 && (
        <Grid container spacing={4}>
          {/* Active Period Trend Chart */}
          <Grid item xs={12} md={6}>
            <Paper className="glass-card" sx={{ p: 3, borderRadius: 4, height: 400 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {periodType === 'DAILY' && `Daily Emissions Trend (Last 7 Days - ${selectedCategory})`}
                {periodType === 'WEEKLY' && `Weekly Emissions Trend (Last 4 Weeks - ${selectedCategory})`}
                {periodType === 'MONTHLY' && `Monthly Emissions Trend (Last 6 Months - ${selectedCategory})`}
                {periodType === 'YEARLY' && `Monthly Emissions Breakdown (${selectedYear} - ${selectedCategory})`}
                {periodType === 'CUSTOM' && `Custom Range Emissions Trend (${selectedCategory})`}
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                {periodType === 'DAILY' || periodType === 'CUSTOM' ? (
                  <LineChart data={activeTrendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="emissions" stroke={categoryColors[selectedCategory] || '#10b981'} strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                ) : periodType === 'WEEKLY' ? (
                  <AreaChart data={activeTrendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="emissions" stroke="#3b82f6" fill="#3b82f633" strokeWidth={2} />
                  </AreaChart>
                ) : (
                  <BarChart data={activeTrendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="emissions" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Category Breakdown Donut Chart */}
          <Grid item xs={12} md={6}>
            <Paper className="glass-card" sx={{ p: 3, borderRadius: 4, height: 400 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>{t('analytics.systemCatBreakdown')}</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="emissionValue" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={90} label>
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || '#10b981'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 2: FORECASTS & RECOMMENDATIONS */}
      {activeTab === 2 && (
        <Stack spacing={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper className="glass-card" sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom color="primary.main">
                  {t('analytics.carbonSavingsEngine')} ({selectedCategory})
                </Typography>
                <Stack spacing={2} mt={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{t('analytics.potentialMonthlyReduction')}</Typography>
                    <Typography variant="h4" fontWeight={900} color="success.main">
                      {(selectedCategory === 'ALL' ? 43.0 : 18.5).toFixed(1)} {t('analytics.kgCo2eMonth')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{t('analytics.potentialAnnualReduction')}</Typography>
                    <Typography variant="h4" fontWeight={900} color="success.main">
                      {(selectedCategory === 'ALL' ? 516.0 : 222.0).toFixed(1)} {t('analytics.kgCo2eYear')}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper className="glass-card" sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom color="secondary.main">
                  {t('analytics.predictiveTrajectory')} ({selectedCategory})
                </Typography>
                <Stack spacing={2} mt={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{t('analytics.predictedNextMonth')}</Typography>
                    <Typography variant="h4" fontWeight={900}>{monthlyAvg.toFixed(1)} {t('analytics.kgCo2e')}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">{t('analytics.predictedAnnual')}</Typography>
                    <Typography variant="h4" fontWeight={900}>{estimatedAnnual.toFixed(0)} {t('analytics.kgCo2e')}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Recommendation Impact Analytics */}
          <Paper className="glass-card" sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
              {t('analytics.recImpactAnalytics')} ({selectedCategory})
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>{t('analytics.suggestedAction')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('analytics.category')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('analytics.monthlySavings')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('analytics.annualSavings')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('analytics.difficulty')}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{t('analytics.impactLevel')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecommendations.length > 0 ? (
                  filteredRecommendations.map((rec, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{rec.action}</TableCell>
                      <TableCell>
                        <Chip label={rec.category} size="small" style={{ backgroundColor: `${categoryColors[rec.category]}22`, color: categoryColors[rec.category], fontWeight: 700 }} />
                      </TableCell>
                      <TableCell sx={{ color: 'success.main', fontWeight: 700 }}>{rec.estimatedSavings.includes("reduction:") ? rec.estimatedSavings.split("reduction:")[1].trim() : rec.estimatedSavings}</TableCell>
                      <TableCell sx={{ color: 'success.main', fontWeight: 700 }}>
                        {rec.estimatedSavings.includes("reduction:") ? 
                          (parseFloat(rec.estimatedSavings.split("reduction:")[1].split(" ")[1]) * 12).toFixed(1) + " {t('analytics.kgCo2')}" : 
                          "N/A"}
                      </TableCell>
                      <TableCell><Chip label={rec.difficulty} size="small" variant="outlined" /></TableCell>
                      <TableCell><Chip label={rec.impact} color={rec.impact === 'High' ? 'primary' : 'default'} size="small" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                      {t('analytics.noRecsFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      )}

      {/* TAB 3: ACTIVITY HEATMAP & TIMELINE */}
      {activeTab === 3 && (
        <Stack spacing={4}>
          <Paper className="glass-card" sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
              {t('analytics.activityHeatmap')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Array.from({ length: 60 }).map((_, idx) => {
                const count = (idx * 7) % 5;
                const bg = count === 0 ? '#1e293b' : count === 1 ? '#064e3b' : count === 2 ? '#047857' : count === 3 ? '#10b981' : '#34d399';
                return (
                  <Box
                    key={idx}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      backgroundColor: bg,
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'scale(1.2)' }
                    }}
                    title={`Day ${idx + 1}: ${count} activity logs`}
                  />
                );
              })}
            </Box>
          </Paper>

          <Paper className="glass-card" sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
              {t('analytics.carbonJourneyTimeline')}
            </Typography>
            <Stack spacing={3}>
              {journeyEvents.map((ev, idx) => (
                <Stack direction="row" spacing={3} alignItems="flex-start" key={idx}>
                  <Box sx={{ p: 1.5, borderRadius: '50%', background: 'background.paper', boxShadow: 2 }}>
                    {ev.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>{ev.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{ev.date}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{ev.desc}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* TAB 4: BENCHMARKING BI */}
      {activeTab === 4 && (
        <Stack spacing={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper className="glass-card" sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Platform Average</Typography>
                <Typography variant="h3" fontWeight={900} color="primary.main">{benchmark?.platformAverage || 45.2} kg</Typography>
                <Typography variant="caption" color="text.secondary">Active user average for this period</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper className="glass-card" sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Your Footprint ({selectedCategory})</Typography>
                <Typography variant="h3" fontWeight={900}>{selectedTotalEmissions.toFixed(1)} kg</Typography>
                <Typography variant="caption" color="text.secondary">Current period footprint</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper className="glass-card" sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">User Percentile Ranking</Typography>
                <Typography variant="h3" fontWeight={900} color="secondary.main">{benchmark?.percentileRanking || 84.5}%</Typography>
                <Typography variant="caption" color="text.secondary">Better than platform peers</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Paper className="glass-card" sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Platform Benchmark Summary
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {benchmark?.comparisonInsight || 'Your footprint is 24% lower than average platform users in your country cohort.'}
            </Typography>
          </Paper>
        </Stack>
      )}
    </Box>
  );
};

export default AnalyticsPage;
