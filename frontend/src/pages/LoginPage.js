import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Divider, Grid } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const LoginPage = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      // Check admin status or normal user to route correctly
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } else {
      setError(res.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    // Passing mock email to test Google registration and login loop
    const res = await googleLogin('google.user@carbontracker.com');
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <Grid container>
        {/* Left Side: Aesthetic Showcase */}
        <Grid 
          item 
          xs={false} 
          md={6} 
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 6,
            background: theme => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #0b0f19 0%, #111827 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRight: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative glowing gradient orbs */}
          <Box sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
            top: '-50px',
            left: '-50px',
            filter: 'blur(40px)'
          }} />
          <Box sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
            bottom: '-100px',
            right: '-100px',
            filter: 'blur(50px)'
          }} />

          <Box sx={{ maxWidth: 450, position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" fontWeight={900} gutterBottom sx={{ letterSpacing: -1, lineHeight: 1.1 }}>
              Measure, Reduce, and <Box component="span" sx={{ color: 'primary.main' }}>Offset</Box> Your Footprint.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontSize: '1.1rem', lineHeight: 1.6 }}>
              Join thousands of community members logging their daily activities, competing on the leaderboard, and completing carbon reduction goals.
            </Typography>

            {/* Quick Stats Grid */}
            <Grid container spacing={2} sx={{ mt: 6 }}>
              <Grid item xs={6}>
                <Box sx={{ borderLeft: '3px solid #10b981', pl: 2 }}>
                  <Typography variant="h5" fontWeight={800} color="primary.main">10,000+</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>TONS CO2 SAVED</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ borderLeft: '3px solid #06b6d4', pl: 2 }}>
                  <Typography variant="h5" fontWeight={800} color="secondary.main">25,000+</Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>ACTIVITIES LOGGED</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Right Side: Form */}
        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 4
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            {/* Logo / Header */}
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" fontWeight={900} sx={{ display: 'inline-flex', alignItems: 'center', mb: 1 }}>
                <Box component="span" sx={{ color: 'primary.main', mr: 1 }}>♻</Box>
                Carbon<Box component="span" sx={{ color: 'secondary.main', fontWeight: 300 }}>Tracker</Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to manage your carbon footprint logs and tracker.
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Email Address"
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
                
                <Box display="flex" justifyContent="flex-end">
                  <Link to="/forgot-password" style={{ color: '#10b981', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                    Forgot Password?
                  </Link>
                </Box>

                <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>
            </form>

            <Box mt={3} mb={2}>
              <Divider>Or</Divider>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
              sx={{ color: 'text.primary', borderColor: 'divider', '&:hover': { borderColor: 'primary.main' } }}
            >
              Sign In with Google
            </Button>

            <Box mt={4} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                  Register here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginPage;
