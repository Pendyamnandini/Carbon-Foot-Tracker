import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Divider, Grid, InputAdornment, IconButton, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const LoginPage = () => {
  const { t } = useTranslation();
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleRoleToggle = (event, newRole) => {
    if (newRole === 'org') {
      navigate('/organization/login');
    }
  };

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
      } else if (savedUser?.role === 'ORG_ADMIN') {
        navigate('/org/dashboard');
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
              ? 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #0f172a 100%)'
              : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 40%, #f1f5f9 100%)',
            borderRight: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden',
            '@keyframes float1': {
              '0%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) translateX(10px) rotate(5deg)' },
              '100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
            },
            '@keyframes float2': {
              '0%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(20px) translateX(-15px) rotate(-5deg)' },
              '100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
            },
            '@keyframes pulseGlow': {
              '0%': { opacity: 0.6, transform: 'scale(1)' },
              '100%': { opacity: 1, transform: 'scale(1.1)' }
            }
          }}
        >
          {/* Animated Background Elements */}
          <Box sx={{
            position: 'absolute',
            width: '140%',
            height: '140%',
            background: 'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)',
            top: '-20%',
            left: '-20%',
            filter: 'blur(60px)',
            zIndex: 0,
            animation: 'pulseGlow 8s infinite alternate ease-in-out',
          }} />

          {/* Geometric Overlays */}
          <Box sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            background: theme => theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.1)',
            top: '10%',
            right: '-10%',
            animation: 'float1 12s infinite ease-in-out',
            zIndex: 0,
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(5px)'
          }} />
          <Box sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '60% 40% 30% 70% / 50% 30% 70% 40%',
            background: theme => theme.palette.mode === 'dark' ? 'rgba(6, 182, 212, 0.05)' : 'rgba(6, 182, 212, 0.1)',
            bottom: '5%',
            left: '-5%',
            animation: 'float2 15s infinite ease-in-out',
            zIndex: 0,
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(5px)'
          }} />

          {/* Glassmorphism Content Card */}
          <Box sx={{ 
            maxWidth: 500, 
            position: 'relative', 
            zIndex: 1,
            background: theme => theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 4,
            p: 5,
            border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <Typography variant="h3" fontWeight={900} gutterBottom sx={{ 
              letterSpacing: -1, 
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}>
              {t('auth.loginHeroTitle')}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2, fontWeight: 500, lineHeight: 1.6 }}>
              {t('auth.loginHeroDesc')}
            </Typography>

            {/* Quick Stats Grid */}
            <Grid container spacing={3} sx={{ mt: 5 }}>
              <Grid item xs={6}>
                <Box sx={{ 
                  borderLeft: '4px solid #10b981', 
                  pl: 2.5,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateX(5px)' }
                }}>
                  <Typography variant="h4" fontWeight={800} sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : '#0f172a' }}>10,000+</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{t('auth.tonsSaved')}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ 
                  borderLeft: '4px solid #06b6d4', 
                  pl: 2.5,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateX(5px)' }
                }}>
                  <Typography variant="h4" fontWeight={800} sx={{ color: theme => theme.palette.mode === 'dark' ? '#fff' : '#0f172a' }}>25,000+</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{t('auth.activitiesLogged')}</Typography>
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
                {t('auth.loginSubtitle')}
              </Typography>
            </Box>

            {/* Login Type Toggle */}
            <ToggleButtonGroup
              value="user"
              exclusive
              onChange={handleRoleToggle}
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

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label={t('auth.email')}
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <Box display="flex" justifyContent="flex-end">
                  <Link to="/forgot-password" style={{ color: '#10b981', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                    {t('auth.forgot_password')}
                  </Link>
                </Box>

                <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                  {loading ? t('auth.loggingIn') : t('auth.login')}
                </Button>
              </Stack>
            </form>

            <Box mt={3} mb={2}>
              <Divider>{t('auth.or')}</Divider>
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
              {t('auth.googleLogin')}
            </Button>

            <Box mt={4} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                {t('auth.noAccount')}{' '}
                <Link to="/register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                  {t('auth.registerHere')}
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
