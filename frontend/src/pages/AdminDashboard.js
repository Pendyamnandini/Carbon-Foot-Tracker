import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Alert, CircularProgress, Stack, Paper, Divider, Button, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Chip } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as ChartTooltip, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import api from '../api';
import PeopleIcon from '@mui/icons-material/People';
import SpeedIcon from '@mui/icons-material/Speed';
import ForumIcon from '@mui/icons-material/Forum';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Co2Icon from '@mui/icons-material/Co2';
import FlagIcon from '@mui/icons-material/Flag';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin Activity Tracking States
  const [activityStats, setActivityStats] = useState(null);
  const [adminHistory, setAdminHistory] = useState([]);
  const [adminLogins, setAdminLogins] = useState([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [loginsPage, setLoginsPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loginsTotalPages, setLoginsTotalPages] = useState(1);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/api/v1/admin/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
      
      // Fetch activity logs audit details
      const [statsRes, histRes, loginsRes] = await Promise.all([
        api.get('/api/v1/admin/activity-stats'),
        api.get(`/api/v1/admin/user-activity-history?page=${historyPage}&size=10`),
        api.get(`/api/v1/admin/user-login-history?page=${loginsPage}&size=10`)
      ]);

      if (statsRes.data.success) setActivityStats(statsRes.data.data);
      if (histRes.data.success) {
        setAdminHistory(histRes.data.data.content || []);
        setHistoryTotalPages(histRes.data.data.totalPages || 1);
      }
      if (loginsRes.data.success) {
        setAdminLogins(loginsRes.data.data.content || []);
        setLoginsTotalPages(loginsRes.data.data.totalPages || 1);
      }

    } catch (e) {
      setError('Could not retrieve platform metrics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryPage = async (newPage) => {
    try {
      const res = await api.get(`/api/v1/admin/user-activity-history?page=${newPage}&size=10`);
      if (res.data.success) {
        setAdminHistory(res.data.data.content || []);
        setHistoryTotalPages(res.data.data.totalPages || 1);
        setHistoryPage(newPage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLoginsPage = async (newPage) => {
    try {
      const res = await api.get(`/api/v1/admin/user-login-history?page=${newPage}&size=10`);
      if (res.data.success) {
        setAdminLogins(res.data.data.content || []);
        setLoginsTotalPages(res.data.data.totalPages || 1);
        setLoginsPage(newPage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDownload = async (format) => {
    try {
      const response = await api.get(`/api/v1/exports/analytics?format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `platform_analytics_report_${new Date().toISOString().slice(0,10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export platform report', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const COLORS = ['#10b981', '#06b6d4', '#fbbf24', '#f87171'];

  const categoryChartData = data ? Object.keys(data.categoryEmissions).map(key => ({
    name: key,
    value: data.categoryEmissions[key],
    percentage: data.categoryPercentages[key]
  })) : [];

  const dailyEmissionsData = data?.dailyEmissions?.map(item => ({
    name: new Date(item.timeLabel).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Emissions: item.value
  })) || [];

  const weeklyEmissionsData = data?.weeklyEmissions?.map(item => ({
    name: item.timeLabel,
    Emissions: item.value
  })) || [];

  const monthlyEmissionsData = data?.monthlyEmissions?.map(item => ({
    name: item.timeLabel,
    Emissions: item.value
  })) || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Platform Administration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive platform health overview, user activities audits, and system-wide carbon emissions.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<DownloadIcon />} 
            onClick={() => handleDownload('csv')}
          >
            Export Platform CSV
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<DownloadIcon />} 
            onClick={() => handleDownload('pdf')}
          >
            Export Platform PDF
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {data && (
        <>
          {/* Core Analytics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* User Metrics */}
            <Grid item xs={12} sm={6} md={3}>
              <Card className="glass-card-hover">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>Total Users</Typography>
                      <Typography variant="h4" fontWeight={800} mt={1}>{data.totalUsers}</Typography>
                      <Typography variant="caption" color="primary">{data.newUsersThisWeek} registered this week</Typography>
                    </Box>
                    <PeopleIcon color="primary" sx={{ fontSize: 32 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Emissions Metrics */}
            <Grid item xs={12} sm={6} md={3}>
              <Card className="glass-card-hover">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>Platform Footprint</Typography>
                      <Typography variant="h4" fontWeight={800} mt={1}>{data.totalPlatformEmissions.toFixed(0)} <Typography variant="caption" sx={{ fontWeight: 500 }}>kg</Typography></Typography>
                      <Typography variant="caption" color="text.secondary">Total CO₂ tracked</Typography>
                    </Box>
                    <Co2Icon color="secondary" sx={{ fontSize: 36 }} />
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
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>Pending Feedback</Typography>
                      <Typography variant="h4" fontWeight={800} mt={1}>{data.openFeedback}</Typography>
                      <Typography variant="caption" color="warning.main">Unresolved queries</Typography>
                    </Box>
                    <ForumIcon color="warning" sx={{ fontSize: 32 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Goal Success Metrics */}
            <Grid item xs={12} sm={6} md={3}>
              <Card className="glass-card-hover">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>Goal success rate</Typography>
                      <Typography variant="h4" fontWeight={800} mt={0.5}>{data.goalSuccessRate.toFixed(0)}%</Typography>
                    </Box>
                    <FlagIcon sx={{ fontSize: 32, color: '#e879f9' }} />
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={data.goalSuccessRate} 
                    sx={{ height: 6, borderRadius: 3, bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} 
                    color="secondary" 
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sub Tab menus */}
          <Tabs 
            value={tabValue} 
            onChange={(e, nv) => setTabValue(nv)} 
            sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 4 }}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Emission Analytics" />
            <Tab label="Category breakdown" />
            <Tab label="User Leaderboard rankings" />
            <Tab label="Goal & Badge Achievement details" />
            <Tab label="User Activities & Audits" />
          </Tabs>

          {/* Tab 1: Emission Analytics */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                    Daily Emissions (kg CO₂)
                  </Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyEmissionsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <ChartTooltip contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }} itemStyle={{ color: '#fff' }} />
                        <Bar dataKey="Emissions" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                    Weekly Emissions (kg CO₂)
                  </Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyEmissionsData}>
                        <defs>
                          <linearGradient id="colorAdminWeekly" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <ChartTooltip contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }} itemStyle={{ color: '#fff' }} />
                        <Area type="monotone" dataKey="Emissions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAdminWeekly)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                    Monthly Platform Trend (kg CO₂)
                  </Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyEmissionsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <ChartTooltip contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }} itemStyle={{ color: '#fff' }} />
                        <Bar dataKey="Emissions" fill="#e879f9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
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
                    Category Breakdown Percentage
                  </Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData.filter(c => c.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }} itemStyle={{ color: '#fff' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              {/* Counts listing */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                    Activity Category Counts
                  </Typography>
                  <Stack spacing={3}>
                    {Object.keys(data.activitiesPerCategory).map((cat, idx) => (
                      <Box key={cat}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2" color="text.secondary" fontWeight={700}>{cat}</Typography>
                          <Typography variant="caption" fontWeight={700}>{data.activitiesPerCategory[cat]} logs logged</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={data.totalActivities > 0 ? (data.activitiesPerCategory[cat] / data.totalActivities) * 100 : 0} 
                          color={idx % 2 === 0 ? "primary" : "secondary"}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 3: User Leaderboard Rankings */}
          {tabValue === 2 && (
            <Grid container spacing={4}>
              {/* Lowest Emissions (Eco-friendly) */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Top Eco-Friendly Users (Lowest Footprint)
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Emissions (kg)</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Eco Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.lowestEmissionUsers.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{user.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{user.emissions.toFixed(1)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{user.sustainabilityScore.toFixed(0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Highest Emissions */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Highest Footprint Users
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Emissions (kg)</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Eco Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.highestEmissionUsers.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{user.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{user.emissions.toFixed(1)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{user.sustainabilityScore.toFixed(0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Highest Sustainability Score */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Top Sustainability Scores
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Eco Score</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Activities</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.highestSustainabilityScores.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{user.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>{user.sustainabilityScore.toFixed(0)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{user.activityCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Most Active */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Most Active Users
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Logs Count</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Emissions (kg)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.mostActiveUsers.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{user.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: 'secondary.main' }}>{user.activityCount}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{user.emissions.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}

          {/* Tab 4: Goals & Badges */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              {/* Badge Awards distribution */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                    Badges Awarded Distribution
                  </Typography>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Most Earned Badge:</Typography>
                      <Chip label={data.mostEarnedBadge} size="small" color="primary" sx={{ fontWeight: 700 }} />
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Least Earned Badge:</Typography>
                      <Chip label={data.leastEarnedBadge} size="small" color="warning" sx={{ fontWeight: 700 }} />
                    </Box>
                    <Divider />
                    {Object.keys(data.badgeDistribution).map((badgeName) => (
                      <Box key={badgeName} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                        <Typography variant="body2" fontWeight={600}>{badgeName}</Typography>
                        <Typography variant="body2" fontWeight={700} color="primary.main">{data.badgeDistribution[badgeName]} users</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Grid>

              {/* Goal Progress audits */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                    Goal Progress Audits
                  </Typography>
                  <Stack spacing={3.5}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>Goals Completed</Typography>
                      <Typography variant="h5" fontWeight={800} color="success.main">{data.goalsCompleted}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>Goals In Progress</Typography>
                      <Typography variant="h5" fontWeight={800} color="primary.main">{data.goalsInProgress}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>Total Goals Created</Typography>
                      <Typography variant="h5" fontWeight={800}>{data.goalsCreated}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" mb={0.5}>Goal Success achievement rate</Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress variant="determinate" value={data.goalSuccessRate} sx={{ height: 8, borderRadius: 4 }} color="success" />
                        </Box>
                        <Typography variant="subtitle2" fontWeight={800}>{data.goalSuccessRate.toFixed(1)}%</Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 5: User Activities & Audits */}
          {tabValue === 4 && (
            <Grid container spacing={3}>
              {/* Activity Stats Tables */}
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                    Most Visited Pages
                  </Typography>
                  <Stack spacing={1.5}>
                    {activityStats?.mostVisitedPages?.map((stat) => (
                      <Box key={stat.label} display="flex" justifyContent="space-between" py={0.5} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="body2" fontWeight={600}>{stat.label}</Typography>
                        <Typography variant="body2" fontWeight={800} color="primary.main">{stat.count} views</Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4, mb: 2 }}>
                    Top Downloaded Reports
                  </Typography>
                  <Stack spacing={1.5}>
                    {activityStats?.mostDownloadedReports?.map((stat) => (
                      <Box key={stat.label} display="flex" justifyContent="space-between" py={0.5} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="body2" fontWeight={600} sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 180 }}>
                          {stat.label}
                        </Typography>
                        <Typography variant="body2" fontWeight={800} color="secondary.main">{stat.count} times</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Grid>

              {/* Activity Log Audit Trails */}
              <Grid item xs={12} md={8}>
                <Card sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                    System User Activity History
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>IP / Device</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {adminHistory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center">No activities logged.</TableCell>
                          </TableRow>
                        ) : (
                          adminHistory.map((act) => (
                            <TableRow key={act.id}>
                              <TableCell>
                                <Typography variant="caption" fontWeight={700}>{act.user.fullName}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={act.activityName} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                {act.activityDescription}
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.7rem' }}>
                                {act.ipAddress}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {/* Pagination */}
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="caption">Page {historyPage + 1} of {historyTotalPages}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" disabled={historyPage === 0} onClick={() => fetchHistoryPage(historyPage - 1)}>
                        Prev
                      </Button>
                      <Button size="small" variant="outlined" disabled={historyPage + 1 >= historyTotalPages} onClick={() => fetchHistoryPage(historyPage + 1)}>
                        Next
                      </Button>
                    </Stack>
                  </Box>
                </Card>

                {/* Login History */}
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                    User Login & Session Audits
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Device Info</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {adminLogins.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center">No login history recorded.</TableCell>
                          </TableRow>
                        ) : (
                          adminLogins.map((act) => (
                            <TableRow key={act.id}>
                              <TableCell>
                                <Typography variant="caption" fontWeight={700}>{act.user.fullName}</Typography>
                                <Typography variant="caption" display="block" color="text.secondary">{act.user.email}</Typography>
                              </TableCell>
                              <TableCell sx={{ fontSize: '0.8rem' }}>{act.ipAddress}</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem' }}>{new Date(act.createdAt).toLocaleString()}</TableCell>
                              <TableCell sx={{ fontSize: '0.7rem', color: 'text.secondary', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 150 }}>
                                {act.deviceInfo}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {/* Pagination */}
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="caption">Page {loginsPage + 1} of {loginsTotalPages}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" disabled={loginsPage === 0} onClick={() => fetchLoginsPage(loginsPage - 1)}>
                        Prev
                      </Button>
                      <Button size="small" variant="outlined" disabled={loginsPage + 1 >= loginsTotalPages} onClick={() => fetchLoginsPage(loginsPage + 1)}>
                        Next
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
