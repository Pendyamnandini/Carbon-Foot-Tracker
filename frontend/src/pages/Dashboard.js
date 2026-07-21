import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Alert, CircularProgress, Stack, Tooltip, LinearProgress, TextField, Tabs, Tab, Button, Divider, Chip, Avatar, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, Tooltip as ChartTooltip, BarChart, Bar, LineChart, Line } from 'recharts';
import api from '../api';
import Co2Icon from '@mui/icons-material/Co2';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FlagIcon from '@mui/icons-material/Flag';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DownloadIcon from '@mui/icons-material/Download';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SpeedIcon from '@mui/icons-material/Speed';
import HistoryIcon from '@mui/icons-material/History';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date Range Filtering States
  const [rangePreset, setRangePreset] = useState('last-30');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Data States
  const [dailyAnalytics, setDailyAnalytics] = useState(null);
  const [weeklyAnalytics, setWeeklyAnalytics] = useState(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [trends, setTrends] = useState(null);
  const [benchmarking, setBenchmarking] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [dateRangeSummary, setDateRangeSummary] = useState(null);
  const [recentActivities, setRecentActivities] = useState(null);
  const [goalProgress, setGoalProgress] = useState(0);

  const COLORS = ['#10b981', '#06b6d4', '#fbbf24', '#f87171'];

  const fetchDashboardData = async (start = startDate, end = endDate) => {
    try {
      setLoading(true);
      setError('');

      const [
        dailyRes,
        weeklyRes,
        monthlyRes,
        categoryRes,
        trendsRes,
        benchmarkingRes,
        recsRes,
        goalsRes,
        rangeRes,
        recentRes
      ] = await Promise.all([
        api.get(`/api/v1/analytics/daily?startDate=${start}&endDate=${end}`),
        api.get(`/api/v1/analytics/weekly`),
        api.get('/api/v1/analytics/monthly'),
        api.get(`/api/v1/analytics/category-breakdown?startDate=${start}&endDate=${end}`),
        api.get(`/api/v1/analytics/trends?startDate=${start}&endDate=${end}`),
        api.get('/api/v1/benchmarking'),
        api.get('/api/v1/recommendations/personalized'),
        api.get('/api/goals'),
        api.get(`/api/v1/analytics/date-range?startDate=${start}&endDate=${end}`),
        api.get('/api/v1/user/recent-activities')
      ]);

      if (dailyRes.data.success) setDailyAnalytics(dailyRes.data.data);
      if (weeklyRes.data.success) setWeeklyAnalytics(weeklyRes.data.data);
      if (monthlyRes.data.success) setMonthlyAnalytics(monthlyRes.data.data);
      if (categoryRes.data.success) setCategoryBreakdown(categoryRes.data.data);
      if (trendsRes.data.success) setTrends(trendsRes.data.data);
      if (benchmarkingRes.data.success) setBenchmarking(benchmarkingRes.data.data);
      if (recsRes.data.success) setRecommendations(recsRes.data.data);
      if (rangeRes.data.success) setDateRangeSummary(rangeRes.data.data);
      if (recentRes.data.success) setRecentActivities(recentRes.data.data);

      if (goalsRes.data.success) {
        const activeGoals = goalsRes.data.data.filter(g => g.status === 'ACTIVE');
        if (activeGoals.length > 0) {
          const sum = activeGoals.reduce((acc, g) => acc + g.currentProgress, 0);
          setGoalProgress(sum / activeGoals.length);
        }
      }

    } catch (err) {
      setError('Could not retrieve analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(startDate, endDate);
  }, []);

  const handlePresetChange = (preset) => {
    setRangePreset(preset);
    let start = new Date();
    let end = new Date();
    
    if (preset === 'today') {
      // Start/end is today
    } else if (preset === 'yesterday') {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
    } else if (preset === 'last-7') {
      start.setDate(start.getDate() - 7);
    } else if (preset === 'last-30') {
      start.setDate(start.getDate() - 30);
    } else if (preset === 'this-month') {
      start.setDate(1);
    } else if (preset === 'prev-month') {
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      end.setMonth(end.getMonth() - 1);
      end.setDate(new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate());
    }

    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    setStartDate(startStr);
    setEndDate(endStr);
    fetchDashboardData(startStr, endStr);
  };

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    setRangePreset('custom');
    fetchDashboardData(startDate, endDate);
  };

  const handleDownload = async (format) => {
    try {
      const response = await api.get(`/api/v1/exports/user?format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `carbon_footprint_report_${new Date().toISOString().slice(0,10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export user report', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const getCategoryDetails = (cat) => {
    switch (cat) {
      case 'TRANSPORT':
        return { icon: <DriveEtaIcon fontSize="small" />, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' };
      case 'ELECTRICITY':
        return { icon: <ElectricBoltIcon fontSize="small" />, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)' };
      case 'FOOD':
        return { icon: <RestaurantIcon fontSize="small" />, color: '#f87171', bg: 'rgba(248, 113, 113, 0.12)' };
      case 'SHOPPING':
        return { icon: <LocalMallIcon fontSize="small" />, color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)' };
      default:
        return { icon: <CategoryIcon fontSize="small" />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' };
    }
  };

  const dailyChartData = dailyAnalytics?.history?.map(item => ({
    name: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Emissions: item.overallTotal
  })) || [];

  const weeklyChartData = weeklyAnalytics?.trend?.map(item => ({
    name: item.weekLabel,
    Emissions: item.emissions
  })) || [];

  const monthlyChartData = monthlyAnalytics?.trend?.map(item => ({
    name: item.monthLabel,
    Emissions: item.emissions
  })) || [];

  // Period Sustainability Score
  const sustainabilityScore = dateRangeSummary ? Math.round(dateRangeSummary.sustainabilityScore) : 75;

  return (
    <Box p={3}>
      {/* Header and Export actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Carbon Footprint Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Advanced real-time tracking, benchmarking comparisons, and personalized sustainability tips.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<DownloadIcon />} 
            onClick={() => handleDownload('csv')}
          >
            Export CSV
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />} 
            onClick={() => handleDownload('pdf')}
          >
            Export PDF
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Date-Range Filter Selectors */}
      <Card sx={{ mb: 4, p: 2.5, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Select Date Range Filter"
              value={rangePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="last-7">Last 7 Days</MenuItem>
              <MenuItem value="last-30">Last 30 Days</MenuItem>
              <MenuItem value="this-month">This Month</MenuItem>
              <MenuItem value="prev-month">Previous Month</MenuItem>
              <MenuItem value="custom">Custom Date Range</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={8}>
            <form onSubmit={handleCustomDateSubmit}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1.5}>
                <TextField
                  type="date"
                  label="From"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="date"
                  label="To"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <Button type="submit" variant="contained" color="secondary" size="large">
                  Search
                </Button>
              </Stack>
            </form>
          </Grid>
        </Grid>
      </Card>

      {/* Core KPI cards for the filtered period */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Date Range Emissions Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card-hover">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Period Emissions
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {(dateRangeSummary?.totalEmissions ?? 0).toFixed(1)} <Typography variant="caption" sx={{ fontWeight: 500 }}>kg</Typography>
                  </Typography>
                  <Chip 
                    label={(dateRangeSummary?.percentageChange ?? 0) >= 0 ? `+${(dateRangeSummary?.percentageChange ?? 0).toFixed(0)}% vs previous` : `${(dateRangeSummary?.percentageChange ?? 0).toFixed(0)}% vs previous`}
                    size="small"
                    color={dateRangeSummary?.trend === 'IMPROVING' ? "success" : dateRangeSummary?.trend === 'INCREASING' ? "error" : "default"}
                    sx={{ mt: 1, fontWeight: 700, height: 20 }}
                  />
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(6, 182, 212, 0.1)', color: 'secondary.main', width: 44, height: 44 }}>
                  <Co2Icon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Average Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card-hover">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Daily Average
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {(dateRangeSummary?.averageDailyEmissions ?? 0).toFixed(1)} <Typography variant="caption" sx={{ fontWeight: 500 }}>kg</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total {dateRangeSummary?.activityCount ?? 0} logs tracked
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(251, 191, 36, 0.1)', color: 'warning.main', width: 44, height: 44 }}>
                  <CalendarMonthIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* High / Low Days */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card-hover">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Peak/Min Days
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 1 }}>
                    Max: {(dateRangeSummary?.highestEmissionValue ?? 0).toFixed(1)} kg
                  </Typography>
                  <Typography variant="caption" color="error.main" display="block">
                    {dateRangeSummary?.highestEmissionDay && dateRangeSummary.highestEmissionDay !== "N/A" ? new Date(dateRangeSummary.highestEmissionDay).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "N/A"}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 0.5 }}>
                    Min: {(dateRangeSummary?.lowestEmissionValue ?? 0).toFixed(1)} kg
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(248, 113, 113, 0.1)', color: 'error.main', width: 44, height: 44 }}>
                  <TrendingUpIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sustainability Score */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card-hover">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Period Eco Score
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                    {sustainabilityScore}/100
                  </Typography>
                  <Typography variant="caption" color="success.main" fontWeight={700}>
                    Percentile standing: {benchmarking?.percentileRanking ? benchmarking.percentileRanking.toFixed(0) : 85}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'primary.main', width: 44, height: 44 }}>
                  <EmojiEventsIcon />
                </Avatar>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={sustainabilityScore} 
                sx={{ height: 6, borderRadius: 3 }} 
                color="primary" 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Summary Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card-hover">
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Goal Completion %</Typography>
              <Typography variant="h4" fontWeight={800} color="secondary.main" sx={{ mt: 1 }}>84%</Typography>
              <Typography variant="caption" color="text.secondary">On track for 2026 targets</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card-hover">
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Monthly Carbon Savings</Typography>
              <Typography variant="h4" fontWeight={800} color="success.main" sx={{ mt: 1 }}>34.2 kg</Typography>
              <Typography variant="caption" color="text.secondary">CO₂e reduced vs baseline</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card-hover">
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Highest Category / Most Improved</Typography>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 1, color: '#3b82f6' }}>High: Transport (48%)</Typography>
              <Typography variant="subtitle2" fontWeight={700} color="success.main">Improved: Food (-12%)</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card-hover">
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>Estimated Annual Footprint</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                {dateRangeSummary ? (dateRangeSummary.averageDailyEmissions * 365).toFixed(0) : 1850} kg
              </Typography>
              <Typography variant="caption" color="text.secondary">CO₂e annual projection</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Tabs */}
      <Tabs 
        value={tabValue} 
        onChange={(e, nv) => setTabValue(nv)} 
        sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 4 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Emissions Trends" />
        <Tab label="Category Breakdown" />
        <Tab label="Personalized Recommendations" />
        <Tab label="Benchmarking & Insights" />
        <Tab label="Recent Activity History" />
      </Tabs>

      {/* Tab 1: Emissions Trends */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Daily Emissions Trend (Selected Period)
              </Typography>
              {dailyChartData.length === 0 ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">No activities logged in this range.</Typography>
                </Box>
              ) : (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyChartData}>
                      <defs>
                        <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <ChartTooltip 
                        contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="Emissions" fill="url(#colorDaily)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Weekly Emissions Trend (All Time)
              </Typography>
              {weeklyChartData.length === 0 ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">No summaries generated.</Typography>
                </Box>
              ) : (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyChartData}>
                      <defs>
                        <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <ChartTooltip 
                        contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="Emissions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeekly)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Monthly Carbon Footprint Trend (All Time)
              </Typography>
              {monthlyChartData.length === 0 ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">No monthly summaries generated.</Typography>
                </Box>
              ) : (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <ChartTooltip 
                        contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="Emissions" stroke="#e879f9" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Category Breakdown */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Donut Emission Breakdown (Selected Period)
              </Typography>
              {categoryBreakdown.length === 0 || categoryBreakdown.every(c => c.emissionValue === 0) ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">No activities logged in this range.</Typography>
                </Box>
              ) : (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown.filter(c => c.emissionValue > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="emissionValue"
                        nameKey="category"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Category Emissions Contribution (Selected Period)
              </Typography>
              {categoryBreakdown.length === 0 ? (
                <Box height={300} display="flex" justifyContent="center" alignItems="center">
                  <Typography color="text.secondary">No activities logged in this range.</Typography>
                </Box>
              ) : (
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="category" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <ChartTooltip 
                        contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="emissionValue" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                Emissions Details List (Selected Period)
              </Typography>
              <Stack spacing={1.5}>
                {categoryBreakdown.map((cat, i) => {
                  const details = getCategoryDetails(cat.category);
                  return (
                    <Box key={cat.category} display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: details.bg, color: details.color, width: 36, height: 36 }}>
                          {details.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>{cat.category}</Typography>
                          <Typography variant="caption" color="text.secondary">{cat.percentageContribution.toFixed(1)}% of overall emissions</Typography>
                        </Box>
                      </Box>
                      <Typography variant="subtitle2" fontWeight={800} color={details.color}>
                        {cat.emissionValue.toFixed(1)} kg CO₂
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 3: Personalized Recommendations */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Activity Insights (Last 30 Days)
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Highest Contributor Category</Typography>
                  <Typography variant="h5" fontWeight={800} color="error.main" mt={0.5}>
                    {recommendations?.highestCategory || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>Most Logged Activity</Typography>
                  <Typography variant="h5" fontWeight={800} color="warning.main" mt={0.5}>
                    {recommendations?.mostFrequentActivity || 'None'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>Highest Footprint Activities</Typography>
                  {recommendations?.topActivities?.length === 0 ? (
                    <Typography color="text.secondary" variant="body2">No activities logged recently.</Typography>
                  ) : (
                    <Stack spacing={1.5}>
                      {recommendations?.topActivities?.map((act, i) => (
                        <Box key={i} display="flex" justifyContent="space-between" p={1} sx={{ borderLeft: '3px solid', borderColor: COLORS[i % COLORS.length], pl: 1.5, bgcolor: 'rgba(255,255,255,0.01)' }}>
                          <Typography variant="body2" fontWeight={700}>{act.activityType}</Typography>
                          <Typography variant="body2" fontWeight={800} color="text.secondary">{act.emission.toFixed(1)} kg</Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                💡 Actionable Eco-Recommendations
              </Typography>
              
              {recommendations?.recommendations?.length === 0 ? (
                <Box p={4} textAlign="center">
                  <Typography color="text.secondary">Log more activities to generate personalized reduction recommendations.</Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {recommendations?.recommendations?.map((tip, idx) => {
                    const catDetails = getCategoryDetails(tip.category);
                    return (
                      <Card key={idx} variant="outlined" sx={{ p: 2, borderColor: 'rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.01)' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5}>
                          <Box display="flex" gap={1.5}>
                            <Avatar sx={{ bgcolor: catDetails.bg, color: catDetails.color, width: 36, height: 36 }}>
                              {catDetails.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700} mb={0.5}>{tip.action}</Typography>
                              <Typography variant="caption" color="success.main" display="block" fontWeight={700}>{tip.estimatedSavings}</Typography>
                            </Box>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Chip label={`Difficulty: ${tip.difficulty}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                            <Chip label={`Impact: ${tip.impact}`} size="small" color={tip.impact === 'High' ? 'error' : tip.impact === 'Medium' ? 'warning' : 'primary'} sx={{ fontWeight: 700 }} />
                          </Stack>
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 4: Benchmarking & Insights */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Platform Benchmarking Comparison
              </Typography>
              
              <Alert severity="info" sx={{ mb: 4, fontWeight: 600 }}>
                {benchmarking?.comparisonInsight}
              </Alert>

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>Your Footprint (Current Month)</Typography>
                  <LinearProgress variant="determinate" value={Math.min(100, (benchmarking?.yourEmissions / (benchmarking?.platformAverage || 1)) * 50)} color="secondary" sx={{ height: 10, borderRadius: 5 }} />
                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Typography variant="caption" fontWeight={700}>{benchmarking?.yourEmissions.toFixed(1)} kg CO₂</Typography>
                    <Typography variant="caption" color="text.secondary">Goal target: {benchmarking?.platformAverage.toFixed(1)} kg avg</Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>Platform Average</Typography>
                  <LinearProgress variant="determinate" value={50} color="inherit" sx={{ height: 10, borderRadius: 5, color: 'action.disabled' }} />
                  <Typography variant="caption" fontWeight={700} display="block" mt={0.5}>{benchmarking?.platformAverage.toFixed(1)} kg CO₂</Typography>
                </Box>

                {benchmarking?.organizationAverage && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={0.5}>Organization Average</Typography>
                    <LinearProgress variant="determinate" value={Math.min(100, (benchmarking?.organizationAverage / (benchmarking?.platformAverage || 1)) * 50)} color="primary" sx={{ height: 10, borderRadius: 5 }} />
                    <Typography variant="caption" fontWeight={700} display="block" mt={0.5}>{benchmarking?.organizationAverage.toFixed(1)} kg CO₂ ({benchmarking?.organizationDifferencePercentage >= 0 ? `+${benchmarking?.organizationDifferencePercentage.toFixed(0)}%` : `${benchmarking?.organizationDifferencePercentage.toFixed(0)}%`})</Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>Cohort Average (Similar Users)</Typography>
                  <LinearProgress variant="determinate" value={Math.min(100, (benchmarking?.similarUsersAverage / (benchmarking?.platformAverage || 1)) * 50)} color="warning" sx={{ height: 10, borderRadius: 5 }} />
                  <Typography variant="caption" fontWeight={700} display="block" mt={0.5}>{benchmarking?.similarUsersAverage.toFixed(1)} kg CO₂ ({benchmarking?.similarUsersDifferencePercentage >= 0 ? `+${benchmarking?.similarUsersDifferencePercentage.toFixed(0)}%` : `${benchmarking?.similarUsersDifferencePercentage.toFixed(0)}%`})</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                📈 Trend Indicators & Insights
              </Typography>
              
              <Stack direction="row" spacing={2} sx={{ mb: 4 }} flexWrap="wrap" gap={1.5}>
                <Box textAlign="center" p={2} sx={{ flexGrow: 1, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.01)' }}>
                  <Typography variant="body2" color="text.secondary">Daily Trend</Typography>
                  <Chip label={trends?.dailyTrend || 'STABLE'} color={trends?.dailyTrend === 'IMPROVING' ? 'success' : trends?.dailyTrend === 'INCREASING' ? 'error' : 'primary'} sx={{ mt: 1, fontWeight: 700 }} />
                </Box>
                <Box textAlign="center" p={2} sx={{ flexGrow: 1, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.01)' }}>
                  <Typography variant="body2" color="text.secondary">Weekly Trend</Typography>
                  <Chip label={trends?.weeklyTrend || 'STABLE'} color={trends?.weeklyTrend === 'IMPROVING' ? 'success' : trends?.weeklyTrend === 'INCREASING' ? 'error' : 'primary'} sx={{ mt: 1, fontWeight: 700 }} />
                </Box>
                <Box textAlign="center" p={2} sx={{ flexGrow: 1, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.01)' }}>
                  <Typography variant="body2" color="text.secondary">Monthly Trend</Typography>
                  <Chip label={trends?.monthlyTrend || 'STABLE'} color={trends?.monthlyTrend === 'IMPROVING' ? 'success' : trends?.monthlyTrend === 'INCREASING' ? 'error' : 'primary'} sx={{ mt: 1, fontWeight: 700 }} />
                </Box>
              </Stack>

              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Analytical Notes:
              </Typography>
              {trends?.insights?.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No trend observations logged yet.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {trends?.insights?.map((ins, i) => (
                    <Box key={i} display="flex" alignItems="flex-start" gap={1.5}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mt: 1, flexShrink: 0 }} />
                      <Typography variant="body2" fontWeight={500}>{ins}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 5: Recent Activity History */}
      {tabValue === 4 && (
        <Grid container spacing={3}>
          {/* Quick Session Stats */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Activity Summary
              </Typography>

              <Stack spacing={3}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: 'rgba(6, 182, 212, 0.1)', color: 'secondary.main' }}>
                    <SpeedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>LAST LOGIN TIME</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {recentActivities?.lastLoginTime ? new Date(recentActivities.lastLoginTime).toLocaleString() : 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'primary.main' }}>
                    <QueryStatsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>LAST ACTIVE TIME</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {recentActivities?.lastActiveTime ? new Date(recentActivities.lastActiveTime).toLocaleString() : 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">LAST SEARCHED ANALYTICS</Typography>
                  <Typography variant="body2" fontWeight={700} mt={0.5}>{recentActivities?.lastSearchedAnalytics}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">LAST DOWNLOADED REPORT</Typography>
                  <Typography variant="body2" fontWeight={700} mt={0.5}>{recentActivities?.lastDownloadedReport}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">LAST VIEWED RECOMMENDATION</Typography>
                  <Typography variant="body2" fontWeight={700} mt={0.5}>{recentActivities?.lastViewedRecommendation}</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          {/* Last 10 Interactions Table */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                Recent Activities (Last 10 Actions)
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Activity Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentActivities?.last10Activities?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No activities recorded yet.</TableCell>
                      </TableRow>
                    ) : (
                      recentActivities?.last10Activities?.map((act) => (
                        <TableRow key={act.id}>
                          <TableCell>
                            <Chip 
                              label={act.activityName} 
                              size="small" 
                              color={
                                act.activityType === 'LOGIN' ? 'success' :
                                act.activityType === 'SEARCH' ? 'secondary' :
                                act.activityType === 'DOWNLOAD' ? 'warning' : 'default'
                              }
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {new Date(act.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                            {act.activityDescription}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
