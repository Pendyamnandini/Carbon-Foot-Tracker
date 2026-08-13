import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, CircularProgress } from '@mui/material';
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
        // Handle token just like normal auth
        const { token, user } = res.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Use a generic hack to force context reload or use standard auth context if it reacts to localStorage
        // Ideally auth context has a specialized way to ingest token, assuming window reload works
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
            <Typography variant="body2" color="text.secondary" mt={1}>
              <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/login')}>
                Go to standard user login
              </span>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrganizationLogin;
