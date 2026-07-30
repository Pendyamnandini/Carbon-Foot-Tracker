import React, { useContext } from 'react';
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

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const stats = [
    { label: 'Total Emissions Tracked', value: '1,245,800 kg', subtext: 'CO₂ equivalent' },
    { label: 'Active Eco Warriors', value: '28,400+', subtext: 'Global users' },
    { label: 'Sustainability Goals', value: '14,250', subtext: 'Achieved this year' },
    { label: 'Net Carbon Saved', value: '382,500 kg', subtext: 'Verified reduction' }
  ];

  const features = [
    {
      title: 'Automated Activity Logging',
      description: 'Log transport, electricity, food, and shopping habits effortlessly with intelligent real-time carbon conversion factors.',
      icon: <TravelExploreIcon color="primary" sx={{ fontSize: 44 }} />
    },
    {
      title: 'Category Intelligence & Forecasts',
      description: 'Deep dive into 4 core emission categories with predictive trend lines, peak day analysis, and YoY period comparisons.',
      icon: <AutoGraphIcon color="secondary" sx={{ fontSize: 44 }} />
    },
    {
      title: 'Personalized Recommendations',
      description: 'Get actionable eco-tips calculated with estimated monthly and annual carbon savings tailored to your consumption habits.',
      icon: <Co2Icon color="primary" sx={{ fontSize: 44 }} />
    },
    {
      title: 'Leaderboard & Achievements',
      description: 'Earn gamified eco-badges (Eco Saver, 7-Day Streak) and climb the platform rankings as you reduce your footprint.',
      icon: <EmojiEventsIcon color="secondary" sx={{ fontSize: 44 }} />
    },
    {
      title: 'Enterprise Benchmarking',
      description: 'Compare your progress against platform averages and organization benchmarks with percentile ranking insights.',
      icon: <SpeedIcon color="primary" sx={{ fontSize: 44 }} />
    },
    {
      title: 'Audit-Ready Export Center',
      description: 'Generate comprehensive PDF and CSV sustainability compliance reports for personal audit or enterprise reporting.',
      icon: <SecurityIcon color="secondary" sx={{ fontSize: 44 }} />
    }
  ];

  const testimonials = [
    {
      quote: "CarbonTracker transformed how our company measures Scope 1, 2, and 3 emissions. The category analytics and custom date range filters give us instant clarity.",
      author: "Sarah Jenkins",
      role: "Sustainability Director, EcoCorp",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      quote: "The personalized recommendation engine helped me reduce my household carbon footprint by 32% in just two months. The streak badges keep me motivated daily!",
      author: "David Chen",
      role: "Individual User & Climate Advocate",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      quote: "The automated email goal alerts and period comparison engine make tracking our department's green targets effortless and rewarding.",
      author: "Elena Rostova",
      role: "ESG Manager, GreenVentures",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', pt: 6, pb: 10, position: 'relative' }}>
      {/* Floating Theme Toggle */}
      <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1100 }}>
        <Paper elevation={4} sx={{ borderRadius: '50%', p: 0.5, backdropFilter: 'blur(10px)', background: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.8)' }}>
          <IconButton onClick={colorMode.toggleColorMode} color="inherit" size="large">
            {theme.palette.mode === 'dark' ? <LightModeIcon sx={{ color: '#fbbf24' }} /> : <DarkModeIcon sx={{ color: '#1f2937' }} />}
          </IconButton>
        </Paper>
      </Box>

      <Container maxWidth="lg">
        {/* HERO SECTION */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: 12, pt: 4 }}>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Box>
                <Chip
                  icon={<NaturePeopleIcon />}
                  label="Next-Gen Sustainability Analytics Platform"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600, px: 1, py: 0.5, borderRadius: 3 }}
                />
              </Box>
              <Typography variant="h2" fontWeight={900} sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                Empower Your Journey To <Box component="span" sx={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Zero Emissions</Box>
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.6 }}>
                Track daily activities across transport, electricity, food, and shopping. Benefit from real-time analytics, predictive forecasting, automated goal alerts, and enterprise benchmarking.
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
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ py: 1.8, px: 4, borderRadius: 3, fontWeight: 600, fontSize: '1.05rem', borderColor: 'divider' }}
                >
                  Sign In to Portal
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
              <Co2Icon sx={{ fontSize: 130, color: 'primary.main', mb: 2, filter: 'drop-shadow(0 10px 15px rgba(16, 185, 129, 0.4))' }} />
              <Typography variant="h5" fontWeight={800} gutterBottom>
                Real-Time Carbon Intelligence
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Live monitoring, dynamic period comparisons, and automated milestone tracking.
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
                Why Carbon Footprint Monitoring Matters
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                Human activities generate greenhouse gases that accelerate global climate change. Every commute, electricity bill, dietary choice, and retail purchase carries a hidden carbon cost.
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                By establishing a clear baseline and measuring daily outputs, individuals and organizations can target impactful reductions, unlock financial savings, and drive meaningful environmental stewardship.
              </Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
                <Box>
                  <Typography variant="h4" fontWeight={800} color="secondary.main">4.8 Tons</Typography>
                  <Typography variant="caption" color="text.secondary">Avg. Annual Global Footprint per Person</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800} color="primary.main">2.0 Tons</Typography>
                  <Typography variant="caption" color="text.secondary">Target Footprint to Halt Global Warming</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper className="glass-card" sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpeedIcon /> Carbon Impact Breakdown
                </Typography>
                <Stack spacing={2.5} sx={{ mt: 3 }}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="subtitle2">Transportation</Typography>
                      <Typography variant="subtitle2" fontWeight={700}>42% Avg Impact</Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 10, borderRadius: 5, bg: 'divider', overflow: 'hidden' }}>
                      <Box sx={{ width: '42%', height: '100%', background: '#3b82f6' }} />
                    </Box>
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="subtitle2">Electricity & Heating</Typography>
                      <Typography variant="subtitle2" fontWeight={700}>28% Avg Impact</Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 10, borderRadius: 5, bg: 'divider', overflow: 'hidden' }}>
                      <Box sx={{ width: '28%', height: '100%', background: '#fbbf24' }} />
                    </Box>
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="subtitle2">Food & Agriculture</Typography>
                      <Typography variant="subtitle2" fontWeight={700}>18% Avg Impact</Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 10, borderRadius: 5, bg: 'divider', overflow: 'hidden' }}>
                      <Box sx={{ width: '18%', height: '100%', background: '#10b981' }} />
                    </Box>
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography variant="subtitle2">Goods & Shopping</Typography>
                      <Typography variant="subtitle2" fontWeight={700}>12% Avg Impact</Typography>
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
              Comprehensive SaaS Platform Features
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto" sx={{ fontSize: '0.95rem' }}>
              Everything you need to measure emissions, complete eco challenges, and report zero carbon compliance.
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
              What Sustainability Advocates Say
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
              Real impact stories from businesses and individuals using CarbonTracker.
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
            Ready to Offset Your Footprint?
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.85, mb: 4, maxWidth: 600, mx: 'auto', fontWeight: 400, fontSize: '1rem', lineHeight: 1.5 }}>
            Join a global community tracking Scope 1, 2, and 3 carbon emissions. Completely free for development and demonstration.
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
            Start Tracking Free
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LandingPage;
