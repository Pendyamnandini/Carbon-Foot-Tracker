import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack } from '@mui/material';
import api from '../api';
import { useTranslation } from '../context/LanguageContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const OtpVerificationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/verify-otp', { email, otp });
      if (res.data.success) {
        setSuccess(t('auth.otpVerifySuccess'));
        setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`), 2000);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || t('auth.otpVerifyError'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSuccess(t('auth.otpResendSuccess'));
    } catch (err) {
      setError(t('auth.otpResendError'));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Card sx={{ width: '100%', p: 2 }}>
        <CardContent>
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
              {t('auth.otpTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Box component="span">{t('auth.otpSubtitle')} <strong>{email}</strong></Box>
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
                disabled
                value={email}
              />
              <TextField
                label={t('auth.otpLabel')}
                fullWidth
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: 8, fontSize: '1.25rem' } }}
              />

              <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                {loading ? t('auth.otpsending') : t('auth.otpBtnVerify')}
              </Button>
            </Stack>
          </form>

          <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
            <Button variant="text" color="secondary" onClick={handleResend} sx={{ fontSize: '0.875rem' }}>
              {t('auth.resendOtp')}
            </Button>
            <Link to="/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              {t('auth.loginHere')}
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OtpVerificationPage;
