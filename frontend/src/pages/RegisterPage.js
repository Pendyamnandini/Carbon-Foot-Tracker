import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    if (pwd.length < minLength) {
      return "Password must be at least 8 characters long.";
    }
    if (!hasLetter || !hasNumber) {
      return "Password must be alphanumeric (contain both letters and numbers).";
    }
    if (!hasSpecial) {
      return "Password must contain at least one special character (e.g. @, #, $, %, etc.).";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
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
      setSuccess("Registration completed! Redirecting to login...");
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
              Start Your <Box component="span" sx={{ color: 'primary.main' }}>Green</Box> Journey Today.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontSize: '1.1rem', lineHeight: 1.6 }}>
              Create your account to unlock personalized recommendations, track your sustainability logs, and visualize progress in real-time.
            </Typography>

            {/* Quick Tips Box */}
            <Box sx={{ mt: 6, p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', background: 'background.paper' }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary.main" gutterBottom>
                Did you know?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Logging activities daily helps build eco-conscious habits. Average users reduce their carbon output by 15% in their first month!
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
                Join the carbon tracking platform and begin measuring impact.
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  label="Mobile Number"
                  fullWidth
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </Stack>
            </form>

            <Box mt={3} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>
                  Sign in here
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
