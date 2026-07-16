import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Grid, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from '@mui/material';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const OrganizationDashboard = () => {
  const { user, updateProfileState } = useAuth();
  
  const [orgLink, setOrgLink] = useState(null); // OrganizationUser link
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);

  // Form states
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('Business');
  const [empEmail, setEmpEmail] = useState('');
  const [empRole, setEmpRole] = useState('ORG_USER');
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrgDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await api.get('/api/organizations');
      if (res.data.success && res.data.data.length > 0) {
        const link = res.data.data[0]; // Fetch first organization user is part of
        setOrgLink(link);

        // Fetch reports
        const repRes = await api.get(`/api/organizations/${link.organization.id}/reports`);
        if (repRes.data.success) {
          setReports(repRes.data.data);
        }

        // Fetch employees if ORG_ADMIN
        if (link.role === 'ORG_ADMIN' || user.role === 'ADMIN') {
          const empRes = await api.get(`/api/organizations/${link.organization.id}/employees`);
          if (empRes.data.success) {
            setEmployees(empRes.data.data);
          }
        }
      }
    } catch (e) {
      setError('Could not retrieve organization information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgDetails();
  }, []);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/api/organizations', {
        organizationName: orgName,
        organizationType: orgType
      });
      if (res.data.success) {
        setSuccess('Organization established successfully!');
        updateProfileState({ role: 'ORG_ADMIN' });
        fetchOrgDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to establish organization.');
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/api/organizations/${orgLink.organization.id}/employees`, {
        email: empEmail,
        role: empRole
      });
      if (res.data.success) {
        setSuccess('Employee added successfully!');
        setEmpEmail('');
        fetchOrgDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee.');
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/api/organizations/${orgLink.organization.id}/reports?month=${reportMonth}&year=${reportYear}`);
      if (res.data.success) {
        setSuccess('Monthly sustainability report generated!');
        fetchOrgDetails();
      }
    } catch (err) {
      setError('Failed to generate report.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Loading organization details...</Typography>
      </Box>
    );
  }

  // Render onboarding if user has no linked organization
  if (!orgLink) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card>
          <CardContent>
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
                Institutional Sustainability
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connect your business, school, or organization to track aggregated carbon footprints and report group impact.
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <form onSubmit={handleCreateOrg}>
              <Stack spacing={3}>
                <TextField
                  label="Organization Name"
                  fullWidth
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />

                <TextField
                  select
                  label="Organization Type"
                  fullWidth
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                >
                  <MenuItem value="Business">Business / Corporation</MenuItem>
                  <MenuItem value="School">School / University</MenuItem>
                  <MenuItem value="Institution">Government / NGO</MenuItem>
                  <MenuItem value="Community">Community Group</MenuItem>
                </TextField>

                <Button type="submit" variant="contained" color="primary" fullWidth size="large">
                  Create Organization
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const isOrgAdmin = orgLink.role === 'ORG_ADMIN';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={800} gutterBottom>
        Organization Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage employees, monitor team baselines, and review sustainability reports for <strong>{orgLink.organization.organizationName}</strong> ({orgLink.organization.organizationType}).
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Grid container spacing={4}>
        {/* Reports Panel */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Monthly Sustainability Reports
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Report Period</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="right">Aggregated CO2 (kg)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center">No reports generated yet.</TableCell>
                  </TableRow>
                ) : (
                  reports.map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell>{rep.reportMonth}/{rep.reportYear}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {rep.totalEmission.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Admin Controls */}
        <Grid item xs={12} md={5}>
          {isOrgAdmin ? (
            <Stack spacing={4}>
              {/* Add Employee Form */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Add Employee / Member
                  </Typography>
                  <form onSubmit={handleAddEmployee}>
                    <Stack spacing={2.5}>
                      <TextField
                        label="User Email Address"
                        type="email"
                        fullWidth
                        required
                        value={empEmail}
                        onChange={(e) => setEmpEmail(e.target.value)}
                      />
                      <TextField
                        select
                        label="Assigned Role"
                        fullWidth
                        value={empRole}
                        onChange={(e) => setEmpRole(e.target.value)}
                      >
                        <MenuItem value="ORG_USER">Employee (ORG_USER)</MenuItem>
                        <MenuItem value="ORG_ADMIN">Manager (ORG_ADMIN)</MenuItem>
                      </TextField>
                      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 1 }}>
                        Add User
                      </Button>
                    </Stack>
                  </form>
                </CardContent>
              </Card>

              {/* Generate Report Form */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Generate Aggregated Report
                  </Typography>
                  <form onSubmit={handleGenerateReport}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Month (1-12)"
                          type="number"
                          fullWidth
                          required
                          value={reportMonth}
                          onChange={(e) => setReportMonth(e.target.value)}
                          inputProps={{ min: 1, max: 12 }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Year"
                          type="number"
                          fullWidth
                          required
                          value={reportYear}
                          onChange={(e) => setReportYear(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button type="submit" variant="outlined" color="primary" fullWidth>
                          Calculate & Save Report
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Stack>
          ) : (
            <Card sx={{ background: 'rgba(17,24,39,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Member Role</Typography>
                <Typography variant="body2" color="text.secondary">
                  You are registered as an **Employee (ORG_USER)**. Sustainability reports and employee management settings are restricted to organization administrators.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Employees Table (Visible to Org Admin) */}
        {isOrgAdmin && (
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Members List
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>Org Role</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.user.fullName}</TableCell>
                      <TableCell>{emp.user.email}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: emp.role === 'ORG_ADMIN' ? 'secondary.main' : 'text.primary' }}>
                        {emp.role}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default OrganizationDashboard;
