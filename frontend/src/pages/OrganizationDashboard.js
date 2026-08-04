import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Grid, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Chip, Tabs, Tab } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as ChartTooltip, LineChart, Line } from 'recharts';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import DownloadIcon from '@mui/icons-material/Download';
import PeopleIcon from '@mui/icons-material/People';
import SpeedIcon from '@mui/icons-material/Speed';

const OrganizationDashboard = () => {
  const { t } = useTranslation();
  const { user, updateProfileState } = useAuth();
  
  const [orgLink, setOrgLink] = useState(null); // OrganizationUser link
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);

  // Advanced Org Dashboard States
  const [employeeTrends, setEmployeeTrends] = useState([]);
  const [deptPerformance, setDeptPerformance] = useState([]);
  const [teamRankings, setTeamRankings] = useState([]);
  const [orgTabValue, setOrgTabValue] = useState(0);

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
        const orgId = link.organization.id;

        // Fetch reports
        const repRes = await api.get(`/api/organizations/${orgId}/reports`);
        if (repRes.data.success) {
          setReports(repRes.data.data);
        }

        // Fetch employees if ORG_ADMIN
        const isOrgAdmin = link.role === 'ORG_ADMIN' || user.role === 'ADMIN';
        if (isOrgAdmin) {
          const [empRes, trendsRes, deptsRes, rankingsRes] = await Promise.all([
            api.get(`/api/organizations/${orgId}/employees`),
            api.get(`/api/v1/organizations/${orgId}/employee-trends`),
            api.get(`/api/v1/organizations/${orgId}/department-performance`),
            api.get(`/api/v1/organizations/${orgId}/team-rankings`)
          ]);

          if (empRes.data.success) setEmployees(empRes.data.data);
          if (trendsRes.data.success) setEmployeeTrends(trendsRes.data.data);
          if (deptsRes.data.success) setDeptPerformance(deptsRes.data.data);
          if (rankingsRes.data.success) setTeamRankings(rankingsRes.data.data);
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
        setSuccess(t('org.successCreate'));
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
        setSuccess(t('org.successAddEmployee'));
        setEmpEmail('');
        fetchOrgDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || t('org.failAddEmployee'));
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.post(`/api/organizations/${orgLink.organization.id}/reports?month=${reportMonth}&year=${reportYear}`);
      if (res.data.success) {
        setSuccess(t('org.successReport'));
        fetchOrgDetails();
      }
    } catch (err) {
      setError(t('org.failReport'));
    }
  };

  const handleOrgExport = async (format) => {
    try {
      const response = await api.get(`/api/v1/exports/organization?orgId=${orgLink.organization.id}&format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${orgLink.organization.organizationName.toLowerCase().replace(/ /g, '_')}_sustainability_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export organization report', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>{t('org.loading')}</Typography>
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
                {t('org.institutionalTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('org.institutionalSubtitle')}
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <form onSubmit={handleCreateOrg}>
              <Stack spacing={3}>
                <TextField
                  label={t('org.orgName')}
                  fullWidth
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />

                <TextField
                  select
                  label={t('org.type')}
                  fullWidth
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                >
                  <MenuItem value="Business">{t('org.typeBusiness')}</MenuItem>
                  <MenuItem value="School">{t('org.typeSchool')}</MenuItem>
                  <MenuItem value="Institution">{t('org.typeGovernment')}</MenuItem>
                  <MenuItem value="Community">{t('org.typeCommunity')}</MenuItem>
                </TextField>

                <Button type="submit" variant="contained" color="primary" fullWidth size="large">
                  {t('org.createBtn')}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const isOrgAdmin = orgLink.role === 'ORG_ADMIN' || user.role === 'ADMIN';

  // Process data for Employee trend lines
  // Create unique month labels list
  const monthLabels = employeeTrends[0]?.emissionsOverTime?.map(d => d.timeLabel) || [];
  const processedTrendData = monthLabels.map(label => {
    const row = { name: label };
    employeeTrends.forEach(emp => {
      const match = emp.emissionsOverTime.find(d => d.timeLabel === label);
      row[emp.employeeName] = match ? match.value : 0.0;
    });
    return row;
  });

  const employeeNames = employeeTrends.map(emp => emp.employeeName);
  const COLORS = ['#10b981', '#06b6d4', '#fbbf24', '#f87171', '#a78bfa', '#ec4899', '#f97316'];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {orgLink.organization.organizationName} {t('org.dashboard')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('org.dashboardSubtitle')}
          </Typography>
        </Box>
        {isOrgAdmin && (
          <Stack direction="row" spacing={1.5}>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<DownloadIcon />} 
              onClick={() => handleOrgExport('csv')}
            >
              Export CSV
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<DownloadIcon />} 
              onClick={() => handleOrgExport('pdf')}
            >
              Export PDF
            </Button>
          </Stack>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      {/* Admin metrics card */}
      {isOrgAdmin && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card className="glass-card-hover">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{t('org.totalEmployees')}</Typography>
                    <Typography variant="h4" fontWeight={800} mt={1}>{employees.length}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('org.activeTeamMembers')}</Typography>
                  </Box>
                  <PeopleIcon color="primary" sx={{ fontSize: 32 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card className="glass-card-hover">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{t('org.generatedReports')}</Typography>
                    <Typography variant="h4" fontWeight={800} mt={1}>{reports.length}</Typography>
                    <Typography variant="caption" color="text.secondary">{t('org.monthlyAuditsArchived')}</Typography>
                  </Box>
                  <SpeedIcon color="secondary" sx={{ fontSize: 32 }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs Menu for Org Admin */}
      {isOrgAdmin ? (
        <>
          <Tabs 
            value={orgTabValue} 
            onChange={(e, nv) => setOrgTabValue(nv)} 
            sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 4 }}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="{t('org.tabEmissionTrends')}" />
            <Tab label="{t('org.tabTeamRankings')}" />
            <Tab label="{t('org.tabReportsActions')}" />
          </Tabs>

          {/* Tab 1: Emission Trends & Dept Performance */}
          {orgTabValue === 0 && (
            <Grid container spacing={3}>
              {/* Employee trends */}
              <Grid item xs={12}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                    {t('org.employeeEmissionTrends')}
                  </Typography>
                  {processedTrendData.length === 0 ? (
                    <Box height={300} display="flex" justifyContent="center" alignItems="center">
                      <Typography color="text.secondary">{t('org.noEmissionData')}</Typography>
                    </Box>
                  ) : (
                    <Box height={300}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <ChartTooltip contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }} itemStyle={{ color: '#fff' }} />
                          <Legend />
                          {employeeNames.map((name, idx) => (
                            <Line key={name} type="monotone" dataKey={name} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Card>
              </Grid>

              {/* Department Performance */}
              <Grid item xs={12}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                    {t('org.departmentPerformance')}
                  </Typography>
                  {deptPerformance.length === 0 ? (
                    <Box height={300} display="flex" justifyContent="center" alignItems="center">
                      <Typography color="text.secondary">{t('org.noDeptData')}</Typography>
                    </Box>
                  ) : (
                    <Box height={300}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deptPerformance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="departmentName" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <ChartTooltip contentStyle={{ background: '#1f2937', borderColor: '#374151', borderRadius: 8 }} itemStyle={{ color: '#fff' }} />
                          <Bar dataKey="averageEmissions" fill="#06b6d4" radius={[4, 4, 0, 0]} name={t('org.avgEmissionsKg')} />
                          <Bar dataKey="totalEmissions" fill="#fbbf24" radius={[4, 4, 0, 0]} name={t('org.totalEmissionsKg')} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 2: {t('org.tabTeamRankings')} */}
          {orgTabValue === 1 && (
            <Grid container spacing={3}>
              {/* Leaderboard Rankings */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  {t('org.teamRankingsCurrentMonth')}
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>{t('org.tableRank')}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{t('org.tableEmployee')}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{t('org.tableDepartment')}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">{t('org.tableEmissions')}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">{t('org.tableSustainabilityScore')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teamRankings.map((row) => (
                        <TableRow key={row.employeeName}>
                          <TableCell sx={{ fontWeight: 700 }}>#{row.rank}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.employeeName}</TableCell>
                          <TableCell>{row.department}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: row.rank === 1 ? 'success.main' : 'text.primary' }}>{row.emissions.toFixed(1)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{row.sustainabilityScore.toFixed(0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Add Employee Form */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                      {t('org.addEmployeeTitle')}
                    </Typography>
                    <form onSubmit={handleAddEmployee}>
                      <Stack spacing={2.5}>
                        <TextField
                          label={t('org.userEmailAddress')}
                          type="email"
                          fullWidth
                          required
                          value={empEmail}
                          onChange={(e) => setEmpEmail(e.target.value)}
                        />
                        <TextField
                          select
                          label={t('org.assignedRole')}
                          fullWidth
                          value={empRole}
                          onChange={(e) => setEmpRole(e.target.value)}
                        >
                          <MenuItem value="ORG_USER">{t('org.roleUser')}</MenuItem>
                          <MenuItem value="ORG_ADMIN">{t('org.roleAdmin')}</MenuItem>
                        </TextField>
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 1 }}>
                          {t('org.addUserBtn')}
                        </Button>
                      </Stack>
                    </form>
                  </CardContent>
                </Card>
              </Grid>

              {/* Members List */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                      {t('org.employeesRoster')}
                    </Typography>
                    <Stack spacing={1.5} sx={{ maxHeight: 230, overflowY: 'auto' }}>
                      {employees.map((emp) => (
                        <Box key={emp.id} display="flex" justifyContent="space-between" alignItems="center" p={1.5} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{emp.user.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">{emp.user.email}</Typography>
                          </Box>
                          <Chip label={emp.role} size="small" color={emp.role === 'ORG_ADMIN' ? 'secondary' : 'default'} />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Tab 3: {t('org.monthlySustainabilityReports')} */}
          {orgTabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  {t('org.monthlySustainabilityReports')}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('org.reportPeriod')}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="right">{t('org.aggregatedCO2')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} align="center">{t('org.noReportsYet')}</TableCell>
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

              {/* Generate Report Form */}
              <Grid item xs={12} md={5}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                      {t('org.generateAggregatedReport')}
                    </Typography>
                    <form onSubmit={handleGenerateReport}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            label={t('org.monthLabel')}
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
                            label={t('org.yearLabel')}
                            type="number"
                            fullWidth
                            required
                            value={reportYear}
                            onChange={(e) => setReportYear(e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button type="submit" variant="outlined" color="primary" fullWidth>
                            {t('org.calculateSaveReport')}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      ) : (
        // Non-Admin User dashboard
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              {t('org.monthlySustainabilityReports')}
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }}>{t('org.reportPeriod')}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 700 }} align="right">{t('org.aggregatedCO2')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center">{t('org.noReportsYet')}</TableCell>
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
          
          <Grid item xs={12} md={5}>
            <Card sx={{ background: 'rgba(17,24,39,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>{t('org.memberRole')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  You are registered as an **{t('org.roleUser')}**. Sustainability reports and employee management settings are restricted to organization administrators.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default OrganizationDashboard;
