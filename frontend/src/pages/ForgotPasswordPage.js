import React, { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack } from '@mui/material';
import api from '../api';
import { useTranslation } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess('OTP sent successfully! Redirecting to OTP Verification...');
        setTimeout(() => navigate(`/verify-otp?email=${encodeURIComponent(email)}`), 2000);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset');
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
              {t('auth.forgotPasswordTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('auth.forgotPasswordSubtitle')}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

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

              <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                {loading ? t('auth.forgotPasswordSending') : t('auth.forgotPasswordBtn')}
              </Button>
            </Stack>
          </form>

          <Box mt={3} textAlign="center">
            <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              {t('auth.loginHere')}
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ForgotPasswordPage;
