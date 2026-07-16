import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack } from '@mui/material';
import api from '../api';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const otpParam = searchParams.get('otp');
    if (emailParam && otpParam) {
      setEmail(emailParam);
      setOtp(otpParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      if (res.data.success) {
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Card sx={{ width: '100%', p: 2 }}>
        <CardContent>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set your new account password.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="New Password"
                type="password"
                fullWidth
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                {loading ? 'Updating Password...' : 'Reset Password'}
              </Button>
            </Stack>
          </form>

          <Box mt={3} textAlign="center">
            <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              Back to Sign In
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResetPasswordPage;
