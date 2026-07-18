import React, { useContext } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Stack, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import Co2Icon from '@mui/icons-material/Co2';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../App';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', pt: 8, position: 'relative' }}>
      {/* Floating Theme Toggle */}
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <IconButton onClick={colorMode.toggleColorMode} color="inherit" size="large">
          {theme.palette.mode === 'dark' ? <LightModeIcon sx={{ color: '#fbbf24' }} /> : <DarkModeIcon sx={{ color: '#1f2937' }} />}
        </IconButton>
      </Box>

      <Container maxWidth="lg">
        {/* Hero Section */}
        <Grid container spacing={4} alignItems="center" sx={{ mb: 10, mt: 4 }}>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <Typography variant="h2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                Monitor, Analyze & <Box component="span" sx={{ color: 'primary.main' }}>Reduce</Box> Your Carbon Footprint
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
                Log daily habits, set smart eco-goals, compete with others, and unlock achievement badges as you build a cleaner tomorrow.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary" size="large" onClick={() => navigate('/register')}>
                  Get Started Free
                </Button>
                <Button variant="outlined" color="secondary" size="large" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                width: 320,
                height: 320,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.05) 70%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 80px rgba(16, 185, 129, 0.1)',
                animation: 'pulse 4s infinite alternate',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '100%': { transform: 'scale(1.05)' }
                }
              }}
            >
              <Co2Icon sx={{ fontSize: 140, color: 'primary.main' }} />
            </Box>
          </Grid>
        </Grid>

        {/* Features Grid */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" textAlign="center" fontWeight={800} gutterBottom sx={{ mb: 6 }}>
            Features That Empower Change
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card className="glass-card-hover" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <TravelExploreIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Activity Logger
                  </Typography>
                  <Typography color="text.secondary">
                    Easily track daily transport, food consumption, grid power, and household spending. Automatic calculations translate inputs into carbon output immediately.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card className="glass-card-hover" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Co2Icon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Eco Goals & Insights
                  </Typography>
                  <Typography color="text.secondary">
                    Create dynamic carbon reduction goals. Our personalized recommendation engine evaluates logs and outputs tailored tips to help you reduce emissions.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card className="glass-card-hover" sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <EmojiEventsIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Leaderboard & Badges
                  </Typography>
                  <Typography color="text.secondary">
                    Compete on the community board for the lowest carbon footprint. Earn and display badges like Sustainability Champion and Eco Warrior.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
