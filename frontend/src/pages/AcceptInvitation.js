import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AcceptInvitation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const t = query.get('token');
    if (t) {
      setToken(t);
      validateToken(t);
    } else {
      setError('Invalid or missing invitation token.');
      setLoading(false);
    }
  }, [location]);

  const validateToken = async (t) => {
    try {
      const res = await api.get(`/api/invitations/validate?token=${t}`);
      if (res.data.success) {
        setInvitation(res.data.data);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid or expired invitation.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      // Should login first
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      setError(`This invitation is for ${invitation.email}, but you are logged in as ${user.email}. Please login with the correct account.`);
      return;
    }

    setIsAccepting(true);
    setError('');
    
    try {
      const res = await api.post('/api/invitations/accept', { token });
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to accept invitation.');
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ borderRadius: 4, p: 2, textAlign: 'center' }}>
        <CardContent>
          <Box mb={3}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 2 }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Organization Invitation
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>Successfully joined {invitation?.organizationName}! Redirecting...</Alert>}

          {!error && !success && invitation && (
            <Box>
              <Typography variant="body1" mb={1}>
                You have been invited by <strong>{invitation.invitedByName}</strong> to join <strong>{invitation.organizationName}</strong> on Carbon Tracker.
              </Typography>
              
              {!user && (
                <Alert severity="warning" sx={{ mt: 3, mb: 3, textAlign: 'left' }}>
                  You must be logged in to accept this invitation.
                </Alert>
              )}
              
              <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                fullWidth 
                onClick={handleAccept}
                disabled={isAccepting}
                sx={{ mt: 2 }}
              >
                {isAccepting ? 'Accepting...' : user ? 'Accept Invitation' : 'Login to Accept'}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AcceptInvitation;
