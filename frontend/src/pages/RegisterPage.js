import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Grid, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    if (pwd.length < minLength) {
      return t('auth.validationPasswordLength');
    }
    if (!hasLetter || !hasNumber) {
      return t('auth.validationPasswordAlphanumeric');
    }
    if (!hasSpecial) {
      return t('auth.validationPasswordSpecial');
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(t('profile.passwordMatchError'));
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    const res = await register(fullName, email, password, confirmPassword, mobileNumber);
    setLoading(false);

    if (res.success) {
      setSuccess(t('auth.registrationSuccess'));
      setTimeout(() => navigate('/login'), 2000);
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
              {t('auth.registerHeroTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontSize: '1.1rem', lineHeight: 1.6 }}>
              {t('auth.registerHeroDesc')}
            </Typography>

            {/* Quick Tips Box */}
            <Box sx={{ mt: 6, p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: 'background.paper' }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary.main" gutterBottom>
                {t('auth.didYouKnow')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('auth.didYouKnowDesc')}
              </Typography>
            </Box>
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
            <Box textAlign="center" mb={3}>
              <Typography variant="h4" fontWeight={900} sx={{ display: 'inline-flex', alignItems: 'center', mb: 1 }}>
                <Box component="span" sx={{ color: 'primary.main', mr: 1 }}>♻</Box>
                Carbon<Box component="span" sx={{ color: 'secondary.main', fontWeight: 300 }}>Tracker</Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('auth.registerSubtitle')}
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label={t('auth.fullName')}
                  fullWidth
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <TextField
                  label={t('auth.email')}
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  label={t('auth.mobileNumber')}
                  fullWidth
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
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
                <TextField
                  label={t('auth.confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />

                <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                  {loading ? t('auth.registering') : t('auth.register')}
                </Button>
              </Stack>
            </form>

            <Box mt={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                {t('auth.hasAccount')}{' '}
                <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                  {t('auth.loginHere')}
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterPage;
