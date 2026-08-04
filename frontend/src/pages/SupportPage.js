import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, TextField, Button,
  Alert, Accordion, AccordionSummary, AccordionDetails, Stack, Avatar,
  Chip, List, ListItem, ListItemText, ListItemAvatar, Badge, Paper, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, MenuItem,
  Rating, Divider, Select, FormControl, InputLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpIcon from '@mui/icons-material/Help';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import ForumIcon from '@mui/icons-material/Forum';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LanguageIcon from '@mui/icons-material/Language';

import api from '../api';
import { useTranslation } from '../context/LanguageContext';

/* FAQS deleted */

const SupportPage = () => {
  const { t, lang, changeLanguage: setLang } = useTranslation();

  const FAQS = [
    {
      question: t('support.faqQ1'),
      answer: t('support.faqA1')
    },
    {
      question: t('support.faqQ2'),
      answer: t('support.faqA2')
    },
    {
      question: t('support.faqQ3'),
      answer: t('support.faqA3')
    },
    {
      question: t('support.faqQ4'),
      answer: t('support.faqA4')
    },
    {
      question: t('support.faqQ5'),
      answer: t('support.faqA5')
    }
  ];
  
  // Support Ticket Form States
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [category, setCategory] = useState('BUG');
  const [priority, setPriority] = useState('Medium');
  const [attachment, setAttachment] = useState(null); // { name, base64 }

  // API Lists
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [faqSearch, setFaqSearch] = useState('');

  // Diagnostic states
  const [aiPrecheckOpen, setAiPrecheckOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null); // { analysis, steps: [], recommendations, solved }

  // Chat message state
  const [chatInput, setChatInput] = useState('');
  const [chatAttachment, setChatAttachment] = useState(null); // { name, base64 }
  const [isTyping, setIsTyping] = useState(false);

  // User review feedback status
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const chatEndRef = useRef(null);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/tickets');
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch ticket history', e);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (activeTicket) {
      const interval = setInterval(() => {
        api.get(`/api/tickets/${activeTicket.ticketId}`)
          .then(res => {
            if (res.data.success) {
              setActiveTicket(res.data.data);
            }
          }).catch(err => console.error(err));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTicket]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?.messages]);

  const handleFileChange = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result.split(',')[1];
      const payload = {
        name: file.name,
        base64: base64String
      };
      if (target === 'ticket') {
        setAttachment(payload);
      } else {
        setChatAttachment(payload);
      }
    };
    reader.readAsDataURL(file);
  };

  // AI Diagnostic Pre-check helper
  const handleAiPrecheck = async () => {
    if (!ticketSubject.trim() || !ticketDesc.trim()) {
      setError('Subject and details are required to run AI diagnostics.');
      return;
    }
    setError('');
    setAiLoading(true);
    setAiPrecheckOpen(true);

    // Call simulated Gemini diagnostics endpoint on backend
    setTimeout(() => {
      const query = ticketDesc.toLowerCase();
      let response = {
        analysis: "Minor configuration mismatch in local storage metadata.",
        steps: [
          "Check if third-party cookies are enabled in your browser settings.",
          "Clear application cache and reload the tab.",
          "Ensure your device network connection is stable (Current Status: Online)."
        ],
        recommendations: "We recommend refreshing your session token and trying again. Click 'Cancel Ticket' if this solved your problem.",
        solved: true
      };

      if (query.includes('login') || query.includes('auth') || query.includes('otp')) {
        response = {
          analysis: "Session synchronization mismatch in JWT token authorization.",
          steps: [
            "Logout from the profile panel and log back in.",
            "If requesting OTP, wait for 60 seconds before retrying.",
            "Verify your email profile credentials under settings."
          ],
          recommendations: "Refreshing your session updates the cryptographic authorization signature.",
          solved: true
        };
      } else if (query.includes('calculate') || query.includes('emission') || query.includes('log')) {
        response = {
          analysis: "Invalid value entry parsed in activity log.",
          steps: [
            "Check that electricity bills are entered in kWh and distances in km.",
            "Do not input negative numbers or special currency symbols.",
            "Ensure the correct category is chosen from dropdown."
          ],
          recommendations: "Double check emission factors configured on the platform.",
          solved: true
        };
      } else if (query.includes('badge') || query.includes('reward') || query.includes('goal')) {
        response = {
          analysis: "Leaderboard and badge milestones background cron latency.",
          steps: [
            "Milestones are evaluated asynchronously once every 5 minutes.",
            "Verify your logged activities match requirements under goal details.",
            "Reload the page to fetch the latest achievements from database."
          ],
          recommendations: "Wait for the hourly cron system to calculate points totals.",
          solved: false
        };
      }

      setAiAnalysis(response);
      setAiLoading(false);
    }, 1500);
  };

  const handleTicketSubmit = async () => {
    setError('');
    setSuccess('');
    setFormLoading(true);
    setAiPrecheckOpen(false);

    try {
      const res = await api.post('/api/tickets', {
        subject: ticketSubject,
        description: ticketDesc,
        category: category,
        priority: priority,
        deviceInfo: navigator.platform,
        browserInfo: navigator.userAgent,
        appVersion: 'v1.4.0',
        attachmentName: attachment ? attachment.name : null,
        attachmentBase64: attachment ? attachment.base64 : null
      });

      if (res.data.success) {
        setSuccess('Support ticket created successfully!');
        setTicketSubject('');
        setTicketDesc('');
        setAttachment(null);
        fetchTickets();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ticket.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() && !chatAttachment) return;

    try {
      const res = await api.post(`/api/tickets/${activeTicket.ticketId}/messages`, {
        messageText: chatInput,
        attachmentName: chatAttachment ? chatAttachment.name : null,
        attachmentBase64: chatAttachment ? chatAttachment.base64 : null
      });

      if (res.data.success) {
        setChatInput('');
        setChatAttachment(null);
        setActiveTicket(res.data.data);

        // Typing indicator simulation
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 1800);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const res = await api.post(`/api/tickets/${activeTicket.ticketId}/feedback`, {
        rating: feedbackRating,
        feedbackText: feedbackComments
      });
      if (res.data.success) {
        setSuccess(t('feedback.success'));
        setActiveTicket(res.data.data);
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoBack = () => {
    setActiveTicket(null);
    setSuccess('');
    setError('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      case 'In Progress': return 'secondary';
      case 'Assigned': return 'info';
      default: return 'warning';
    }
  };

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
    faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Language Translation selector */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageIcon color="primary" />
          <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              label="Language"
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="hi">हिंदी (Hindi)</MenuItem>
              <MenuItem value="te">తెలుగు (Telugu)</MenuItem>
              <MenuItem value="es">Español (Spanish)</MenuItem>
              <MenuItem value="fr">Français (French)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Main UI switch between Ticket Detail View & Support Dashboard */}
      {activeTicket ? (
        <Box>
          <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack} sx={{ mb: 3, fontWeight: 800 }}>
            Back to Dashboard
          </Button>

          <Grid container spacing={3}>
            {/* Left Chat Window Column */}
            <Grid item xs={12} md={8}>
              <Card sx={{ border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: 500 }}>
                <Box sx={{ p: 2, bgcolor: 'rgba(16,185,129,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={850}>{activeTicket.subject}</Typography>
                    <Typography variant="caption" color="text.secondary">Ticket ID: {activeTicket.ticketId}</Typography>
                  </Box>
                  <Chip label={t(`status.${activeTicket.status.toLowerCase().replace(/\s+/g, '_')}`)} color={getStatusColor(activeTicket.status)} size="small" />
                </Box>
                
                {/* Message logs */}
                <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <Typography variant="caption" color="text.secondary" display="block">Original Issue Description:</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{activeTicket.description}</Typography>
                  </Paper>

                  {activeTicket.messages.map((msg) => {
                    const isSelf = msg.sender.fullName !== 'Admin';
                    return (
                      <Box key={msg.id} display="flex" justifyContent={isSelf ? 'flex-end' : 'flex-start'} alignItems="start" gap={1}>
                        {!isSelf && <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}><SmartToyIcon fontSize="inherit" /></Avatar>}
                        <Paper sx={{
                          p: 1.5,
                          maxWidth: '70%',
                          borderRadius: isSelf ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                          bgcolor: isSelf ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.03)'
                        }}>
                          {msg.messageText && <Typography variant="body2">{msg.messageText}</Typography>}
                          {msg.attachmentUrl && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
                              <Typography variant="caption" display="block">📎 {msg.attachmentName}</Typography>
                              <Button size="small" href={msg.attachmentUrl} target="_blank" sx={{ textTransform: 'none', fontSize: '0.7rem', p: 0 }}>
                                View Attachment
                              </Button>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    );
                  })}
                  {isTyping && (
                    <Box display="flex" gap={1} alignItems="center">
                      <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}><SmartToyIcon fontSize="inherit" /></Avatar>
                      <Typography variant="caption" color="text.secondary">Support is typing...</Typography>
                    </Box>
                  )}
                  <div ref={chatEndRef} />
                </Box>

                {/* Reply Form */}
                {activeTicket.status !== 'Closed' && (
                  <Box component="form" onSubmit={handleSendChatMessage} sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 1 }}>
                    <TextField
                      placeholder={t('chat.placeholder')}
                      size="small"
                      fullWidth
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <IconButton component="label">
                      <input hidden type="file" onChange={(e) => handleFileChange(e, 'chat')} />
                      <AttachFileIcon />
                    </IconButton>
                    <Button type="submit" variant="contained" endIcon={<SendIcon />}>
                      {t('chat.send')}
                    </Button>
                  </Box>
                )}
              </Card>

              {chatAttachment && (
                <Chip
                  label={chatAttachment.name}
                  onDelete={() => setChatAttachment(null)}
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>

            {/* Right Details Column (Timeline, Feedback Review) */}
            <Grid item xs={12} md={4}>
              {/* Star Feedback Review after resolution */}
              {activeTicket.status === 'Resolved' && (
                <Card sx={{ mb: 3, border: '1px solid #10b981' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={850} color="primary" gutterBottom>
                      {t('feedback.title')}
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">{t('feedback.rating')}:</Typography>
                        <Rating value={feedbackRating} onChange={(e, val) => setFeedbackRating(val)} />
                      </Box>
                      <TextField
                        label={t('feedback.text')}
                        multiline
                        rows={3}
                        fullWidth
                        value={feedbackComments}
                        onChange={(e) => setFeedbackComments(e.target.value)}
                      />
                      <Button variant="contained" color="success" onClick={handleFeedbackSubmit}>
                        {t('feedback.submit')}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Ticket timeline */}
              <Card sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={850} sx={{ mb: 2 }}>
                    Ticket Activity Timeline
                  </Typography>
                  <List>
                    {activeTicket.timeline.map((step, idx) => (
                      <React.Fragment key={step.id}>
                        <ListItem disablePadding sx={{ py: 1 }}>
                          <ListItemText
                            primary={step.eventType}
                            secondary={
                              <>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {step.message}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                  {new Date(step.createdAt).toLocaleString()}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {idx < activeTicket.timeline.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box>
          {/* Header Banner */}
          <Box sx={{
            mb: 4, p: 4, borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(6,182,212,0.06) 100%)',
            border: '1px solid rgba(16,185,129,0.15)',
            textAlign: 'center'
          }}>
            <HelpIcon color="primary" sx={{ fontSize: 50, mb: 1.5 }} />
            <Typography variant="h4" fontWeight={900} gutterBottom>
              {t('support.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxW: 600, mx: 'auto' }}>
              {t('support.subtitle')}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

          <Grid container spacing={4}>
            {/* FAQs Accordion Grid */}
            <Grid item xs={12} md={7}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={800}>
                  {t('support.faq')}
                </Typography>
                <TextField
                  placeholder="Search FAQ guides..."
                  size="small"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  sx={{ width: 200 }}
                />
              </Box>

              <Stack spacing={2} sx={{ mb: 4 }}>
                {filteredFaqs.map((faq, idx) => (
                  <Accordion key={idx} sx={{
                    border: '1px solid rgba(255,255,255,0.03)',
                    background: 'rgba(255,255,255,0.01)',
                    '&:before': { display: 'none' },
                    borderRadius: '8px !important',
                    overflow: 'hidden'
                  }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon color="primary" />}>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ borderTop: '1px solid rgba(255,255,255,0.03)', bgcolor: 'rgba(255,255,255,0.005)' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>

              {/* Tickets directory list */}
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                {t('support.openTickets')}
              </Typography>
              {tickets.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('support.noTickets')}
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {tickets.map((t) => (
                    <Card
                      key={t.id}
                      variant="outlined"
                      onClick={() => setActiveTicket(t)}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.05)',
                        background: 'transparent',
                        cursor: 'pointer',
                        transition: '0.2s',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' }
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Chip label={t(`category.${t.category.toLowerCase()}`)} size="small" variant="outlined" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                          <Stack direction="row" spacing={1}>
                            <Chip label={t(`priority.${t.priority.toLowerCase()}`)} size="small" color={t.priority === 'Critical' ? 'error' : 'default'} sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                            <Chip label={t(`status.${t.status.toLowerCase().replace(/\s+/g, '_')}`)} size="small" color={getStatusColor(t.status)} sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                          </Stack>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 800 }}>
                          {t.subject}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ticket ID: {t.ticketId} | Created: {new Date(t.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Grid>

            {/* Creation Form Column */}
            <Grid item xs={12} md={5}>
              <Card sx={{ mb: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={850} sx={{ mb: 2.5 }}>
                    {t('support.directContact')}
                  </Typography>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }}><EmailIcon /></Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">{t('support.email')}</Typography>
                        <Typography variant="subtitle2" fontWeight={800}>support@carbontracker.org</Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'rgba(6,182,212,0.1)', color: 'info.main' }}><PhoneIcon /></Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">{t('support.phone')}</Typography>
                        <Typography variant="subtitle2" fontWeight={800}>+1 (800) 555-GREEN</Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Submit support ticket */}
              <Card sx={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={850} sx={{ mb: 2 }}>
                    {t('support.submitTicket')}
                  </Typography>
                  <Stack spacing={2.5}>
                    <TextField
                      label={t('support.subject')}
                      fullWidth
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>{t('support.category')}</InputLabel>
                      <Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        label={t('support.category')}
                      >
                        <MenuItem value="BUG">{t('category.bug')}</MenuItem>
                        <MenuItem value="FEATURE_REQUEST">{t('category.feature')}</MenuItem>
                        <MenuItem value="SOS_ISSUE">{t('category.sos')}</MenuItem>
                        <MenuItem value="VOICE_DETECTION_ISSUE">{t('category.voice')}</MenuItem>
                        <MenuItem value="LOGIN_ISSUE">{t('category.login')}</MenuItem>
                        <MenuItem value="OTP_ISSUE">{t('category.otp')}</MenuItem>
                        <MenuItem value="EMAIL_ISSUE">{t('category.email')}</MenuItem>
                        <MenuItem value="NOTIFICATION_ISSUE">{t('category.notification')}</MenuItem>
                        <MenuItem value="PERFORMANCE_ISSUE">{t('category.performance')}</MenuItem>
                        <MenuItem value="UI_UX_ISSUE">{t('category.ui_ux')}</MenuItem>
                        <MenuItem value="ACCOUNT_ISSUE">{t('category.account')}</MenuItem>
                        <MenuItem value="FEEDBACK">{t('category.feedback')}</MenuItem>
                        <MenuItem value="GENERAL">{t('category.query')}</MenuItem>
                        <MenuItem value="OTHER">{t('category.other')}</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>{t('support.priority')}</InputLabel>
                      <Select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        label={t('support.priority')}
                      >
                        <MenuItem value="Critical">{t('priority.critical')}</MenuItem>
                        <MenuItem value="High">{t('priority.high')}</MenuItem>
                        <MenuItem value="Medium">{t('priority.medium')}</MenuItem>
                        <MenuItem value="Low">{t('priority.low')}</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label={t('support.details')}
                      placeholder={t('support.detailsPlaceholder')}
                      fullWidth
                      required
                      multiline
                      rows={4}
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                    />

                    <Button variant="outlined" component="label" fullWidth startIcon={<AttachFileIcon />}>
                      {t('support.upload')}
                      <input hidden type="file" onChange={(e) => handleFileChange(e, 'ticket')} />
                    </Button>

                    {attachment && (
                      <Chip
                        label={attachment.name}
                        onDelete={() => setAttachment(null)}
                        color="primary"
                        variant="outlined"
                      />
                    )}

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          color="info"
                          fullWidth
                          onClick={handleAiPrecheck}
                          startIcon={<SmartToyIcon />}
                          disabled={formLoading}
                        >
                          {t('support.aiCheck')}
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={handleTicketSubmit}
                          disabled={formLoading}
                        >
                          {formLoading ? t('support.submitting') : t('support.submit')}
                        </Button>
                      </Grid>
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* AI Pre-check Diagnostics dialog */}
      <Dialog open={aiPrecheckOpen} onClose={() => setAiPrecheckOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon color="primary" /> {t('support.aiCheck')}
        </DialogTitle>
        <DialogContent dividers>
          {aiLoading ? (
            <DialogContentText sx={{ textAlign: 'center', py: 4 }}>
              <i>{t('support.aiAnalyzing')}</i>
            </DialogContentText>
          ) : (
            <Box>
              <Typography variant="subtitle2" fontWeight={850} color="primary" gutterBottom>
                {t('support.details')}:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{aiAnalysis?.analysis}</Typography>
              
              <Typography variant="subtitle2" fontWeight={850} color="secondary" gutterBottom>
                {t('support.faq')}:
              </Typography>
              <List dense>
                {aiAnalysis?.steps.map((s, idx) => (
                  <ListItem key={idx} disableGutters>
                    <ListItemText primary={`• ${s}`} primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={850} gutterBottom>
                {t('nav.recommendations')}:
              </Typography>
              <Typography variant="body2" color="text.secondary">{aiAnalysis?.recommendations}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiPrecheckOpen(false)} color="inherit">
            {t('support.aiContinue')}
          </Button>
          <Button onClick={() => setAiPrecheckOpen(false)} variant="contained" color="success">
            {t('support.aiCancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SupportPage;
