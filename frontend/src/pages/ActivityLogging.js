import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Grid, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import CategoryIcon from '@mui/icons-material/Category';
import api from '../api';

const CATEGORIES = {
  TRANSPORT: {
    unit: 'Kilometers',
    types: ['Car Travel', 'Motorcycle', 'Flight', 'Bus', 'Train', 'Metro']
  },
  ELECTRICITY: {
    unit: 'kWh',
    types: ['Grid Electricity', 'Solar Energy', 'Renewable Energy']
  },
  FOOD: {
    unit: 'Servings',
    types: ['Vegetarian Meal', 'Vegan Meal', 'Chicken Meal', 'Beef Meal', 'Seafood Meal']
  },
  SHOPPING: {
    unit: 'Currency Spend',
    types: ['Clothing', 'Electronics', 'Household Products', 'Furniture']
  }
};

const ActivityLogging = () => {
  const location = useLocation();
  const [logs, setLogs] = useState([]);
  const [category, setCategory] = useState('TRANSPORT');
  const [activityType, setActivityType] = useState('Car Travel');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam && CATEGORIES[catParam.toUpperCase()]) {
      const cat = catParam.toUpperCase();
      setCategory(cat);
      setActivityType(CATEGORIES[cat].types[0]);
    }
  }, [location]);
  const [quantity, setQuantity] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().substring(0, 10));

  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  const filteredLogs = filterDate
    ? logs.filter((log) => log.logDate === filterDate)
    : logs;

  const dailyTotalEmission = filteredLogs.reduce((acc, log) => acc + log.carbonEmission, 0);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/api/activities');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (e) {
      setError('Could not retrieve activity logs.');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setCategory(cat);
    setActivityType(CATEGORIES[cat].types[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (parseFloat(quantity) < 0) {
      setError('Quantity cannot be negative');
      return;
    }

    setLoading(true);

    const payload = {
      category,
      activityType,
      quantity: parseFloat(quantity),
      logDate
    };

    try {
      if (editId) {
        const res = await api.put(`/api/activities/${editId}`, payload);
        if (res.data.success) {
          setSuccess('Activity log updated successfully!');
          setEditId(null);
        }
      } else {
        const res = await api.post('/api/activities', payload);
        if (res.data.success) {
          setSuccess('Activity logged successfully!');
        }
      }
      setQuantity('');
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Logging action failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (log) => {
    setEditId(log.id);
    setCategory(log.category);
    setActivityType(log.activityType);
    setQuantity(log.quantity.toString());
    setLogDate(log.logDate);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.delete(`/api/activities/${id}`);
      if (res.data.success) {
        setSuccess('Activity log deleted successfully!');
        fetchLogs();
      }
    } catch (err) {
      setError('Deletion failed.');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setQuantity('');
  };

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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
        Log Carbon Footprint Habits
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {/* Logging Form Card */}
      <Card sx={{ mb: 5 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
            {editId ? '✏️ Edit Selected Activity' : '🌱 Log New Activity'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Category"
                  fullWidth
                  value={category}
                  onChange={handleCategoryChange}
                >
                  {Object.keys(CATEGORIES).map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getCategoryDetails(cat).icon}
                        {cat}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Activity Type"
                  fullWidth
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                >
                  {CATEGORIES[category].types.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label={`Quantity (${CATEGORIES[category].unit})`}
                  type="number"
                  fullWidth
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  inputProps={{ step: 'any' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Log Date"
                  type="date"
                  fullWidth
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                {editId && (
                  <Button variant="outlined" color="inherit" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {editId ? 'Update Activity' : 'Log Activity'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Logs Table with Date Filter */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2, mt: 4 }}>
        <Typography variant="h6" fontWeight={700}>
          Recent Activities History
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Filter by Date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            sx={{ width: 220 }}
          />
          {filterDate && (
            <Button variant="outlined" size="small" onClick={() => setFilterDate('')}>
              Clear
            </Button>
          )}
        </Stack>
      </Box>

      {filterDate && (
        <Card 
          sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)', 
            borderColor: 'rgba(6, 182, 212, 0.2)' 
          }}
        >
          <CardContent sx={{ py: '16px !important' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Selected Date Standings
                </Typography>
                <Typography variant="subtitle1" fontWeight={800} color="text.primary" mt={0.5}>
                  {new Date(filterDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="h5" fontWeight={900} color="primary.main">
                  {dailyTotalEmission.toFixed(2)} <Typography variant="caption" color="text.secondary">kg CO2</Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {filteredLogs.length} activity logs logged on this day
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Activity</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="right">Qty</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="right">Carbon (kg)</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No logs found.</TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const catDetails = getCategoryDetails(log.category);
                return (
                  <TableRow key={log.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>{log.logDate}</TableCell>
                    <TableCell>
                      <Box display="inline-flex" alignItems="center" gap={1} sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: catDetails.bg, color: catDetails.color, fontWeight: 700, fontSize: '0.75rem' }}>
                        {catDetails.icon}
                        {log.category}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{log.activityType}</TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>{log.quantity} {log.unit}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {log.carbonEmission.toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton color="secondary" onClick={() => handleEdit(log)} size="small" sx={{ '&:hover': { bgcolor: 'rgba(6, 182, 212, 0.08)' } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(log.id)} size="small" sx={{ '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.08)' } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ActivityLogging;
