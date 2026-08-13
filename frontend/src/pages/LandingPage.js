import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Stack, IconButton, Avatar, Chip, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import Co2Icon from '@mui/icons-material/Co2';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import SpeedIcon from '@mui/icons-material/Speed';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../App';
import { useTranslation } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../locales/languages';
import LandingBackground from '../components/LandingBackground';

const LandingPage = () => {
  const { t, changeLanguage } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const [detectedLang, setDetectedLang] = useState(null);
  const [showLangPrompt, setShowLangPrompt] = useState(false);

  const langNames = {
    hi: 'हिन्दी (Hindi)',
    te: 'తెలుగు (Telugu)',
    bn: 'বাংলা (Bengali)',
    ta: 'தமிழ் (Tamil)',
    kn: 'కన్నడ (Kannada)',
    ml: 'മലയാളം (Malayalam)',
    mr: 'मराठी (Marathi)',
    gu: 'ગુજરાતી (Gujarati)',
    pa: 'ਪੰਜਾਬੀ (Punjabi)',
    ur: 'اردو (Urdu)',
    es: 'Español (Spanish)',
    fr: 'Français (French)',
    de: 'Deutsch (German)',
    it: 'Italiano (Italian)',
    pt: 'Português (Portuguese)',
    nl: 'Nederlands (Dutch)',
    ru: 'Русский (Russian)',
    zh_CN: '简体中文 (Chinese)',
    ja: '日本語 (Japanese)',
    ar: 'العربية (Arabic)'
  };

  useEffect(() => {
    // Disabled auto-selecting language based on browser on LandingPage
    // useEffect(() => {
    //   const checkBrowserLang = () => {
    //     if (!localStorage.getItem('app_lang')) {
    //       const browserLang = navigator.language || navigator.userLanguage || 'en';
    //       const shortCode = browserLang.split('-')[0];
    //       const isSupported = SUPPORTED_LANGUAGES.some(l => l.code === shortCode || l.code === browserLang);
    //       
    //       if (isSupported && shortCode !== 'en') {
    //         changeLanguage(shortCode);
    //       }
    //     }
    //   };
    //   checkBrowserLang();
    // }, [changeLanguage]);
  }, []);

  const handleAcceptLang = () => {
    changeLanguage(detectedLang);
    localStorage.setItem('lang_prompt_dismissed', 'true');
    setShowLangPrompt(false);
  };

  const handleDeclineLang = () => {
    localStorage.setItem('lang_prompt_dismissed', 'true');
    setShowLangPrompt(false);
  };

  const stats = [
    { label: t('landing.statsTotalEmissions'), value: '1,245,800 kg', subtext: t('landing.co2Equiv') },
    { label: t('landing.statsActiveWarriors'), value: '28,400+', subtext: t('landing.globalUsers') },
    { label: t('landing.statsGoals'), value: '14,250', subtext: t('landing.achievedThisYear') },
    { label: t('landing.statsCarbonSaved'), value: '382,500 kg', subtext: t('landing.verifiedReduction') }
  ];

  const features = [
    {
      title: t('landing.feature1Title'),
      description: t('landing.feature1Desc'),
      icon: <TravelExploreIcon color="primary" sx={{ fontSize: 44 }} />
    },
    {
      title: t('landing.feature2Title'),
      description: t('landing.feature2Desc'),
      icon: <AutoGraphIcon color="secondary" sx={{ fontSize: 44 }} />
    },
    {
      title: t('dashboard.tabRecommendations'),
      description: t('dashboard.tailoredRecsSubtitle'),
      icon: <Co2Icon color="primary" sx={{ fontSize: 44 }} />
    },
    {
      title: t('profile.tabAchievements'),
      description: t('leaderboard.subtitle'),
      icon: <EmojiEventsIcon color="secondary" sx={{ fontSize: 44 }} />
    },
    {
      title: t('nav.benchmarking'),
      description: t('dashboard.howYouCompare'),
      icon: <SpeedIcon color="primary" sx={{ fontSize: 44 }} />
    },
    {
      title: t('nav.reports'),
      description: t('dashboard.analyticsSubtitle'),
      icon: <SecurityIcon color="secondary" sx={{ fontSize: 44 }} />
    }
  ];

  const testimonials = [
    {
      quote: t('landing.testimonial1'),
      author: t('landing.testimonial1Author'),
      role: t('landing.testimonial1Role'),
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      quote: t('landing.testimonial2'),
      author: t('landing.testimonial2Author'),
      role: t('landing.testimonial2Role'),
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      quote: t('landing.testimonial3'),
      author: t('landing.testimonial3Author'),
      role: t('landing.testimonial3Role'),
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', pt: 6, pb: 10, position: 'relative' }}>
      <LandingBackground />
      {/* Floating Theme Toggle */}
      <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1100 }}>
        <Paper elevation={4} sx={{ borderRadius: '50%', p: 0.5, backdropFilter: 'blur(10px)', background: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.8)' }}>
          <IconButton onClick={colorMode.toggleColorMode} color="inherit" size="large">
            {theme.palette.mode === 'dark' ? <LightModeIcon sx={{ color: '#fbbf24' }} /> : <DarkModeIcon sx={{ color: '#1f2937' }} />}
          </IconButton>
        </Paper>
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* HERO SECTION */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: 12, pt: 4 }}>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Box>
                <Chip
                  icon={<NaturePeopleIcon />}
                  label={t('landing.badge')}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600, px: 1, py: 0.5, borderRadius: 3 }}
                />
              </Box>
              <Typography variant="h2" fontWeight={900} sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                {t('landing.heroTitle')}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.6 }}>
                {t('landing.heroSubtitle')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/register')}
                  sx={{ py: 1.8, px: 4, borderRadius: 3, fontWeight: 700, fontSize: '1.05rem', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)' }}
                >
                  {t('landing.getStarted')}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ py: 1.8, px: 4, borderRadius: 3, fontWeight: 600, fontSize: '1.05rem', borderColor: 'divider' }}
                >
                  {t('auth.login')}
                </Button>
              </Stack>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper
              elevation={12}
              className="glass-card"
              sx={{
                width: '100%',
                maxHeight: 380,
                p: 4,
                borderRadius: 5,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Eco themed backdrop shapes */}
              <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.15 }}>
                <NaturePeopleIcon sx={{ fontSize: 100, color: 'primary.main' }} />
              </Box>
              <Box sx={{ position: 'absolute', bottom: -30, left: -20, opacity: 0.1 }}>
                <Co2Icon sx={{ fontSize: 140, color: 'secondary.main' }} />
              </Box>
              
              {/* Hero Graphic */}
              <Box sx={{ position: 'relative', mb: 3 }}>
                <Box sx={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid rgba(16, 185, 129, 0.4)',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)',
                  zIndex: 2, position: 'relative'
                }}>
                  <Co2Icon sx={{ fontSize: 64, color: 'primary.main' }} />
                </Box>
                {/* Circular tracking line */}
                <svg width="120" height="120" style={{ position: 'absolute', top: -10, left: -10, zIndex: 1 }}>
                  <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="4" />
                  <circle cx="60" cy="60" r="56" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="351" strokeDashoffset="100" />
                </svg>
              </Box>
              
              <Typography variant="h5" fontWeight={800} gutterBottom sx={{ position: 'relative', zIndex: 3 }}>
                {t('landing.heroCardTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ position: 'relative', zIndex: 3 }}>
                {t('landing.heroCardDesc')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ANIMATED STATISTICS SECTION */}
        <Paper elevation={0} sx={{ p: 4, mb: 12, borderRadius: 4, background: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)', backdropFilter: 'blur(10px)', border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center', p: 1 }}>
                  <Typography variant="h3" fontWeight={900} color="primary.main" gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    {stat.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.subtext}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* CARBON AWARENESS SECTION */}
        <Box sx={{ mb: 12 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
                {t('landing.awarenessTitle')}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                {t('landing.awarenessDesc1')}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                {t('landing.awarenessDesc2')}
              </Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
                <Box>
                  <Typography variant="h4" fontWeight={800} color="secondary.main">{t('landing.awarenessStat1Val')}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('landing.awarenessStat1Lbl')}</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800} color="primary.main">{t('landing.awarenessStat2Val')}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('landing.awarenessStat2Lbl')}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper className="glass-card" sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedIcon /> {t('landing.impactBreakdown')}
                </Typography>
                <Stack spacing={2.5} sx={{ mt: 3 }}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="subtitle2">{t('landing.catTransport')}</Typography>
                      <Typography variant="subtitle2" fontWeight={700}>{t('landing.catTransportVal')}</Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 10, borderRadius: 5, bg: 'divider', overflow: 'hidden' }}>
                      <Box sx={{ width: '42%', height: '100%', background: '#3b82f6' }} />
                    </Box>
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="subtitle2">{t('landing.catElectricity')}</Typography>
                      <Typography variant="subtitle2" fontWeight={700}>{t('landing.catElectricityVal')}</Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 10, borderRadius: 5, bg: 'divider', overflow: 'hidden' }}>
                      <Box sx={{ width: '28%', height: '100%', background: '#fbbf24' }} />
                    </Box>
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="subtitle2">{t('landing.catFood')}</Typography>
                      <Typography variant="subtitle2" fontWeight={700}>{t('landing.catFoodVal')}</Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 10, borderRadius: 5, bg: 'divider', overflow: 'hidden' }}>
                      <Box sx={{ width: '18%', height: '100%', background: '#10b981' }} />
                    </Box>
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="subtitle2">{t('landing.catShopping')}</Typography>
                      <Typography variant="subtitle2" fontWeight={700}>{t('landing.catShoppingVal')}</Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 10, borderRadius: 5, bg: 'divider', overflow: 'hidden' }}>
                      <Box sx={{ width: '12%', height: '100%', background: '#ec4899' }} />
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* FEATURE HIGHLIGHTS */}
        <Box sx={{ mb: 12 }}>
          <Stack textAlign="center" spacing={2} sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight={800}>
              {t('landing.featuresTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto" sx={{ fontSize: '0.95rem' }}>
              {t('landing.featuresSubtitle')}
            </Typography>
          </Stack>

          <Grid container spacing={3.5}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  className="glass-card-hover" 
                  variant="outlined"
                  sx={{ 
                    height: '100%', 
                    p: 1.5, 
                    borderRadius: 4.5,
                    background: theme => theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.1)' : '#ffffff',
                    borderColor: 'divider',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.03)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ 
                      mb: 2, 
                      width: 56, 
                      height: 56, 
                      borderRadius: 3, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                    }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.85rem' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* TESTIMONIALS */}
        <Box sx={{ mb: 14 }}>
          <Stack textAlign="center" spacing={2} sx={{ mb: 7 }}>
            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.5 }}>
              {t('landing.testimonialsTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
              {t('landing.testimonialsSubtitle')}
            </Typography>
          </Stack>

          <Grid container spacing={3.5}>
            {testimonials.map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper 
                  variant="outlined"
                  sx={{ 
                    p: 4, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between', 
                    borderRadius: 5,
                    background: theme => theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.1)' : '#ffffff',
                    borderColor: 'divider'
                  }}
                >
                  <Box>
                    <FormatQuoteIcon sx={{ fontSize: 36, color: 'primary.main', opacity: 0.3, mb: 1 }} />
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 3, lineHeight: 1.7, fontSize: '0.9rem', color: 'text.secondary' }}>
                      "{item.quote}"
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={item.avatar} alt={item.author} sx={{ width: 42, height: 42 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2 }}>{item.author}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.role}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CALL TO ACTION */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 5, md: 8 },
            borderRadius: 6,
            background: 'linear-gradient(135deg, #0f766e 0%, #115e59 50%, #0d9488 100%)',
            color: '#ffffff',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(15,118,110,0.2)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Typography variant="h3" fontWeight={900} gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: -1 }}>
            {t('landing.ctaTitle')}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.85, mb: 4, maxWidth: 600, mx: 'auto', fontWeight: 400, fontSize: '1rem', lineHeight: 1.5 }}>
            {t('landing.ctaDesc')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              py: 2,
              px: 5,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: '1.05rem',
              backgroundColor: '#ffffff',
              color: '#0f766e',
              textTransform: 'none',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
              '&:hover': { backgroundColor: '#f8fafc' }
            }}
          >
            {t('landing.startTrackingFree')}
          </Button>
        </Paper>
      </Container>

      {/* Dynamic Browser Language Detection Prompt */}
      {showLangPrompt && detectedLang && (
        <Box sx={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 9999,
          maxWidth: 380,
          p: 3,
          borderRadius: 4,
          border: '1px solid rgba(16, 185, 129, 0.2)',
          background: 'rgba(11, 15, 25, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: '#ffffff', mb: 0.5 }}>
            {t('landing.changeLanguage')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2.5, fontSize: '0.85rem' }}>
            {t('landing.detectLangText1')}<strong>{langNames[detectedLang] || detectedLang}</strong>{t('landing.detectLangText2')}
          </Typography>
          <Box display="flex" gap={1.5}>
            <Button
              variant="outlined"
              fullWidth
              size="small"
              onClick={handleDeclineLang}
              sx={{
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                '&:hover': { borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }
              }}
            >
              {t('landing.keepEnglish')}
            </Button>
            <Button
              variant="contained"
              fullWidth
              size="small"
              onClick={handleAcceptLang}
              sx={{
                bgcolor: '#10b981',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              {t('landing.yesSwitch')}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LandingPage;
