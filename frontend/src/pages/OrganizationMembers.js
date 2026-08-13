import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Grid, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const OrganizationMembers = () => {
  const { user } = useAuth();
  const [orgId, setOrgId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Invite Dialog State
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrgDetails = async () => {
    try {
      const res = await api.get('/api/organizations/mine');
      if (res.data.success) {
        setOrgId(res.data.data.organization.id);
      }
    } catch (e) {
      setError('Could not retrieve organization information.');
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      setError('');
      const [empRes, invRes] = await Promise.all([
        api.get(`/api/organizations/${orgId}/employees`),
        api.get(`/api/invitations/pending/${orgId}`)
      ]);
      
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (invRes.data.success) setInvitations(invRes.data.data);
    } catch (e) {
      setError('Failed to load members or invitations. ' + (e.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgDetails();
  }, []);

  useEffect(() => {
    if (orgId) {
      fetchData();
    }
  }, [orgId]);

  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    setInviteError('');
    setInviteSuccess('');
    setIsSubmitting(true);
    
    try {
      const res = await api.post(`/api/invitations/send/${orgId}`, { email: inviteEmail });
      if (res.data.success) {
        setInviteSuccess('Invitation sent successfully!');
        setInviteEmail('');
        fetchData();
      }
    } catch (e) {
      setInviteError(e.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = user?.role === 'ORG_ADMIN' || user?.role === 'ADMIN';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Team Members</Typography>
          <Typography variant="body2" color="text.secondary">Manage your organization members and invitations.</Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setInviteOpen(true)}>
            Invite Member
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Active Members</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell align="right">Joined</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employees.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{emp.user.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp.user.email}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={emp.role} size="small" color={emp.role === 'ORG_ADMIN' ? 'secondary' : 'default'} />
                          </TableCell>
                          <TableCell align="right">{new Date(emp.joinedAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Pending Invitations</Typography>
                {invitations.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No pending invitations.</Typography>
                ) : (
                  <Stack spacing={2} mt={2}>
                    {invitations.map(inv => (
                      <Box key={inv.id} p={1.5} sx={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight={600}>{inv.email}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">Invited by: {inv.invitedByName}</Typography>
                        <Typography variant="caption" color="warning.main">Expires: {new Date(inv.expiresAt).toLocaleDateString()}</Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onClose={() => { setInviteOpen(false); setInviteError(''); setInviteSuccess(''); }} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={800}>Invite a Team Member</DialogTitle>
        <DialogContent>
          <Box my={2}>
            {inviteError && <Alert severity="error" sx={{ mb: 2 }}>{inviteError}</Alert>}
            {inviteSuccess && <Alert severity="success" sx={{ mb: 2 }}>{inviteSuccess}</Alert>}
            
            <Typography variant="body2" color="text.secondary" mb={2}>
              Send an email invitation to invite someone to your organization. They must accept the invitation using the same email address.
            </Typography>
            <TextField 
              label="Email Address" 
              type="email" 
              fullWidth 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setInviteOpen(false)} color="inherit">Close</Button>
          <Button 
            onClick={handleSendInvite} 
            variant="contained" 
            color="primary"
            disabled={!inviteEmail || isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrganizationMembers;
