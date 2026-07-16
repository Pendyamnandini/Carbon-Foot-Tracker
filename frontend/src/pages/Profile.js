import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Grid, Avatar, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const Profile = () => {
  const { updateProfileState } = useAuth();
  
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

  useEffect(() => {
    fetchProfile();
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
            Profile Settings
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

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
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
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
