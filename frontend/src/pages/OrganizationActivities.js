import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Grid, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Alert, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import api from '../api';

const OrganizationActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [orgId, setOrgId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [userFilter, setUserFilter] = useState('All users');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // To populate user dropdown
  const [usersList, setUsersList] = useState([]);

  const fetchOrgDetails = async () => {
    try {
      const res = await api.get('/api/organizations/mine');
      if (res.data.success) {
        setOrgId(res.data.data.organization.id);
      }
    } catch (e) {
      setError('Could not retrieve organization information.');
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      setError('');
      let url = `/api/organizations/${orgId}/activities?`;
      if (category !== 'All categories') url += `category=${category}&`;
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;
      // User ID filter logic could be added if we store user IDs in usersList map
      
      const res = await api.get(url);
      if (res.data.success) {
        setActivities(res.data.data);
        
        // Extract unique users if not already populated
        if (usersList.length === 0) {
           const uniqueUsers = Array.from(new Set(res.data.data.map(a => a.userName)));
           setUsersList(uniqueUsers);
        }
      }
    } catch (e) {
      setError('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgDetails();
  }, []);

  useEffect(() => {
    if (orgId) {
      fetchActivities();
    }
  }, [orgId]); // fetch initial without filters

  const handleApplyFilters = () => {
    fetchActivities();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All categories');
    setUserFilter('All users');
    setStartDate('');
    setEndDate('');
    setTimeout(() => {
      fetchActivities(); // We might need to ensure states are cleared, but simplest is relying on the next render or direct fetch
    }, 100);
  };

  const setDateFilter = (type) => {
    const today = new Date();
    let start = new Date();
    let end = new Date(today);
    
    switch (type) {
      case 'today':
        break;
      case 'last7':
        start.setDate(today.getDate() - 7);
        break;
      case 'last30':
        start.setDate(today.getDate() - 30);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      case 'allTime':
        setStartDate('');
        setEndDate('');
        return;
      default:
        break;
    }
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Filter in memory for text search and user filter (since backend endpoint might not support full text search natively in our current impl)
  const filteredActivities = activities.filter(a => {
    const matchSearch = search ? 
      (a.activityType.toLowerCase().includes(search.toLowerCase()) || a.userName.toLowerCase().includes(search.toLowerCase())) : true;
    const matchUser = userFilter !== 'All users' ? a.userName === userFilter : true;
    return matchSearch && matchUser;
  });

  const totalActivities = filteredActivities.length;
  const totalEmissions = filteredActivities.reduce((sum, a) => sum + a.carbonEmission, 0);
  const activeCategories = new Set(filteredActivities.map(a => a.category)).size;
  const participatingUsers = new Set(filteredActivities.map(a => a.userEmail)).size;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header section */}
      <Card sx={{ mb: 4, borderRadius: 3, background: 'linear-gradient(to right, rgba(253, 230, 138, 0.05), rgba(254, 243, 199, 0.05))', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Chip label="ACTIVITY MONITORING" size="small" sx={{ mb: 2, background: 'rgba(251, 191, 36, 0.1)', color: '#d97706', fontWeight: 800 }} />
              <Typography variant="h4" fontWeight={900} gutterBottom>
                Carbon Activity Monitoring
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Review platform-wide carbon activities, analyse emissions and filter records by date range, user or category.
              </Typography>
            </Box>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchActivities} sx={{ borderRadius: 8 }}>
              Refresh Data
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Activities', value: totalActivities, subtitle: 'All recorded dates', icon: '📊' },
          { title: 'Total Emissions', value: `${totalEmissions.toFixed(2)} kg`, subtitle: 'All platform users', icon: '💨' },
          { title: 'Participating Users', value: participatingUsers, subtitle: 'Users in filtered results', icon: '👥' },
          { title: 'Active Categories', value: activeCategories, subtitle: 'All activity categories', icon: '🗂️' }
        ].map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card sx={{ borderRadius: 3, position: 'relative' }}>
              <CardContent>
                <Chip label="LIVE" size="small" sx={{ position: 'absolute', top: 16, right: 16, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 800, fontSize: '0.6rem' }} />
                <Typography variant="h5" sx={{ mb: 1 }}>{stat.icon}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>{stat.title}</Typography>
                <Typography variant="h4" fontWeight={800} gutterBottom>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.subtitle}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h6" fontWeight={800}>Activity Filters</Typography>
              <Typography variant="body2" color="text.secondary">Refine activity records and summary statistics.</Typography>
            </Box>
            <IconButton size="small"><FilterAltIcon /></IconButton>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" gutterBottom display="block">SEARCH ACTIVITY</Typography>
              <TextField 
                fullWidth 
                placeholder="Activity name, user, email or category" 
                size="small" 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" gutterBottom display="block">CATEGORY</Typography>
              <TextField 
                select 
                fullWidth 
                size="small" 
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <MenuItem value="All categories">All categories</MenuItem>
                <MenuItem value="Transport">Transport</MenuItem>
                <MenuItem value="Food">Food</MenuItem>
                <MenuItem value="Energy">Energy</MenuItem>
                <MenuItem value="Shopping">Shopping</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" gutterBottom display="block">USER</Typography>
              <TextField 
                select 
                fullWidth 
                size="small" 
                value={userFilter}
                onChange={e => setUserFilter(e.target.value)}
              >
                <MenuItem value="All users">All users</MenuItem>
                {usersList.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>

          <Box mt={3} mb={1}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" gutterBottom display="block">QUICK DATE FILTERS</Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button size="small" variant="outlined" onClick={() => setDateFilter('today')} sx={{ borderRadius: 8 }}>Today</Button>
              <Button size="small" variant="outlined" onClick={() => setDateFilter('last7')} sx={{ borderRadius: 8 }}>Last 7 Days</Button>
              <Button size="small" variant="outlined" onClick={() => setDateFilter('last30')} sx={{ borderRadius: 8 }}>Last 30 Days</Button>
              <Button size="small" variant="outlined" onClick={() => setDateFilter('thisMonth')} sx={{ borderRadius: 8 }}>This Month</Button>
              <Button size="small" variant="outlined" onClick={() => setDateFilter('thisYear')} sx={{ borderRadius: 8 }}>This Year</Button>
              <Button size="small" variant="outlined" onClick={() => setDateFilter('allTime')} sx={{ borderRadius: 8 }}>All Time</Button>
            </Box>
          </Box>

          <Grid container spacing={3} mt={0} alignItems="flex-end">
            <Grid item xs={12} md={4}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" gutterBottom display="block">FROM DATE</Typography>
              <TextField type="date" fullWidth size="small" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" gutterBottom display="block">TO DATE</Typography>
              <TextField type="date" fullWidth size="small" value={endDate} onChange={e => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={2}>
                <Button variant="contained" color="warning" fullWidth startIcon={<FilterAltIcon />} onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
                <Button variant="text" color="inherit" startIcon={<FilterAltOffIcon />} onClick={handleClearFilters}>
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={800}>Activity Records</Typography>
        <Typography variant="body2" color="text.secondary">{filteredActivities.length} records</Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>USER</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>CATEGORY</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>ACTIVITY TYPE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>QUANTITY</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary' }}>CO2 EMISSION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No activities found</TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{new Date(row.logDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{row.userName}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.userEmail}</Typography>
                    </TableCell>
                    <TableCell><Chip label={row.category} size="small" variant="outlined" /></TableCell>
                    <TableCell>{row.activityType}</TableCell>
                    <TableCell>{row.quantity} {row.unit}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {row.carbonEmission.toFixed(2)} kg
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

    </Container>
  );
};

export default OrganizationActivities;
