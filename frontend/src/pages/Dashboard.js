import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Alert, CircularProgress, Stack, Tooltip, LinearProgress, TextField } from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, Tooltip as ChartTooltip, BarChart, Bar } from 'recharts';
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

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [categoryData, setCategoryData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  
  const [stats, setStats] = useState({
    monthlyFootprint: 0,
    weeklyFootprint: 0,
    goalProgress: 0,
    rank: 'N/A'
  });

  const COLORS = ['#10b981', '#06b6d4', '#fbbf24', '#f87171']; // Emerald, Cyan, Amber, Rose

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch category emissions
      const categoryRes = await api.get('/api/analytics/category');
      if (categoryRes.data.success) {
        const catMap = categoryRes.data.data;
        const formattedCat = Object.keys(catMap).map(key => ({
          name: key,
          value: parseFloat(catMap[key].toFixed(2))
        })).filter(c => c.value > 0);
        setCategoryData(formattedCat);
      }

      // 2. Fetch weekly trend logs
      const weeklyRes = await api.get('/api/analytics/weekly');
      if (weeklyRes.data.success) {
        const list = weeklyRes.data.data;
        const formattedWeekly = list.map(item => ({
          name: `Wk ${item.weekNumber}`,
          Emissions: parseFloat(item.overallTotal.toFixed(2))
        }));
        setWeeklyData(formattedWeekly);
      }

      // 3. Fetch monthly logs
      const monthlyRes = await api.get('/api/analytics/monthly');
      if (monthlyRes.data.success) {
        const map = monthlyRes.data.data;
        const formattedMonthly = Object.keys(map).map(key => ({
          name: key,
          Emissions: parseFloat(map[key].toFixed(2))
        }));
        setMonthlyData(formattedMonthly);
      }

      // 4. Fetch Goals and calculate average progress
      const goalsRes = await api.get('/api/goals');
      let avgProgress = 0;
      if (goalsRes.data.success) {
        const activeGoals = goalsRes.data.data.filter(g => g.status === 'ACTIVE');
        if (activeGoals.length > 0) {
          const sum = activeGoals.reduce((acc, g) => acc + g.currentProgress, 0);
          avgProgress = sum / activeGoals.length;
        }
      }

      // 5. Fetch Leaderboard and find user rank
      const leaderboardRes = await api.get('/api/leaderboard');
      let userRank = 'N/A';
      let currentMonthFootprint = 0;
      let currentWeeklyFootprint = 0;
      if (leaderboardRes.data.success) {
        const list = leaderboardRes.data.data;
        const userSaved = JSON.parse(localStorage.getItem('user'));
        const userEntry = list.find(entry => entry.userId === userSaved?.id);
        if (userEntry) {
          userRank = `#${userEntry.rankPosition}`;
          currentMonthFootprint = userEntry.carbonEmission;
        }
      }

      // Calculate current week footprint from weekly summary
      const currentWeekNumber = getWeekNumber(new Date());
      const currentYear = new Date().getFullYear();
      const currentWeekSummary = weeklyRes.data.data.find(w => w.weekNumber === currentWeekNumber && w.year === currentYear);
      if (currentWeekSummary) {
        currentWeeklyFootprint = currentWeekSummary.overallTotal;
      }

      // 6. Fetch all logs for daily breakdown
      const logsRes = await api.get('/api/activities');
      if (logsRes.data.success) {
        const logsList = logsRes.data.data;
        setAllLogs(logsList);
        // Set default selected date to the most recent log's date, if any
        if (logsList.length > 0) {
          const sortedLogs = [...logsList].sort((a, b) => b.logDate.localeCompare(a.logDate));
          setSelectedDate(sortedLogs[0].logDate);
        }
      }

      setStats({
        monthlyFootprint: currentMonthFootprint,
        weeklyFootprint: currentWeeklyFootprint,
        goalProgress: avgProgress,
        rank: userRank
      });

    } catch (err) {
      setError('Could not retrieve analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return weekNo;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  const dailyMap = {};
  allLogs.forEach(log => {
    dailyMap[log.logDate] = (dailyMap[log.logDate] || 0) + log.carbonEmission;
  });
  const dailyChartData = Object.keys(dailyMap)
    .sort()
    .slice(-7)
    .map(date => ({
      date,
      name: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      Emissions: parseFloat(dailyMap[date].toFixed(2))
    }));

  const selectedLogs = allLogs.filter(log => log.logDate === selectedDate);

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
        Sustainability Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card-hover" sx={{ position: 'relative', overflow: 'hidden' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Current Month Footprint
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {stats.monthlyFootprint.toFixed(1)} <Typography variant="caption" sx={{ fontWeight: 500 }}>kg CO2</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, fontWeight: 500 }}>
                    Logged this month
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(248, 113, 113, 0.1)', color: 'error.main', width: 44, height: 44 }}>
                  <Co2Icon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card-hover">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Weekly Footprint
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {stats.weeklyFootprint.toFixed(1)} <Typography variant="caption" sx={{ fontWeight: 500 }}>kg CO2</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, fontWeight: 500 }}>
                    Active week tracking
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(6, 182, 212, 0.1)', color: 'secondary.main', width: 44, height: 44 }}>
                  <CalendarMonthIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card-hover">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Goal Progress (Avg)
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                    {stats.goalProgress.toFixed(0)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: 'primary.main', width: 44, height: 44 }}>
                  <FlagIcon />
                </Avatar>
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={stats.goalProgress} 
                sx={{ height: 6, borderRadius: 3, bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} 
                color="primary" 
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="glass-card-hover">
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Leaderboard Rank
                  </Typography>
                  <Typography variant="h4" fontWeight={800} sx={{ mt: 1 }}>
                    {stats.rank}
                  </Typography>
                  <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1, fontWeight: 700 }}>
                    Active Challenger
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(251, 191, 36, 0.1)', color: 'warning.main', width: 44, height: 44 }}>
                  <EmojiEventsIcon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Category Breakdown (Pie) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
              Category Emissions Distribution
            </Typography>
            {categoryData.length === 0 ? (
              <Box height={300} display="flex" justifyContent="center" alignItems="center">
                <Typography color="text.secondary">No activity logs recorded yet.</Typography>
              </Box>
            ) : (
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
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

        {/* Weekly Trend (Line) */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
              Weekly Carbon Trend
            </Typography>
            {weeklyData.length === 0 ? (
              <Box height={300} display="flex" justifyContent="center" alignItems="center">
                <Typography color="text.secondary">Insufficient data for weekly tracking.</Typography>
              </Box>
            ) : (
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <ChartTooltip 
                      contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="Emissions" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorWeekly)" activeDot={{ r: 8 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Monthly Comparison (Bar) */}
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
              Monthly Comparison
            </Typography>
            {monthlyData.length === 0 ? (
              <Box height={300} display="flex" justifyContent="center" alignItems="center">
                <Typography color="text.secondary">No monthly logging data available.</Typography>
              </Box>
            ) : (
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <ChartTooltip 
                      contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="Emissions" fill="url(#colorMonthly)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Day-to-Day Records & Historical Inspector */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  🔍 Day-to-Day Logs Inspector
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Click on any day in the chart below to inspect that day's specific logged details.
                </Typography>
              </Box>
              <TextField
                type="date"
                label="Selected Date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                sx={{ width: 220 }}
              />
            </Box>

            {dailyChartData.length === 0 ? (
              <Box height={200} display="flex" justifyContent="center" alignItems="center">
                <Typography color="text.secondary">Log activities to view day-to-day charts.</Typography>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {/* Daily Chart */}
                <Grid item xs={12} md={7}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }} color="text.secondary">
                    Daily Emissions Trend (Last 7 Active Days)
                  </Typography>
                  <Box height={250}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={dailyChartData}
                        onClick={(state) => {
                          if (state && state.activePayload && state.activePayload.length > 0) {
                            const clickedDate = state.activePayload[0].payload.date;
                            setSelectedDate(clickedDate);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <defs>
                          <linearGradient id="colorDailyChart" x1="0" y1="0" x2="0" y2="1">
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
                        <Bar dataKey="Emissions" fill="url(#colorDailyChart)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>

                {/* Day Details */}
                <Grid item xs={12} md={5}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }} color="text.secondary">
                    Logged Activities on {selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Selected Day'}
                  </Typography>

                  {selectedLogs.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <Typography color="text.secondary" variant="body2">No activities recorded on this day.</Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.5} sx={{ maxHeight: 250, overflowY: 'auto', pr: 1 }}>
                      {selectedLogs.map((log) => {
                        const catDetails = getCategoryDetails(log.category);
                        return (
                          <Card 
                            key={log.id} 
                            variant="outlined" 
                            sx={{ 
                              p: 1.5, 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              borderColor: 'rgba(255,255,255,0.05)',
                              background: 'rgba(255,255,255,0.01)'
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Avatar sx={{ bgcolor: catDetails.bg, color: catDetails.color, width: 32, height: 32 }}>
                                {React.cloneElement(catDetails.icon, { fontSize: 'small' })}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={700}>{log.activityType}</Typography>
                                <Typography variant="caption" color="text.secondary">{log.quantity} {log.unit}</Typography>
                              </Box>
                            </Box>
                            <Typography variant="body2" fontWeight={800} color="primary.main">
                              +{log.carbonEmission.toFixed(2)} kg
                            </Typography>
                          </Card>
                        );
                      })}
                    </Stack>
                  )}
                </Grid>
              </Grid>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const Avatar = ({ children, sx }) => (
  <Box sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: '50%',
    ...sx
  }}>
    {children}
  </Box>
);

export default Dashboard;
