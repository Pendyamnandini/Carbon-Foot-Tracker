import React, { useState, useEffect, useCallback } from 'react';
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
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [presetRange, setPresetRange] = useState('LAST_30_DAYS');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  // Analytics Data States
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [benchmark, setBenchmark] = useState(null);
  const [insights, setInsights] = useState([]);

  // Preset Date Range Handler
  const handlePresetChange = (preset) => {
    setPresetRange(preset);
    const today = new Date();
    let start = new Date();

    if (preset === 'TODAY') {
      start = today;
    } else if (preset === 'YESTERDAY') {
      start.setDate(today.getDate() - 1);
    } else if (preset === 'LAST_7_DAYS') {
      start.setDate(today.getDate() - 7);
    } else if (preset === 'LAST_30_DAYS') {
      start.setDate(today.getDate() - 30);
    } else if (preset === 'THIS_MONTH') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (preset === 'LAST_MONTH') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    } else if (preset === 'THIS_YEAR') {
      start = new Date(today.getFullYear(), 0, 1);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [dailyRes, weeklyRes, monthlyRes, catRes, benchRes, trendRes] = await Promise.all([
        api.get(`/api/v1/analytics/daily?startDate=${startDate}&endDate=${endDate}`),
        api.get('/api/v1/analytics/weekly'),
        api.get('/api/v1/analytics/monthly'),
        api.get(`/api/v1/analytics/category-breakdown?startDate=${startDate}&endDate=${endDate}`),
        api.get('/api/v1/benchmarking'),
        api.get('/api/v1/analytics/trends')
      ]);

      if (dailyRes.data?.data?.history) {
        setDailyData(dailyRes.data.data.history);
      }
      if (weeklyRes.data?.data?.trend) {
        setWeeklyData(weeklyRes.data.data.trend);
      }
      if (monthlyRes.data?.data?.trend) {
        setMonthlyData(monthlyRes.data.data.trend);
      }
      if (catRes.data?.data) {
        setCategoryBreakdown(catRes.data.data);
      }
      if (benchRes.data?.data) {
        setBenchmark(benchRes.data.data);
      }
      if (trendRes.data?.data?.insights) {
        setInsights(trendRes.data.data.insights);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Derived Aggregate KPI Calculations for Selected Category
  const getCategoryValueFromLog = (logItem, category) => {
    if (category === 'ALL') return logItem.overallTotal;
    if (category === 'TRANSPORT') return logItem.transport || 0;
    if (category === 'ELECTRICITY') return logItem.electricity || 0;
    if (category === 'FOOD') return logItem.food || 0;
    if (category === 'SHOPPING') return logItem.shopping || 0;
    return logItem.overallTotal;
  };

  const filteredLogs = dailyData.filter(d => getCategoryValueFromLog(d, selectedCategory) > 0 || selectedCategory === 'ALL');

  const totalEmissions = dailyData.reduce((acc, curr) => acc + getCategoryValueFromLog(curr, selectedCategory), 0);
  const daysCount = dailyData.length || 1;
  const dailyAvg = totalEmissions / daysCount;
  const weeklyAvg = dailyAvg * 7;
  const monthlyAvg = dailyAvg * 30;
  const estimatedAnnual = dailyAvg * 365;

  const peakDayObj = dailyData.reduce((max, item) => {
    const val = getCategoryValueFromLog(item, selectedCategory);
    return val > (max.val || 0) ? { date: item.date, val } : max;
  }, { date: 'N/A', val: 0 });

  const lowestDayObj = dailyData.reduce((min, item) => {
    const val = getCategoryValueFromLog(item, selectedCategory);
    return (min.val === undefined || val < min.val) ? { date: item.date, val } : min;
  }, { date: 'N/A', val: undefined });

  // Dynamic Chart Data mapping for Selected Category
  const dailyChartData = dailyData.map(item => ({
    date: item.date,
    emissions: Number(getCategoryValueFromLog(item, selectedCategory).toFixed(1))
  }));

  // Category percentage factor for weekly & monthly charts
  const catShareObj = categoryBreakdown.find(c => c.category === selectedCategory);
  const catShareFactor = selectedCategory === 'ALL' ? 1.0 : (catShareObj ? (catShareObj.percentageContribution / 100) : 0.25);

  const weeklyChartData = weeklyData.map(item => ({
    weekLabel: item.weekLabel,
    emissions: Number((item.emissions * catShareFactor).toFixed(1))
  }));

  const monthlyChartData = monthlyData.map(item => ({
    monthLabel: item.monthLabel,
    emissions: Number((item.emissions * catShareFactor).toFixed(1))
  }));

  // Recommendations Filtered by Selected Category
  const allRecommendations = [
    { action: 'Switch to public transport twice a week', category: 'TRANSPORT', monthlySavings: 12.5, annualSavings: 150.0, difficulty: 'Easy', impact: 'High' },
    { action: 'Carpool for work commutes', category: 'TRANSPORT', monthlySavings: 8.0, annualSavings: 96.0, difficulty: 'Easy', impact: 'Medium' },
    { action: 'Lower AC temperature by 2 degrees & switch off standby electronics', category: 'ELECTRICITY', monthlySavings: 14.0, annualSavings: 168.0, difficulty: 'Medium', impact: 'High' },
    { action: 'Upgrade home lighting to LEDs', category: 'ELECTRICITY', monthlySavings: 3.5, annualSavings: 42.0, difficulty: 'Easy', impact: 'Low' },
    { action: 'Adopt 2 plant-based meals per week', category: 'FOOD', monthlySavings: 10.0, annualSavings: 120.0, difficulty: 'Easy', impact: 'Medium' },
    { action: 'Reduce red meat consumption', category: 'FOOD', monthlySavings: 15.0, annualSavings: 180.0, difficulty: 'Medium', impact: 'High' },
    { action: 'Limit fast fashion & practice 48-hour cool-off before non-essential buys', category: 'SHOPPING', monthlySavings: 8.0, annualSavings: 96.0, difficulty: 'Easy', impact: 'Medium' }
  ];

  const filteredRecommendations = selectedCategory === 'ALL'
    ? allRecommendations
    : allRecommendations.filter(r => r.category === selectedCategory);

  // Journey Timeline Demo Events
  const journeyEvents = [
    { title: 'Account Registration', date: '2026-01-10', desc: 'Joined CarbonTracker Sustainability Platform', icon: <WorkspacePremiumIcon color="primary" /> },
    { title: 'First Activity Logged', date: '2026-01-11', desc: 'Logged 15.2 kg CO₂ transport commuting', icon: <DirectionsCarIcon color="secondary" /> },
    { title: 'First Goal Created', date: '2026-01-15', desc: 'Set target to cut electricity emissions by 20%', icon: <BoltIcon color="primary" /> },
    { title: 'Milestone: 7-Day Streak Badge', date: '2026-01-18', desc: 'Earned 7-Day Streak Badge for continuous logging', icon: <WorkspacePremiumIcon color="secondary" /> },
    { title: 'Goal Completed: Eco Saver 10kg', date: '2026-02-01', desc: 'Reduced 10 kg CO₂e verified carbon savings', icon: <TrendingDownIcon color="primary" /> }
  ];

  // Export PDF handler
  const handleDownloadPDF = async () => {
    try {
      const response = await api.get('/api/v1/exports/user?format=pdf', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carbon_analytics_report_${selectedCategory}_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export PDF report', err);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header & Controls */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
            Advanced Analytics & Intelligence
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Deep-dive category breakdown ({selectedCategory}), period comparison, predictive forecasts, and carbon potential engine.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button variant="contained" color="secondary" startIcon={<DownloadIcon />} onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </Stack>
      </Stack>

      {/* FILTER CONTROLS BAR WITH CATEGORY DROPDOWN */}
      <Paper className="glass-card" sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <Grid container spacing={2.5} alignItems="center">
          {/* 1. Date Range Preset */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range Preset</InputLabel>
              <Select value={presetRange} label="Date Range Preset" onChange={(e) => handlePresetChange(e.target.value)}>
                <MenuItem value="TODAY">Today</MenuItem>
                <MenuItem value="YESTERDAY">Yesterday</MenuItem>
                <MenuItem value="LAST_7_DAYS">Last 7 Days</MenuItem>
                <MenuItem value="LAST_30_DAYS">Last 30 Days</MenuItem>
                <MenuItem value="THIS_MONTH">This Month</MenuItem>
                <MenuItem value="LAST_MONTH">Last Month</MenuItem>
                <MenuItem value="THIS_YEAR">This Year</MenuItem>
                <MenuItem value="CUSTOM">Custom Date Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* 2. Category Dropdown Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category Filter</InputLabel>
              <Select value={selectedCategory} label="Category Filter" onChange={(e) => setSelectedCategory(e.target.value)}>
                <MenuItem value="ALL">All Categories</MenuItem>
                <MenuItem value="TRANSPORT">Transport Analytics</MenuItem>
                <MenuItem value="ELECTRICITY">Electricity Analytics</MenuItem>
                <MenuItem value="FOOD">Food Analytics</MenuItem>
                <MenuItem value="SHOPPING">Shopping Analytics</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* 3. Start Date */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* 4. End Date */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

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
          { key: 'ALL', label: 'All Categories', desc: 'System-wide summary' },
          { key: 'TRANSPORT', label: 'Transport Analytics', desc: 'Vehicles, flights, public transit' },
          { key: 'ELECTRICITY', label: 'Electricity Analytics', desc: 'Household power & heating' },
          { key: 'FOOD', label: 'Food Analytics', desc: 'Dietary choices & agriculture' },
          { key: 'SHOPPING', label: 'Shopping Analytics', desc: 'Goods, apparel & manufacturing' }
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
          <Tab label="KPI Overview & Deep Insights" icon={<SpeedIcon />} iconPosition="start" />
          <Tab label="Breakdown & Comparison Charts" icon={<AutoGraphIcon />} iconPosition="start" />
          <Tab label="Forecasts & Recommendations" icon={<TrendingDownIcon />} iconPosition="start" />
          <Tab label="Activity Heatmap & Timeline" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Benchmarking BI" icon={<EqualizerIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {loading && <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />}

      {/* TAB 0: KPI OVERVIEW GRID */}
      {activeTab === 0 && (
        <Stack spacing={4}>
          {/* Section 1: Emissions Overview */}
          <Box>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
              📊 Emissions Overview KPIs ({selectedCategory})
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">Total Period Emissions ({selectedCategory})</Typography>
                  <Typography variant="h4" fontWeight={900} color="primary.main">{totalEmissions.toFixed(1)} kg</Typography>
                  <Typography variant="caption" color="text.secondary">CO₂ equivalent</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">Daily Average Emissions</Typography>
                  <Typography variant="h4" fontWeight={900}>{dailyAvg.toFixed(1)} kg</Typography>
                  <Typography variant="caption" color="text.secondary">Per active day ({selectedCategory})</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">Weekly Average Emissions</Typography>
                  <Typography variant="h4" fontWeight={900}>{weeklyAvg.toFixed(1)} kg</Typography>
                  <Typography variant="caption" color="text.secondary">Projected 7-day average</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">Monthly Average Emissions</Typography>
                  <Typography variant="h4" fontWeight={900}>{monthlyAvg.toFixed(1)} kg</Typography>
                  <Typography variant="caption" color="text.secondary">Projected 30-day average</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">Total Activities Logged</Typography>
                  <Typography variant="h4" fontWeight={900} color="secondary.main">{filteredLogs.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Verified log entries</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">Peak Emission Day</Typography>
                  <Typography variant="h5" fontWeight={800} color="error.main">{peakDayObj.date || 'N/A'}</Typography>
                  <Typography variant="caption" color="text.secondary">{peakDayObj.val !== undefined ? `${peakDayObj.val.toFixed(1)} kg CO₂` : 'No data'}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">Lowest Emission Day</Typography>
                  <Typography variant="h5" fontWeight={800} color="success.main">{lowestDayObj.date || 'N/A'}</Typography>
                  <Typography variant="caption" color="text.secondary">{lowestDayObj.val !== undefined ? `${lowestDayObj.val.toFixed(1)} kg CO₂` : 'No data'}</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="caption" color="text.secondary">Estimated Carbon Saved</Typography>
                  <Typography variant="h4" fontWeight={900} color="success.main">
                    {(selectedCategory === 'ALL' ? 24.5 : 12.0).toFixed(1)} kg
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Compared to baseline</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Section 2: Sustainability Performance */}
          <Box>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 2 }}>
              🌱 Sustainability Performance & Forecast Metrics ({selectedCategory})
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Sustainability Score</Typography>
                  <Stack direction="row" alignItems="center" spacing={2} my={1}>
                    <Typography variant="h3" fontWeight={900} color="primary.main">82 / 100</Typography>
                    <Chip label="Excellent" color="success" size="small" />
                  </Stack>
                  <LinearProgress variant="determinate" value={82} sx={{ height: 8, borderRadius: 4 }} />
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Estimated Annual Footprint ({selectedCategory})</Typography>
                  <Typography variant="h3" fontWeight={900}>{estimatedAnnual.toFixed(0)} kg</Typography>
                  <Typography variant="caption" color="text.secondary">CO₂e annual trajectory</Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper className="glass-card" sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Goal Achievement Probability</Typography>
                  <Stack direction="row" alignItems="center" spacing={2} my={1}>
                    <Typography variant="h3" fontWeight={900} color="secondary.main">86%</Typography>
                    <Chip label="High Chance" color="primary" size="small" />
                  </Stack>
                  <LinearProgress variant="determinate" value={86} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
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
                <Typography color="text.secondary">Logging activities generates dynamic intelligence insights automatically.</Typography>
              )}
            </Stack>
          </Paper>
        </Stack>
      )}

      {/* TAB 1: BREAKDOWN & COMPARISON CHARTS */}
      {activeTab === 1 && (
        <Grid container spacing={4}>
          {/* Daily Trend Line Chart for Selected Category */}
          <Grid item xs={12} md={6}>
            <Paper className="glass-card" sx={{ p: 3, borderRadius: 4, height: 400 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Daily Emissions ({selectedCategory})
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="emissions" stroke={categoryColors[selectedCategory] || '#10b981'} strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Weekly Trend Area Chart for Selected Category */}
          <Grid item xs={12} md={6}>
            <Paper className="glass-card" sx={{ p: 3, borderRadius: 4, height: 400 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Weekly Emissions ({selectedCategory})
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="weekLabel" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="emissions" stroke="#3b82f6" fill="#3b82f633" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Monthly Trend Bar Chart for Selected Category */}
          <Grid item xs={12} md={6}>
            <Paper className="glass-card" sx={{ p: 3, borderRadius: 4, height: 400 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Monthly Emissions ({selectedCategory})
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="monthLabel" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="emissions" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Category Breakdown Donut Chart */}
          <Grid item xs={12} md={6}>
            <Paper className="glass-card" sx={{ p: 3, borderRadius: 4, height: 400 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>System Category Breakdown</Typography>
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
                  🔮 Carbon Savings Potential Engine ({selectedCategory})
                </Typography>
                <Stack spacing={2} mt={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Potential Monthly Reduction</Typography>
                    <Typography variant="h4" fontWeight={900} color="success.main">
                      {(selectedCategory === 'ALL' ? 43.0 : 18.5).toFixed(1)} kg CO₂e / month
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Potential Annual Reduction</Typography>
                    <Typography variant="h4" fontWeight={900} color="success.main">
                      {(selectedCategory === 'ALL' ? 516.0 : 222.0).toFixed(1)} kg CO₂e / year
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper className="glass-card" sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom color="secondary.main">
                  📈 Predictive Trajectory ({selectedCategory})
                </Typography>
                <Stack spacing={2} mt={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Predicted Next Month Emissions</Typography>
                    <Typography variant="h4" fontWeight={900}>{monthlyAvg.toFixed(1)} kg CO₂e</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Predicted Annual Footprint</Typography>
                    <Typography variant="h4" fontWeight={900}>{estimatedAnnual.toFixed(0)} kg CO₂e</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Recommendation Impact Analytics */}
          <Paper className="glass-card" sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
              💡 Recommendation Impact Analytics ({selectedCategory})
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Suggested Action</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Monthly Savings</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Annual Savings</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Difficulty</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Impact Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecommendations.map((rec, index) => (
                  <TableRow key={index} hover>
                    <TableCell fontWeight={600}>{rec.action}</TableCell>
                    <TableCell>
                      <Chip label={rec.category} size="small" style={{ backgroundColor: `${categoryColors[rec.category]}22`, color: categoryColors[rec.category], fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ color: 'success.main', fontWeight: 700 }}>{rec.monthlySavings} kg CO₂</TableCell>
                    <TableCell sx={{ color: 'success.main', fontWeight: 700 }}>{rec.annualSavings} kg CO₂</TableCell>
                    <TableCell><Chip label={rec.difficulty} size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={rec.impact} color={rec.impact === 'High' ? 'primary' : 'default'} size="small" /></TableCell>
                  </TableRow>
                ))}
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
              📅 Activity Logging Heatmap (Consistency Grid)
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
              🗺️ Carbon Journey Timeline
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
                <Typography variant="caption" color="text.secondary">Monthly active user average</Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper className="glass-card" sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Your Footprint ({selectedCategory})</Typography>
                <Typography variant="h3" fontWeight={900}>{totalEmissions.toFixed(1)} kg</Typography>
                <Typography variant="caption" color="text.secondary">Current period emissions</Typography>
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
