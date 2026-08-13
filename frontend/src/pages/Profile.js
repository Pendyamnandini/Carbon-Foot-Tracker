import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Stack, Grid, Avatar, Select, MenuItem, InputLabel, FormControl, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemAvatar, Badge as MuiBadge, Switch, FormControlLabel
} from '@mui/material';
import api from '../api';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import QrCodeIcon from '@mui/icons-material/QrCode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarsIcon from '@mui/icons-material/Stars';
import TimelineIcon from '@mui/icons-material/Timeline';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import LanguageIcon from '@mui/icons-material/Language';
import { usePWA } from '../context/PWAContext';

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'ur', label: 'اردو (Urdu)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'de', label: 'Deutsch (German)' },
  { code: 'it', label: 'Italiano (Italian)' },
  { code: 'pt', label: 'Português (Portuguese)' },
  { code: 'nl', label: 'Nederlands (Dutch)' },
  { code: 'ru', label: 'Русский (Russian)' },
  { code: 'tr', label: 'Türkçe (Turkish)' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'he', label: 'עברית (Hebrew)' },
  { code: 'fa', label: 'فارسی (Persian)' },
  { code: 'zh_CN', label: '简体中文' },
  { code: 'zh_TW', label: '繁體中文' },
  { code: 'ja', label: '日本語 (Japanese)' },
  { code: 'ko', label: '한국어 (Korean)' },
  { code: 'th', label: 'ไทย (Thai)' },
  { code: 'vi', label: 'Tiếng Việt (Vietnamese)' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'ms', label: 'Bahasa Melayu' }
];

const Profile = () => {
  const { t, lang, changeLanguage } = useTranslation();
  const { updateProfileState } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const {
    isInstallable,
    isInstalled,
    isOnline,
    cacheSize,
    notificationStatus,
    lastSyncTime,
    queuedCount,
    installApp,
    clearCache,
    checkUpdates,
    forceSync,
    requestNotificationPermission
  } = usePWA();

  const tabMapping = {
    'profile': 0,
    'history': 1,
    'badges': 2,
    'certificates': 3,
    'achievements': 4,
    'rewards': 5,
    'notifications': 6,
    'settings': 7,
    'mobile-app': 8
  };

  const reverseTabMapping = [
    'profile',
    'history',
    'badges',
    'certificates',
    'achievements',
    'rewards',
    'notifications',
    'settings',
    'mobile-app'
  ];

  const [profileTab, setProfileTab] = useState(() => {
    const initialTab = searchParams.get('tab');
    return initialTab && tabMapping[initialTab] !== undefined ? tabMapping[initialTab] : 0;
  });

  const [settings, setSettings] = useState({
    weeklyDigest: true,
    goalAlerts: true,
    badgeAlerts: true,
    leaderboardAlerts: true,
    language: lang,
    currency: 'USD',
    distanceUnit: 'km'
  });

  const [passwordState, setPasswordState] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    sustainabilityPreferences: '',
    dateOfBirth: '',
    gender: '',
    country: '',
    state: '',
    city: '',
    profileImageUrl: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Activity History Tab States
  const [activityHistory, setActivityHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('all'); // today, 7days, 30days, all
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // New Badges, Achievements, Certificates, Rewards States
  const [badgesData, setBadgesData] = useState({ unlockedBadges: [], lockedBadges: [] });
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [rewards, setRewards] = useState({ totalPoints: 0, level: 1, progressToNextLevel: 0, currentRank: 1 });
  const [notifications, setNotifications] = useState([]);
  const [badgesFilter, setBadgesFilter] = useState('unlocked'); // unlocked, locked, all

  // Certificate Modal State
  const [selectedCert, setSelectedCert] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/profile');
      if (res.data.success) {
        const p = res.data.data;
        setProfile({
          fullName: p.fullName || '',
          email: p.email || '',
          mobileNumber: p.mobileNumber || '',
          sustainabilityPreferences: p.sustainabilityPreferences || '',
          dateOfBirth: p.dateOfBirth || '',
          gender: p.gender || '',
          country: p.country || '',
          state: p.state || '',
          city: p.city || '',
          profileImageUrl: p.profileImageUrl || ''
        });
      }
    } catch (err) {
      setError('Failed to fetch profile info.');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityHistory = async (pageNumber = page, filter = historyFilter) => {
    try {
      const res = await api.get(`/api/v1/user/activity-history?page=${pageNumber}&size=10`);
      if (res.data.success) {
        let content = res.data.data.content || [];
        
        const now = new Date();
        if (filter === 'today') {
          content = content.filter(act => {
            const actDate = new Date(act.createdAt);
            return actDate.toDateString() === now.toDateString();
          });
        } else if (filter === '7days') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          content = content.filter(act => new Date(act.createdAt) >= sevenDaysAgo);
        } else if (filter === '30days') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          content = content.filter(act => new Date(act.createdAt) >= thirtyDaysAgo);
        }

        setActivityHistory(content);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load activity logs', err);
    }
  };

  const fetchRewardsData = async () => {
    try {
      const res = await api.get('/api/rewards');
      if (res.data.success) {
        setRewards(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load rewards stats', err);
    }
  };

  const fetchBadgesData = async () => {
    try {
      const res = await api.get('/api/badges');
      if (res.data.success) {
        setBadgesData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load badges data', err);
    }
  };

  const fetchAchievementsData = async () => {
    try {
      const res = await api.get('/api/achievements');
      if (res.data.success) {
        setAchievements(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load achievements data', err);
    }
  };

  const fetchCertificatesData = async () => {
    try {
      const res = await api.get('/api/certificates');
      if (res.data.success) {
        setCertificates(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load certificates data', err);
    }
  };

  const fetchNotificationsData = async () => {
    try {
      const res = await api.get('/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notifications list', err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchActivityHistory(0, 'all');
    fetchRewardsData();
    fetchBadgesData();
    fetchAchievementsData();
    fetchCertificatesData();
    fetchNotificationsData();

    // Load display and notification settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  useEffect(() => {
    if (tabParam && tabMapping[tabParam] !== undefined) {
      setProfileTab(tabMapping[tabParam]);
    }
  }, [tabParam]);

  const handleTabChange = (event, newValue) => {
    setProfileTab(newValue);
    setSearchParams({ tab: reverseTabMapping[newValue] });
  };

  const handleSettingsChange = (name, value) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    changeLanguage(settings.language);
    setSuccess(t('profile.successUpdate'));
  };

  useEffect(() => {
    setSettings(prev => ({ ...prev, language: lang }));
  }, [lang]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.post('/api/profile/change-password', passwordState);
      if (res.data.success) {
        setPasswordSuccess(t('profile.passwordSuccess'));
        setPasswordState({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setError('');
    setSuccess('');
    try {
      const res = await api.post('/api/profile/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setProfile(prev => ({ ...prev, profileImageUrl: res.data.data }));
        updateProfileState({ profileImageUrl: res.data.data });
        setSuccess('Profile picture uploaded successfully!');
      }
    } catch (err) {
      setError('Image upload failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await api.put('/api/profile', profile);
      if (res.data.success) {
        setSuccess(t('profile.successUpdate'));
        updateProfileState({ fullName: profile.fullName });
      }
    } catch (err) {
      setError('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = (filter) => {
    setHistoryFilter(filter);
    setPage(0);
    fetchActivityHistory(0, filter);
  };

  const handlePageChange = (direction) => {
    const newPage = direction === 'next' ? page + 1 : page - 1;
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      fetchActivityHistory(newPage, historyFilter);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      const res = await api.put(`/api/notifications/${id}/read`);
      if (res.data.success) {
        fetchNotificationsData();
      }
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const res = await api.put('/api/notifications/read-all');
      if (res.data.success) {
        fetchNotificationsData();
        setSuccess('All notifications marked as read!');
      }
    } catch (err) {
      setError('Failed to mark all as read.');
    }
  };

  const handleShareCertificate = (cert) => {
    const verificationUrl = `${window.location.origin}/verify-cert?id=${cert.certificateId}`;
    navigator.clipboard.writeText(verificationUrl);
    setSuccess(`Certificate verification URL copied to clipboard: ${cert.certificateId}`);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Filter badges list dynamically
  const displayedBadges = [];
  if (badgesFilter === 'all' || badgesFilter === 'unlocked') {
    badgesData.unlockedBadges.forEach(b => displayedBadges.push({ ...b, locked: false }));
  }
  if (badgesFilter === 'all' || badgesFilter === 'locked') {
    badgesData.lockedBadges.forEach(b => displayedBadges.push({ ...b, locked: true }));
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Info Block */}
      <Box display="flex" alignItems="center" flexWrap="wrap" sx={{ mb: 4, gap: 3, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(6,182,212,0.04) 100%)', border: '1px solid rgba(255,255,255,0.03)' }}>
        <Box position="relative">
          <Avatar
            src={profile.profileImageUrl ? `${process.env.REACT_APP_API_URL || ""}${profile.profileImageUrl}` : undefined}
            sx={{ width: 110, height: 110, bgcolor: 'secondary.main', fontSize: '3rem', border: '3px solid #10b981' }}
          >
            {profile.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <IconButton
            color="primary"
            component="label"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: 'background.paper',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              '&:hover': { backgroundColor: 'background.paper' }
            }}
          >
            <input hidden accept="image/*" type="file" onChange={handleFileChange} />
            <PhotoCameraIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={850} display="flex" alignItems="center" gap={1.5}>
            {profile.fullName}
            <Chip label={`Level ${rewards.level}`} color="primary" size="small" sx={{ fontWeight: 800 }} />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {profile.email}
          </Typography>
          <Grid container spacing={1.5} sx={{ maxW: 500 }}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">{t('profile.rewardsPoints')}</Typography>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main">🪙 {rewards.totalPoints} pts</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">{t('profile.tabBadges')}</Typography>
              <Typography variant="subtitle2" fontWeight={800} color="secondary.main">🏅 {badgesData.unlockedBadges.length} unlocked</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">{t('profile.certsTitle')}</Typography>
              <Typography variant="subtitle2" fontWeight={800} color="info.main">📜 {certificates.length} earned</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">{t('profile.globalRank')}</Typography>
              <Typography variant="subtitle2" fontWeight={800} color="warning.main">🏆 #{rewards.currentRank}</Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Tabs list */}
      <Tabs 
        value={profileTab} 
        onChange={handleTabChange} 
        sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 4 }}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label={t('profile.tabProfile')} sx={{ fontWeight: 800 }} />
        <Tab label={t('profile.tabHistory')} sx={{ fontWeight: 800 }} />
        <Tab label={t('profile.tabBadges')} sx={{ fontWeight: 800 }} />
        <Tab label={t('profile.tabCertificates')} sx={{ fontWeight: 800 }} />
        <Tab label={t('profile.tabAchievements')} sx={{ fontWeight: 800 }} />
        <Tab label={t('profile.tabRewards')} sx={{ fontWeight: 800 }} />
        <Tab label={t('profile.tabNotifications')} sx={{ fontWeight: 800 }} />
        <Tab label={t('profile.tabSettings')} sx={{ fontWeight: 800 }} />
        <Tab label={t('recs.tabMobileApp')} sx={{ fontWeight: 800 }} />
      </Tabs>

      {/* Tab 0: Edit Profile */}
      {profileTab === 0 && (
        <Card sx={{ p: 2 }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('profile.fullName')}
                    name="fullName"
                    fullWidth
                    required
                    value={profile.fullName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('profile.mobileNumber')}
                    name="mobileNumber"
                    fullWidth
                    value={profile.mobileNumber}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={t('profile.dob')}
                    name="dateOfBirth"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={profile.dateOfBirth}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('profile.gender')}</InputLabel>
                    <Select
                      label={t('profile.gender')}
                      name="gender"
                      value={profile.gender}
                      onChange={handleChange}
                    >
                      <MenuItem value="MALE">{t('profile.genderMale')}</MenuItem>
                      <MenuItem value="FEMALE">{t('profile.genderFemale')}</MenuItem>
                      <MenuItem value="OTHER">{t('profile.genderOther')}</MenuItem>
                      <MenuItem value="PREFER_NOT_TO_SAY">{t('profile.genderPreferNotToSay')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label={t('profile.country')}
                    name="country"
                    fullWidth
                    value={profile.country}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label={t('profile.stateProvince')}
                    name="state"
                    fullWidth
                    value={profile.state}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label={t('profile.city')}
                    name="city"
                    fullWidth
                    value={profile.city}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={t('profile.preferences')}
                    name="sustainabilityPreferences"
                    fullWidth
                    multiline
                    rows={3}
                    value={profile.sustainabilityPreferences}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} display="flex" justifyContent="flex-end">
                  <Button type="submit" variant="contained" color="primary" size="large" disabled={saving}>
                    {saving ? t('profile.saving') : t('profile.saveChangesBtn')}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Activity History */}
      {profileTab === 1 && (
        <Card sx={{ p: 2.5 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
              <Typography variant="h6" fontWeight={700}>
                {t('profile.userActivityAudit')}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant={historyFilter === 'today' ? 'contained' : 'outlined'} onClick={() => handleFilterChange('today')}>
                  Today
                </Button>
                <Button size="small" variant={historyFilter === '7days' ? 'contained' : 'outlined'} onClick={() => handleFilterChange('7days')}>
                  Last 7 Days
                </Button>
                <Button size="small" variant={historyFilter === '30days' ? 'contained' : 'outlined'} onClick={() => handleFilterChange('30days')}>
                  Last 30 Days
                </Button>
                <Button size="small" variant={historyFilter === 'all' ? 'contained' : 'outlined'} onClick={() => handleFilterChange('all')}>
                  All History
                </Button>
              </Stack>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.01)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>{t('profile.action')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('profile.description')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('profile.page')}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{t('profile.dateTime')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activityHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">{t('profile.noActionsLogged')}</TableCell>
                    </TableRow>
                  ) : (
                    activityHistory.map((act) => (
                      <TableRow key={act.id}>
                        <TableCell>
                          <Chip 
                            label={act.activityName} 
                            size="small" 
                            color={
                              act.activityType === 'CREATE' ? 'primary' :
                              act.activityType === 'UPDATE' ? 'info' :
                              act.activityType === 'DELETE' ? 'error' :
                              act.activityType === 'LOGIN' ? 'success' : 'default'
                            }
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{act.activityDescription}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{act.pageName || 'System'}</TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {new Date(act.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
              <Typography variant="caption" color="text.secondary">
                {t('profile.historyPage')} {page + 1} {t('profile.historyOf')} {totalPages}
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <Button size="small" variant="outlined" disabled={page === 0} onClick={() => handlePageChange('prev')}>
                  Previous
                </Button>
                <Button size="small" variant="outlined" disabled={page + 1 >= totalPages} onClick={() => handlePageChange('next')}>
                  Next
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Badges */}
      {profileTab === 2 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={800}>
              {t('profile.badgesTitle')}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant={badgesFilter === 'unlocked' ? 'contained' : 'outlined'} onClick={() => setBadgesFilter('unlocked')}>{t('profile.badgesUnlocked')}</Button>
              <Button size="small" variant={badgesFilter === 'locked' ? 'contained' : 'outlined'} onClick={() => setBadgesFilter('locked')}>{t('profile.badgesLocked')}</Button>
              <Button size="small" variant={badgesFilter === 'all' ? 'contained' : 'outlined'} onClick={() => setBadgesFilter('all')}>{t('profile.badgesAll')}</Button>
            </Stack>
          </Box>

          <Grid container spacing={3}>
            {displayedBadges.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent' }}>
                  <Typography color="text.secondary">{t('profile.badgesNoBadgesMatching')}</Typography>
                </Paper>
              </Grid>
            ) : (
              displayedBadges.map((b, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card sx={{
                    position: 'relative',
                    transition: 'all 0.3s',
                    opacity: b.locked ? 0.6 : 1.0,
                    filter: b.locked ? 'grayscale(80%)' : 'none',
                    border: b.locked ? '1px dashed rgba(255,255,255,0.1)' : '1px solid rgba(16,185,129,0.2)',
                    '&:hover': { transform: b.locked ? 'none' : 'translateY(-4px)' }
                  }}>
                    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 70, height: 70, mb: 2,
                          bgcolor: b.locked ? 'action.disabledBackground' : 'rgba(16,185,129,0.1)',
                          color: b.locked ? 'text.disabled' : '#10b981',
                          border: b.locked ? 'none' : '2px solid #10b981'
                        }}
                      >
                        <EmojiEventsIcon sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight={850}>{b.badgeName}</Typography>
                      <Chip label={b.category} size="small" sx={{ my: 1, fontSize: '0.65rem', fontWeight: 800 }} color={b.locked ? 'default' : 'primary'} />
                      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, mb: 2 }}>
                        {b.description}
                      </Typography>
                      
                      {b.locked ? (
                        <Box sx={{ width: '100%' }}>
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" color="text.secondary">{t('profile.badgesProgress')}</Typography>
                            <Typography variant="caption" fontWeight={800}>{b.progress}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={b.progress} sx={{ height: 6, borderRadius: 2 }} color="warning" />
                        </Box>
                      ) : (
                        <Typography variant="caption" color="success.main" display="flex" alignItems="center" gap={0.5} fontWeight={700}>
                          <CheckCircleIcon sx={{ fontSize: 14 }} /> {t('profile.badgesEarnedOn')} {new Date(b.dateEarned).toLocaleDateString()}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* Tab 3: Certificates */}
      {profileTab === 3 && (
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
            {t('profile.certsTitle')}
          </Typography>

          {certificates.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Typography color="text.secondary" gutterBottom>
                {t('profile.certsNoCerts')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxW: 500, mx: 'auto' }}>
                {t('profile.certsNoCertsDesc')}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {certificates.map((cert) => (
                <Grid item xs={12} sm={6} key={cert.id}>
                  <Card sx={{
                    border: '1px solid rgba(16,185,129,0.2)',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.02) 0%, rgba(255,255,255,0.02) 100%)',
                    transition: 'all 0.3s',
                    '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start" sx={{ mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                          <WorkspacePremiumIcon />
                        </Avatar>
                        <Chip label={cert.certificateId} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={850} gutterBottom>
                        {cert.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                        {cert.description}
                      </Typography>

                      <Grid container spacing={1} sx={{ mb: 3, p: 1.5, bgcolor: 'rgba(255,255,255,0.01)', borderRadius: 1.5 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block">{t('profile.certsIssued')}</Typography>
                          <Typography variant="body2" fontWeight={700}>{new Date(cert.dateIssued).toLocaleDateString()}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block">{t('profile.certsIssuer')}</Typography>
                          <Typography variant="body2" fontWeight={700}>{cert.organizationName}</Typography>
                        </Grid>
                      </Grid>

                      <Box display="flex" gap={1}>
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<CardMembershipIcon />}
                          onClick={() => setSelectedCert(cert)}
                        >
                          {t('profile.certsViewDoc')}
                        </Button>
                        <IconButton size="small" onClick={() => handleShareCertificate(cert)} color="info" sx={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 1.5 }}>
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Tab 4: Achievements */}
      {profileTab === 4 && (
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>
            {t('profile.achieveTitle')}
          </Typography>

          {achievements.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent' }}>
              <Typography color="text.secondary">{t('profile.achieveLocked')}</Typography>
            </Paper>
          ) : (
            <Box sx={{ position: 'relative', pl: 3, borderLeft: '2px solid rgba(16,185,129,0.2)' }}>
              {achievements.map((ach, idx) => (
                <Box key={ach.id} sx={{ position: 'relative', mb: 4 }}>
                  {/* Timeline dot */}
                  <Avatar sx={{
                    position: 'absolute',
                    left: -41,
                    top: 0,
                    width: 32,
                    height: 32,
                    bgcolor: 'background.paper',
                    border: '2px solid #10b981',
                    color: '#10b981'
                  }}>
                    <TimelineIcon sx={{ fontSize: 16 }} />
                  </Avatar>

                  <Card variant="outlined" sx={{ ml: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start" flexWrap="wrap" gap={1}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={850}>{ach.title}</Typography>
                          <Typography variant="caption" color="text.secondary">{new Date(ach.achievedAt).toLocaleString()}</Typography>
                        </Box>
                        <Chip label={`+${ach.rewardPoints} points`} size="small" color="success" sx={{ fontWeight: 800 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                        {ach.description}
                      </Typography>
                      {ach.badgeName && (
                        <Box sx={{ mt: 1.5 }} display="flex" alignItems="center" gap={0.5}>
                          <MilitaryTechIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                          <Typography variant="caption" fontWeight={700}>{t('profile.achieveBadgeUnlocked')} {ach.badgeName}</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Tab 5: Rewards Progress */}
      {profileTab === 5 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Card sx={{
              p: 3, textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(16,185,129,0.08) 100%)',
              border: '1px solid rgba(16,185,129,0.2)'
            }}>
              <CardContent>
                <Avatar sx={{ mx: 'auto', mb: 2, width: 80, height: 80, bgcolor: 'primary.main', color: 'background.paper', fontSize: '2rem', fontWeight: 900 }}>
                  {rewards.level}
                </Avatar>
                <Typography variant="h5" fontWeight={850} gutterBottom>
                  Level {rewards.level}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('profile.rewardsLevelUpInfo').replace('{totalPoints}', rewards.totalPoints)}
                </Typography>
                
                <Box sx={{ width: '100%', mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">{t('profile.levelProgress')}</Typography>
                    <Typography variant="caption" fontWeight={800}>{rewards.progressToNextLevel}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={rewards.progressToNextLevel} sx={{ height: 8, borderRadius: 2 }} />
                </Box>

                <Grid container spacing={2} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">{t('profile.globalRank')}</Typography>
                    <Typography variant="subtitle1" fontWeight={800}>🏆 #{rewards.currentRank}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">{t('profile.pointsAccumulated')}</Typography>
                    <Typography variant="subtitle1" fontWeight={800}>🪙 {rewards.totalPoints}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom display="flex" alignItems="center" gap={1}>
                  <StarsIcon color="primary" /> {t('profile.earningRulesTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('profile.earningRulesDesc')}
                </Typography>

                <Stack spacing={2}>
                  {[
                    { label: t('profile.ruleLogActivities'), pts: '+10 ' + t('org.points'), desc: t('profile.ruleLogActivitiesDesc') },
                    { label: t('profile.ruleCompleteGoals'), pts: '+50 ' + t('org.points'), desc: t('profile.ruleCompleteGoalsDesc') },
                    { label: t('profile.ruleRecs'), pts: '+30 ' + t('org.points'), desc: t('profile.ruleRecsDesc') },
                    { label: t('profile.ruleBadges'), pts: '+20 ' + t('org.points'), desc: t('profile.ruleBadgesDesc') },
                    { label: t('profile.ruleCerts'), pts: '+100 ' + t('org.points'), desc: t('profile.ruleCertsDesc') }
                  ].map((rule, idx) => (
                    <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)', '&:last-child': { pb: 0, borderBottom: 'none' } }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>{rule.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{rule.desc}</Typography>
                      </Box>
                      <Chip label={rule.pts} color="success" size="small" sx={{ fontWeight: 800 }} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 6: Notifications */}
      {profileTab === 6 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={800} display="flex" alignItems="center" gap={1}>
                <NotificationsIcon color="primary" /> {t('profile.tabNotifications')}
              </Typography>
              {notifications.some(n => !n.isRead) && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DoneAllIcon />}
                  onClick={handleMarkAllNotificationsRead}
                >
                  {t('profile.markAllRead')}
                </Button>
              )}
            </Box>

            {notifications.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'transparent' }}>
                <Typography color="text.secondary">{t('profile.notifsNoNotifs')}</Typography>
              </Paper>
            ) : (
              <List>
                {notifications.map((notif) => (
                  <ListItem
                    key={notif.id}
                    secondaryAction={
                      !notif.isRead && (
                        <Button
                          size="small"
                          onClick={() => handleMarkNotificationRead(notif.id)}
                        >
                          {t('profile.markRead')}
                        </Button>
                      )
                    }
                    sx={{
                      mb: 1.5,
                      borderRadius: 1.5,
                      bgcolor: notif.isRead ? 'transparent' : 'rgba(255,255,255,0.02)',
                      border: notif.isRead ? '1px solid rgba(255,255,255,0.02)' : '1px solid rgba(16,185,129,0.1)'
                    }}
                  >
                    <ListItemAvatar>
                      <MuiBadge color="error" variant="dot" invisible={notif.isRead}>
                        <Avatar sx={{ bgcolor: 'rgba(6,182,212,0.1)', color: 'info.main' }}>
                          <NotificationsIcon fontSize="small" />
                        </Avatar>
                      </MuiBadge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={800} color={notif.isRead ? 'text.secondary' : 'text.primary'}>
                          {notif.title}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {notif.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {new Date(notif.createdAt).toLocaleString()}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 7: Settings */}
      {profileTab === 7 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255,255,255,0.01)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={850} display="flex" alignItems="center" gap={1.5} sx={{ mb: 3 }}>
                  <SettingsIcon color="primary" /> {t('profile.settingsTitle')}
                </Typography>
                <Stack spacing={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>{t('profile.settingsWeekly')}</Typography>
                      <Typography variant="caption" color="text.secondary">{t('profile.settingsWeeklyDesc')}</Typography>
                    </Box>
                    <Switch
                      checked={settings.weeklyDigest}
                      onChange={(e) => handleSettingsChange('weeklyDigest', e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>{t('profile.settingsGoals')}</Typography>
                      <Typography variant="caption" color="text.secondary">{t('profile.settingsGoalsDesc')}</Typography>
                    </Box>
                    <Switch
                      checked={settings.weeklyDigest}
                      onChange={(e) => handleSettingsChange('goalAlerts', e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>{t('profile.settingsBadges')}</Typography>
                      <Typography variant="caption" color="text.secondary">{t('profile.settingsBadgesDesc')}</Typography>
                    </Box>
                    <Switch
                      checked={settings.weeklyDigest}
                      onChange={(e) => handleSettingsChange('badgeAlerts', e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>{t('profile.settingsLeaderboard')}</Typography>
                      <Typography variant="caption" color="text.secondary">{t('profile.settingsLeaderboardDesc')}</Typography>
                    </Box>
                    <Switch
                      checked={settings.weeklyDigest}
                      onChange={(e) => handleSettingsChange('leaderboardAlerts', e.target.checked)}
                      color="primary"
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ pt: 2 }}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t('profile.settingsLanguage')}</InputLabel>
                        <Select
                          label={t('profile.settingsLanguage')}
                          value={settings.language}
                          onChange={(e) => handleSettingsChange('language', e.target.value)}
                        >
                           {[...SUPPORTED_LANGUAGES].sort((a, b) => a.label.localeCompare(b.label)).map((item) => (
                             <MenuItem key={item.code} value={item.code}>
                               {item.label}
                             </MenuItem>
                           ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t('profile.settingsCurrency')}</InputLabel>
                        <Select
                          label={t('profile.settingsCurrency')}
                          value={settings.currency}
                          onChange={(e) => handleSettingsChange('currency', e.target.value)}
                        >
                          <MenuItem value="USD">USD ($)</MenuItem>
                          <MenuItem value="EUR">EUR (€)</MenuItem>
                          <MenuItem value="INR">INR (₹)</MenuItem>
                          <MenuItem value="GBP">GBP (£)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>{t('profile.settingsDistance')}</InputLabel>
                        <Select
                          label={t('profile.settingsDistance')}
                          value={settings.distanceUnit}
                          onChange={(e) => handleSettingsChange('distanceUnit', e.target.value)}
                        >
                          <MenuItem value="km">{t('profile.kilometers')}</MenuItem>
                          <MenuItem value="mi">{t('profile.miles')}</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Box display="flex" justifyContent="flex-end" sx={{ pt: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleSaveSettings} sx={{ fontWeight: 800 }}>
                      {t('profile.savePreferences')}
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255,255,255,0.01)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={850} display="flex" alignItems="center" gap={1.5} sx={{ mb: 3 }}>
                  <LockIcon color="primary" /> {t('profile.settingsChangePassword')}
                </Typography>
                
                {passwordError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError('')}>{passwordError}</Alert>}
                {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess('')}>{passwordSuccess}</Alert>}

                <form onSubmit={handlePasswordSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      label={t('profile.settingsOldPassword')}
                      type="password"
                      fullWidth
                      required
                      value={passwordState.oldPassword}
                      onChange={(e) => setPasswordState(prev => ({ ...prev, oldPassword: e.target.value }))}
                    />
                    <TextField
                      label={t('profile.settingsNewPassword')}
                      type="password"
                      fullWidth
                      required
                      value={passwordState.newPassword}
                      onChange={(e) => setPasswordState(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                    <TextField
                      label={t('profile.settingsConfirmPassword')}
                      type="password"
                      fullWidth
                      required
                      value={passwordState.confirmPassword}
                      onChange={(e) => setPasswordState(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                    <Box display="flex" justifyContent="flex-end">
                      <Button type="submit" variant="contained" color="secondary" disabled={passwordLoading} sx={{ fontWeight: 800 }}>
                        {passwordLoading ? t('profile.saving') : t('profile.settingsUpdatePasswordBtn')}
                      </Button>
                    </Box>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      {/* Tab 8: Mobile App (PWA Settings) */}
      {profileTab === 8 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', border: '1px solid rgba(16, 185, 129, 0.1)', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(10px)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={850} display="flex" alignItems="center" gap={1.5} sx={{ mb: 4, color: '#10b981' }}>
                  <SettingsIcon /> Mobile App Settings
                </Typography>
                <Stack spacing={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>App Installation</Typography>
                      <Typography variant="caption" color="text.secondary">Run standalone without browser navigation UI</Typography>
                    </Box>
                    {isInstalled ? (
                      <Chip label="Installed" color="success" size="small" sx={{ fontWeight: 800 }} />
                    ) : isInstallable ? (
                      <Button variant="contained" color="primary" size="small" onClick={installApp} sx={{ fontWeight: 800 }}>
                        Install App
                      </Button>
                    ) : (
                      <Chip label="Not Installable" color="default" size="small" sx={{ fontWeight: 800 }} />
                    )}
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>Network Status</Typography>
                      <Typography variant="caption" color="text.secondary">Current connectivity state</Typography>
                    </Box>
                    <Chip 
                      label={isOnline ? "Online" : "Offline"} 
                      color={isOnline ? "success" : "error"} 
                      size="small" 
                      sx={{ fontWeight: 800 }} 
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>Offline Cache Size</Typography>
                      <Typography variant="caption" color="text.secondary">Stored assets for offline operations</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={800} color="text.primary">{cacheSize}</Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>Notifications</Typography>
                      <Typography variant="caption" color="text.secondary">Push notifications for goals and achievements</Typography>
                    </Box>
                    {notificationStatus === 'granted' ? (
                      <Chip label="Enabled" color="success" size="small" sx={{ fontWeight: 800 }} />
                    ) : (
                      <Button variant="outlined" color="primary" size="small" onClick={requestNotificationPermission} sx={{ fontWeight: 800 }}>
                        Enable
                      </Button>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255,255,255,0.01)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={850} display="flex" alignItems="center" gap={1.5} sx={{ mb: 4 }}>
                  <TimelineIcon /> Diagnostics & Sync
                </Typography>
                <Stack spacing={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>Application Version</Typography>
                      <Typography variant="caption" color="text.secondary">Current build signature</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={800} color="text.primary">v1.2.0-pwa</Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>Last Sync</Typography>
                      <Typography variant="caption" color="text.secondary">Timestamp of last background sync</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={800} color="text.primary">{lastSyncTime}</Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pb: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>Queued Requests</Typography>
                      <Typography variant="caption" color="text.secondary">Pending operations synced on recovery</Typography>
                    </Box>
                    <Chip label={`${queuedCount} pending`} color={queuedCount > 0 ? "warning" : "default"} size="small" sx={{ fontWeight: 800 }} />
                  </Box>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
                    <Button variant="outlined" color="error" fullWidth onClick={clearCache} sx={{ fontWeight: 800 }}>
                      Clear Cache
                    </Button>
                    <Button variant="outlined" color="primary" fullWidth onClick={checkUpdates} sx={{ fontWeight: 800 }}>
                      Check Updates
                    </Button>
                    <Button variant="contained" color="primary" fullWidth onClick={forceSync} disabled={!isOnline} sx={{ fontWeight: 800 }}>
                      Force Sync
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Tab 7: Settings */}

      {/* Certificate Print View Dialog */}
      {selectedCert && (
        <Dialog open={!!selectedCert} onClose={() => setSelectedCert(null)} maxWidth="md" fullWidth>
          <DialogContent sx={{ p: 0 }}>
            {/* The printable/view certificate layout */}
            <Box id="printable-certificate" sx={{
              p: 6,
              background: 'radial-gradient(circle, #0e1e17 0%, #030806 100%)',
              border: '15px double #10b981',
              textAlign: 'center',
              color: '#ffffff',
              position: 'relative'
            }}>
              {/* Platform Logo */}
              <Box display="flex" justifyContent="center" mb={2}>
                <Avatar sx={{ bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981', width: 60, height: 60, border: '1px solid #10b981' }}>
                  <WorkspacePremiumIcon sx={{ fontSize: 36 }} />
                </Avatar>
              </Box>
              <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 800, tracking: 3, uppercase: true }}>
                CarbonTracker Global Coalition
              </Typography>

              <Typography variant="h3" fontWeight={900} sx={{ my: 4, fontFamily: 'serif', letterSpacing: 1 }}>
                {t('profile.certsModalTitle')}
              </Typography>

              <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic', mb: 2 }}>
                This is proudly awarded to
              </Typography>

              <Typography variant="h4" fontWeight={900} sx={{ borderBottom: '2px solid rgba(255,255,255,0.1)', maxW: 400, mx: 'auto', pb: 1, mb: 3 }}>
                {profile.fullName}
              </Typography>

              <Typography variant="body1" sx={{ maxW: 600, mx: 'auto', lineHeight: 1.8, color: 'text.secondary' }}>
                For successfully unlocking the milestone achievement:
                <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ mt: 1, mb: 2 }}>
                  {selectedCert.title}
                </Typography>
                {selectedCert.description}
              </Typography>

              <Grid container spacing={3} sx={{ mt: 6, alignItems: 'center' }}>
                <Grid item xs={4} sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" color="text.secondary" display="block">DATE ISSUED</Typography>
                  <Typography variant="body2" fontWeight={700}>{new Date(selectedCert.dateIssued).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Box display="flex" justifyContent="center">
                    <QrCodeIcon sx={{ fontSize: 70, opacity: 0.8 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>SECURE VERIFICATION</Typography>
                  <Typography variant="caption" fontWeight={800} sx={{ fontFamily: 'monospace' }}>{selectedCert.certificateId}</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" display="block">AUTHORIZED SIGNATURE</Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#10b981', fontWeight: 700 }}>Director, CarbonTracker</Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button startIcon={<PrintIcon />} variant="contained" onClick={handlePrintCertificate}>
              {t('profile.certsModalPrint')}
            </Button>
            <Button onClick={() => setSelectedCert(null)} color="inherit">
              {t('recs.dialogClose')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default Profile;
