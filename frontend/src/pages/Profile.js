import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Grid, Avatar, Select, MenuItem, InputLabel, FormControl, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const Profile = () => {
  const { updateProfileState } = useAuth();
  
  const [profileTab, setProfileTab] = useState(0);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    sustainabilityPreferences: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    state: '',
    city: '',
    profileImageUrl: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Activity History Tab States
  const [activityHistory, setActivityHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('all'); // today, 7days, 30days, all
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/profile');
      if (res.data.success) {
        const p = res.data.data;
        setProfile({
          fullName: p.fullName || '',
          email: p.email || '',
          mobileNumber: p.mobileNumber || '',
          sustainabilityPreferences: p.sustainabilityPreferences || '',
          dateOfBirth: p.dateOfBirth || '',
          gender: p.gender || '',
          country: p.country || '',
          state: p.state || '',
          city: p.city || '',
          profileImageUrl: p.profileImageUrl || ''
        });
      }
    } catch (err) {
      setError('Failed to fetch profile info.');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityHistory = async (pageNumber = page, filter = historyFilter) => {
    try {
      const res = await api.get(`/api/v1/user/activity-history?page=${pageNumber}&size=10`);
      if (res.data.success) {
        let content = res.data.data.content || [];
        
        // Filter by date range if applicable
        const now = new Date();
        if (filter === 'today') {
          content = content.filter(act => {
            const actDate = new Date(act.createdAt);
            return actDate.toDateString() === now.toDateString();
          });
        } else if (filter === '7days') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          content = content.filter(act => new Date(act.createdAt) >= sevenDaysAgo);
        } else if (filter === '30days') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          content = content.filter(act => new Date(act.createdAt) >= thirtyDaysAgo);
        }

        setActivityHistory(content);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load activity logs', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchActivityHistory(0, 'all');
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setError('');
    setSuccess('');
    try {
      const res = await api.post('/api/profile/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setProfile(prev => ({ ...prev, profileImageUrl: res.data.data }));
        updateProfileState({ profileImageUrl: res.data.data });
        setSuccess('Profile picture uploaded successfully!');
      }
    } catch (err) {
      setError('Image upload failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await api.put('/api/profile', profile);
      if (res.data.success) {
        setSuccess('Profile updated successfully!');
        updateProfileState({ fullName: profile.fullName });
      }
    } catch (err) {
      setError('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = (filter) => {
    setHistoryFilter(filter);
    setPage(0);
    fetchActivityHistory(0, filter);
  };

  const handlePageChange = (direction) => {
    const newPage = direction === 'next' ? page + 1 : page - 1;
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      fetchActivityHistory(newPage, historyFilter);
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
      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
        <Box position="relative">
          <Avatar
            src={profile.profileImageUrl ? `http://127.0.0.1:8080${profile.profileImageUrl}` : undefined}
            sx={{ width: 100, height: 100, bgcolor: 'secondary.main', fontSize: '2.5rem' }}
          >
            {profile.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <IconButton
            color="primary"
            component="label"
            sx={{
              position: 'absolute',
              bottom: -5,
              right: -5,
              backgroundColor: 'background.paper',
              '&:hover': { backgroundColor: 'background.paper' }
            }}
          >
            <input hidden accept="image/*" type="file" onChange={handleFileChange} />
            <PhotoCameraIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
          {profile.fullName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {profile.email}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Tabs 
        value={profileTab} 
        onChange={(e, nv) => setProfileTab(nv)} 
        sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 4 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Edit Profile Information" />
        <Tab label="My Activity History Logs" />
      </Tabs>

      {/* Tab 0: Edit Profile */}
      {profileTab === 0 && (
        <Card sx={{ p: 2 }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    name="fullName"
                    fullWidth
                    required
                    value={profile.fullName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Mobile Number"
                    name="mobileNumber"
                    fullWidth
                    value={profile.mobileNumber}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={profile.dateOfBirth}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      label="Gender"
                      name="gender"
                      value={profile.gender}
                      onChange={handleChange}
                    >
                      <MenuItem value="MALE">Male</MenuItem>
                      <MenuItem value="FEMALE">Female</MenuItem>
                      <MenuItem value="OTHER">Other</MenuItem>
                      <MenuItem value="PREFER_NOT_TO_SAY">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Country"
                    name="country"
                    fullWidth
                    value={profile.country}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="State / Province"
                    name="state"
                    fullWidth
                    value={profile.state}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City"
                    name="city"
                    fullWidth
                    value={profile.city}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Sustainability Preferences (e.g. Vegetarian, EV Driver, Solar Panels)"
                    name="sustainabilityPreferences"
                    fullWidth
                    multiline
                    rows={3}
                    value={profile.sustainabilityPreferences}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} display="flex" justifyContent="flex-end">
                  <Button type="submit" variant="contained" color="primary" size="large" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Activity History */}
      {profileTab === 1 && (
        <Card sx={{ p: 2.5 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
              <Typography variant="h6" fontWeight={700}>
                User Activity Audit Trail
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant={historyFilter === 'today' ? 'contained' : 'outlined'} onClick={() => handleFilterChange('today')}>
                  Today
                </Button>
                <Button size="small" variant={historyFilter === '7days' ? 'contained' : 'outlined'} onClick={() => handleFilterChange('7days')}>
                  Last 7 Days
                </Button>
                <Button size="small" variant={historyFilter === '30days' ? 'contained' : 'outlined'} onClick={() => handleFilterChange('30days')}>
                  Last 30 Days
                </Button>
                <Button size="small" variant={historyFilter === 'all' ? 'contained' : 'outlined'} onClick={() => handleFilterChange('all')}>
                  All History
                </Button>
              </Stack>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Page</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activityHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No actions logged in this period.</TableCell>
                    </TableRow>
                  ) : (
                    activityHistory.map((act) => (
                      <TableRow key={act.id}>
                        <TableCell>
                          <Chip 
                            label={act.activityName} 
                            size="small" 
                            color={
                              act.activityType === 'CREATE' ? 'primary' :
                              act.activityType === 'UPDATE' ? 'info' :
                              act.activityType === 'DELETE' ? 'error' :
                              act.activityType === 'LOGIN' ? 'success' : 'default'
                            }
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{act.activityDescription}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{act.pageName || 'System'}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {new Date(act.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
              <Typography variant="caption" color="text.secondary">
                Page {page + 1} of {totalPages}
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <Button size="small" variant="outlined" disabled={page === 0} onClick={() => handlePageChange('prev')}>
                  Previous
                </Button>
                <Button size="small" variant="outlined" disabled={page + 1 >= totalPages} onClick={() => handlePageChange('next')}>
                  Next
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

// Internal mini wrapper components for visual look
const CircularProgress = ({ color }) => (
  <Box display="flex" justifyContent="center"><Typography color={color}>Loading...</Typography></Box>
);

const IconButton = ({ children, color, component, sx }) => (
  <Box component={component} sx={{ cursor: 'pointer', display: 'inline-flex', p: 1, borderRadius: '50%', ...sx }}>
    {children}
  </Box>
);

export default Profile;
