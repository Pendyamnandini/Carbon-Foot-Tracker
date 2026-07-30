import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Alert, CircularProgress,
  Stack, Paper, Divider, Button, TextField, Select, MenuItem, InputLabel,
  FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, FormHelperText,
  Avatar, List, ListItem, ListItemText
} from '@mui/material';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as ChartTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import api from '../api';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ForumIcon from '@mui/icons-material/Forum';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';

const AdminSupportDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Analytics Metrics
  const [metrics, setMetrics] = useState({
    total: 0, open: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0, critical: 0,
    categories: {}, priorities: {}, satisfaction: 5.0
  });

  // Ticket Lists & Filtering
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterPri, setFilterPri] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Action Dialogs
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  
  const [mergeOpen, setMergeOpen] = useState(false);
  const [duplicateId, setDuplicateId] = useState('');

  // Live Chat Details Dialog
  const [replyOpen, setReplyOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatAttachment, setChatAttachment] = useState(null); // { name, base64 }
  const [activeTicketDetails, setActiveTicketDetails] = useState(null);

  const [admins, setAdmins] = useState([]); // List of support administrators

  const chatEndRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [ticketsRes, analyticsRes, usersRes] = await Promise.all([
        api.get('/api/admin/tickets'),
        api.get('/api/admin/tickets/analytics'),
        api.get('/api/admin/users')
      ]);

      if (ticketsRes.data.success) {
        setTickets(ticketsRes.data.data);
      }
      if (analyticsRes.data.success) {
        setMetrics(analyticsRes.data.data);
      }
      if (usersRes.data.success) {
        const userList = usersRes.data.data.content || usersRes.data.data || [];
        setAdmins(userList.filter(u => u.role === 'ADMIN'));
      }
    } catch (e) {
      setError('Could not retrieve support dashboard analytics.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchTicketDetails = async (ticketId) => {
    try {
      const res = await api.get(`/api/tickets/${ticketId}`);
      if (res.data.success) {
        setActiveTicketDetails(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Poll conversation messages every 4 seconds when reply window is open
  useEffect(() => {
    if (replyOpen && selectedTicket) {
      const interval = setInterval(() => {
        fetchTicketDetails(selectedTicket.ticketId);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [replyOpen, selectedTicket]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicketDetails?.messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      setChatAttachment({
        name: file.name,
        base64: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSendAdminMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() && !chatAttachment) return;

    try {
      const res = await api.post(`/api/tickets/${selectedTicket.ticketId}/messages`, {
        messageText: chatInput,
        attachmentName: chatAttachment ? chatAttachment.name : null,
        attachmentBase64: chatAttachment ? chatAttachment.base64 : null
      });

      if (res.data.success) {
        setChatInput('');
        setChatAttachment(null);
        setActiveTicketDetails(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      const res = await api.put(`/api/admin/tickets/${ticketId}`, { status });
      if (res.data.success) {
        setSuccess(`Ticket status updated to ${status}`);
        fetchData();
      }
    } catch (err) {
      setError('Failed to update ticket status.');
    }
  };

  const handleUpdatePriority = async (ticketId, priority) => {
    try {
      const res = await api.put(`/api/admin/tickets/${ticketId}`, { priority });
      if (res.data.success) {
        setSuccess(`Ticket priority updated to ${priority}`);
        fetchData();
      }
    } catch (err) {
      setError('Failed to update ticket priority.');
    }
  };

  const handleAssignAdmin = async () => {
    if (!assigneeId) return;
    try {
      const res = await api.put(`/api/admin/tickets/${selectedTicket.ticketId}`, {
        assignedAdminId: assigneeId
      });
      if (res.data.success) {
        setSuccess('Ticket assigned successfully.');
        setAssignOpen(false);
        fetchData();
      }
    } catch (err) {
      setError('Failed to assign ticket.');
    }
  };

  const handleMergeTickets = async () => {
    if (!duplicateId) return;
    try {
      const res = await api.post(`/api/admin/tickets/${selectedTicket.ticketId}/merge?duplicateId=${duplicateId}`);
      if (res.data.success) {
        setSuccess(`Duplicate ticket ${duplicateId} merged into ${selectedTicket.ticketId}`);
        setMergeOpen(false);
        fetchData();
      }
    } catch (err) {
      setError('Failed to merge tickets. Check that the duplicate ID is correct.');
    }
  };

  const handleDeleteSpam = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket as spam?')) return;
    try {
      const res = await api.delete(`/api/admin/tickets/${ticketId}`);
      if (res.data.success) {
        setSuccess('Spam ticket deleted.');
        fetchData();
      }
    } catch (err) {
      setError('Failed to delete ticket.');
    }
  };

  const handleResolve = async (ticketId) => {
    try {
      const res = await api.post(`/api/admin/tickets/${ticketId}/resolve`);
      if (res.data.success) {
        setSuccess('Ticket resolved. E-mail notice sent.');
        setReplyOpen(false);
        fetchData();
      }
    } catch (err) {
      setError('Failed to resolve ticket.');
    }
  };

  // Reports Exports
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Ticket ID,Subject,Category,Priority,Status,User,Created Date\n';
    tickets.forEach(t => {
      csvContent += `${t.ticketId},"${t.subject}",${t.category},${t.priority},${t.status},${t.username},${t.createdAt}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `support_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportXLS = () => {
    let tabContent = 'Ticket ID\tSubject\tCategory\tPriority\tStatus\tUser\tCreated Date\n';
    tickets.forEach(t => {
      tabContent += `${t.ticketId}\t${t.subject}\t${t.category}\t${t.priority}\t${t.status}\t${t.username}\t${t.createdAt}\n`;
    });
    const blob = new Blob([tabContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `support_report_${Date.now()}.xls`;
    link.click();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !filterCat || t.category === filterCat;
    const matchesPri = !filterPri || t.priority === filterPri;
    const matchesStatus = !filterStatus || t.status === filterStatus;
    
    return matchesSearch && matchesCat && matchesPri && matchesStatus;
  });

  // Recharts Chart configurations
  const categoryChartData = Object.keys(metrics.categories).map(key => ({
    name: key,
    value: metrics.categories[key]
  }));

  const priorityChartData = Object.keys(metrics.priorities).map(key => ({
    name: key,
    value: metrics.priorities[key]
  }));

  const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#fbbf24', '#f43f5e', '#ec4899', '#6366f1'];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={900} gutterBottom>
        Support Ticket Management Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Coordinate support query workflows, inspect customer environments, and monitor platform SLA compliance.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Metrics Summary Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={2.4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="caption" color="text.secondary">Total Tickets</Typography>
              <Typography variant="h4" fontWeight={900}>{metrics.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="caption" color="text.secondary">Open / New</Typography>
              <Typography variant="h4" fontWeight={900} color="warning.main">{metrics.open}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="caption" color="text.secondary">Assigned / In Progress</Typography>
              <Typography variant="h4" fontWeight={900} color="secondary.main">{metrics.assigned}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="caption" color="text.secondary">Resolved Issues</Typography>
              <Typography variant="h4" fontWeight={900} color="success.main">{metrics.resolved}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="caption" color="text.secondary">Satisfaction rating</Typography>
              <Typography variant="h4" fontWeight={900} color="primary.main">{metrics.satisfaction} ★</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.05)', background: 'transparent' }}>
            <Typography variant="subtitle2" fontWeight={850} sx={{ mb: 2 }}>
              Tickets Distribution by Category
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.05)', background: 'transparent' }}>
            <Typography variant="subtitle2" fontWeight={850} sx={{ mb: 2 }}>
              Tickets Distribution by Priority
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <ChartTooltip />
                  <Bar dataKey="value" fill="#10b981">
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Critical' ? '#f43f5e' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Export Options & Filter Tools */}
      <Card sx={{ mb: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={850}>
              Ticket Management Directory
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<DownloadIcon />} variant="outlined" onClick={handleExportCSV}>
                Export CSV
              </Button>
              <Button size="small" startIcon={<DownloadIcon />} variant="outlined" onClick={handleExportXLS}>
                Export Excel
              </Button>
              <Button size="small" startIcon={<DownloadIcon />} variant="outlined" onClick={handlePrintPDF}>
                Print PDF
              </Button>
            </Stack>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <TextField
                placeholder="Search ticket, user..."
                fullWidth
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon color="action" fontSize="small" sx={{ mr: 1 }} /> }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} label="Category">
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="BUG">Bug Report</MenuItem>
                  <MenuItem value="FEATURE_REQUEST">Feature Request</MenuItem>
                  <MenuItem value="SOS_ISSUE">SOS Issue</MenuItem>
                  <MenuItem value="VOICE_DETECTION_ISSUE">Voice Detection Issue</MenuItem>
                  <MenuItem value="LOGIN_ISSUE">Login Issue</MenuItem>
                  <MenuItem value="OTP_ISSUE">OTP Issue</MenuItem>
                  <MenuItem value="EMAIL_ISSUE">Email Issue</MenuItem>
                  <MenuItem value="NOTIFICATION_ISSUE">Notification Issue</MenuItem>
                  <MenuItem value="PERFORMANCE_ISSUE">Performance Issue</MenuItem>
                  <MenuItem value="UI_UX_ISSUE">UI/UX Issue</MenuItem>
                  <MenuItem value="ACCOUNT_ISSUE">Account Issue</MenuItem>
                  <MenuItem value="FEEDBACK">Feedback</MenuItem>
                  <MenuItem value="GENERAL">General Query</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select value={filterPri} onChange={(e) => setFilterPri(e.target.value)} label="Priority">
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Assigned">Assigned</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Waiting for User">Waiting for User</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Table list */}
          <TableContainer component={Paper} sx={{ bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.03)' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickets.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>{t.ticketId}</TableCell>
                    <TableCell>{t.username}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t.subject}</TableCell>
                    <TableCell><Chip label={t.category} size="small" variant="outlined" sx={{ fontSize: '0.65rem' }} /></TableCell>
                    <TableCell>
                      <Select
                        value={t.priority}
                        size="small"
                        onChange={(e) => handleUpdatePriority(t.ticketId, e.target.value)}
                        sx={{ fontSize: '0.75rem', height: 28 }}
                      >
                        <MenuItem value="Critical">Critical</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Low">Low</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={t.status}
                        size="small"
                        onChange={(e) => handleUpdateStatus(t.ticketId, e.target.value)}
                        sx={{ fontSize: '0.75rem', height: 28 }}
                      >
                        <MenuItem value="Open">Open</MenuItem>
                        <MenuItem value="Assigned">Assigned</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Waiting for User">Waiting for User</MenuItem>
                        <MenuItem value="Resolved">Resolved</MenuItem>
                        <MenuItem value="Closed">Closed</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => {
                            setSelectedTicket(t);
                            setReplyOpen(true);
                            fetchTicketDetails(t.ticketId);
                          }}
                          title="Open Conversation"
                        >
                          <ForumIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedTicket(t);
                            setAssigneeId('');
                            setAssignOpen(true);
                          }}
                          title="Assign Admin"
                        >
                          <AssignmentIndIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => {
                            setSelectedTicket(t);
                            setDuplicateId('');
                            setMergeOpen(true);
                          }}
                          title="Merge Duplicate"
                        >
                          <MergeTypeIcon fontSize="small" />
                        </IconButton>
                        {t.status !== 'Resolved' && t.status !== 'Closed' && (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleResolve(t.ticketId)}
                            title="Resolve Ticket"
                          >
                            <DoneAllIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteSpam(t.ticketId)}
                          title="Delete Spam"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Reply Chat details Dialog */}
      <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'rgba(16,185,129,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight={850}>
              Ticket Reply Hub: {selectedTicket?.ticketId}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Subject: {selectedTicket?.subject}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setReplyOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Grid container sx={{ height: 450 }}>
            {/* Left Panel: Ticket properties */}
            <Grid item xs={12} md={4} sx={{ borderRight: '1px solid rgba(255,255,255,0.05)', p: 2, height: '100%', overflowY: 'auto' }}>
              <Typography variant="subtitle2" fontWeight={850} gutterBottom>User Environment</Typography>
              <Stack spacing={1} sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Created By:</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedTicket?.username}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Email Address:</Typography>
                  <Typography variant="body2" fontWeight={600}>{selectedTicket?.userEmail || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Device:</Typography>
                  <Typography variant="body2">{activeTicketDetails?.deviceInfo || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Browser Agent:</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>{activeTicketDetails?.browserInfo || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">App Version:</Typography>
                  <Typography variant="body2">{activeTicketDetails?.appVersion || 'N/A'}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              
              <Typography variant="subtitle2" fontWeight={850} gutterBottom>Timeline logs</Typography>
              <List dense>
                {activeTicketDetails?.timeline.map(step => (
                  <ListItem key={step.id} disableGutters>
                    <ListItemText
                      primary={step.eventType}
                      secondary={`${step.message} (${new Date(step.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                      primaryTypographyProps={{ variant: 'caption', fontWeight: 800 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Right Panel: Chat log */}
            <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <Typography variant="caption" color="text.secondary" display="block">Original Issue Description:</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedTicket?.description}</Typography>
                </Paper>

                {activeTicketDetails?.messages.map(msg => {
                  const isAdminReply = msg.sender.fullName === 'Admin';
                  return (
                    <Box key={msg.id} display="flex" justifyContent={isAdminReply ? 'flex-end' : 'flex-start'} alignItems="start" gap={1}>
                      {!isAdminReply && <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main' }}><PersonIcon fontSize="inherit" /></Avatar>}
                      <Paper sx={{
                        p: 1.5,
                        maxWidth: '75%',
                        borderRadius: isAdminReply ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                        bgcolor: isAdminReply ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.03)'
                      }}>
                        {msg.messageText && <Typography variant="body2">{msg.messageText}</Typography>}
                        {msg.attachmentUrl && (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
                            <Typography variant="caption" display="block">📎 {msg.attachmentName}</Typography>
                            <Button size="small" href={msg.attachmentUrl} target="_blank" sx={{ textTransform: 'none', fontSize: '0.7rem', p: 0 }}>
                              Download File
                            </Button>
                          </Box>
                        )}
                      </Paper>
                    </Box>
                  );
                })}
                <div ref={chatEndRef} />
              </Box>

              {/* Chat Reply Form */}
              {selectedTicket?.status !== 'Closed' && (
                <Box component="form" onSubmit={handleSendAdminMessage} sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 1 }}>
                  <TextField
                    placeholder="Type your support reply..."
                    size="small"
                    fullWidth
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <IconButton component="label">
                    <input hidden type="file" onChange={handleFileChange} />
                    <AttachFileIcon />
                  </IconButton>
                  <Button type="submit" variant="contained" color="primary" endIcon={<SendIcon />}>
                    Send
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {selectedTicket?.status !== 'Resolved' && selectedTicket?.status !== 'Closed' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<DoneAllIcon />}
              onClick={() => handleResolve(selectedTicket.ticketId)}
            >
              Resolve & Close Ticket
            </Button>
          )}
          <Button onClick={() => setReplyOpen(false)} color="inherit">Close Hub</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Admin Dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)}>
        <DialogTitle>Assign Support Administrator</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Select Admin</InputLabel>
            <Select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} label="Select Admin">
              {admins.map(a => (
                <MenuItem key={a.id} value={a.id}>{a.fullName} ({a.email})</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleAssignAdmin} variant="contained" color="primary">Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Merge Duplicate Dialog */}
      <Dialog open={mergeOpen} onClose={() => setMergeOpen(false)}>
        <DialogTitle>Merge Duplicate Ticket</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 2 }}>
          <TextField
            label="Duplicate Ticket ID"
            placeholder="e.g. SUP-2026-12345"
            fullWidth
            size="small"
            value={duplicateId}
            onChange={(e) => setDuplicateId(e.target.value)}
          />
          <FormHelperText>
            Merging will close the duplicate ticket and move its log into this thread.
          </FormHelperText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleMergeTickets} variant="contained" color="secondary">Merge</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminSupportDashboard;
