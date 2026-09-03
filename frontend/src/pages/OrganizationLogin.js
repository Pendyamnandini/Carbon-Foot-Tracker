import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const OrganizationLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { login } = useAuth(); // Assuming login context handles normal JWT state

  const handleOrgLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/organization/auth/login', { email, password });
      if (res.data.success) {
        const data = res.data.data;
        const loggedUser = {
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
        };
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        
        window.location.href = '/org/dashboard'; 
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
         setError('Access Denied: These credentials do not have organization privileges.');
      } else {
         setError(err.response?.data?.message || 'Organization authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', borderRadius: 4, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Box sx={{ p: 2, borderRadius: '50%', background: 'rgba(20, 184, 166, 0.1)', mb: 2 }}>
              <BusinessIcon sx={{ fontSize: 40, color: '#14b8a6' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} align="center">
              Organization Login
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" mt={1}>
              Sign in to access your organization's control panel.
            </Typography>
          </Box>

          {/* Login Type Toggle */}
          <ToggleButtonGroup
            value="org"
            exclusive
            onChange={(e, val) => {
              if (val === 'user') navigate('/login');
            }}
            fullWidth
            sx={{ mb: 4 }}
          >
            <ToggleButton value="user" sx={{ fontWeight: 600 }}>
              User
            </ToggleButton>
            <ToggleButton value="org" sx={{ fontWeight: 600 }}>
              Organizer
            </ToggleButton>
          </ToggleButtonGroup>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleOrgLogin}>
            <Stack spacing={3}>
              <TextField 
                label="Organization Email" 
                type="email" 
                fullWidth 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <TextField 
                label="Password" 
                type="password" 
                fullWidth 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth 
                size="large"
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login to Control Panel'}
              </Button>
            </Stack>
          </form>

          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              <span style={{ cursor: 'pointer', color: '#14b8a6', textDecoration: 'underline' }} onClick={() => navigate('/forgot-password')}>
                Forgot Password?
              </span>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrganizationLogin;
