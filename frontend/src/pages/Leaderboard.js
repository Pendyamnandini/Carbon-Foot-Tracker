import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, Box, Alert, CircularProgress, Grid, Avatar, Chip, Stack } from '@mui/material';
import api from '../api';
import { useTranslation } from '../context/LanguageContext';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import Co2Icon from '@mui/icons-material/Co2';

const Leaderboard = () => {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch leaderboard
      const lbRes = await api.get('/api/leaderboard');
      if (lbRes.data.success) {
        setLeaderboard(lbRes.data.data);
      }

      // Fetch user earned badges
      const badgeRes = await api.get('/api/profile/badges');
      if (badgeRes.data.success) {
        setBadges(badgeRes.data.data);
      }

    } catch (e) {
      setError(t('leaderboard.retrieveError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Get rank style details
  const getRankDetails = (rank) => {
    switch (rank) {
      case 1:
        return { badge: '🥇', border: '2px solid #fbbf24', bg: 'rgba(251, 191, 36, 0.08)' };
      case 2:
        return { badge: '🥈', border: '2px solid #9ca3af', bg: 'rgba(156, 163, 175, 0.08)' };
      case 3:
        return { badge: '🥉', border: '2px solid #d97706', bg: 'rgba(217, 119, 6, 0.08)' };
      default:
        return { badge: rank.toString(), border: '1px solid rgba(255,255,255,0.05)', bg: 'transparent' };
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 4 }}>
        <EmojiEventsIcon sx={{ fontSize: '2.5rem', color: 'warning.main' }} />
        <Typography variant="h4" fontWeight={800}>
          {t('leaderboard.title')}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {/* Leaderboard Standings */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            🏆 {t('leaderboard.subtitle')}
          </Typography>

          <Stack spacing={2}>
            {leaderboard.length === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('leaderboard.noUsers')}</Typography>
              </Card>
            ) : (
              leaderboard.map((row) => {
                const rankInfo = getRankDetails(row.rankPosition);
                const isPodium = row.rankPosition <= 3;
                return (
                  <Card 
                    key={row.userId} 
                    sx={{ 
                      p: 2, 
                      border: rankInfo.border, 
                      background: rankInfo.bg,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateX(4px)',
                      }
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      {/* Left side: Rank & Avatar & Name */}
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: isPodium ? '1.5rem' : '0.9rem',
                            color: 'text.secondary'
                          }}
                        >
                          {rankInfo.badge}
                        </Box>
                        
                        <Avatar 
                          sx={{ 
                            width: 44, 
                            height: 44, 
                            bgcolor: isPodium ? 'warning.main' : 'secondary.main', 
                            fontSize: '1rem',
                            fontWeight: 700
                          }} 
                          src={row.profileImageUrl ? `http://127.0.0.1:8080${row.profileImageUrl}` : undefined}
                        >
                          {row.userName.charAt(0).toUpperCase()}
                        </Avatar>
                        
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800}>
                            {row.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('leaderboard.activeParticipant')}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Right side: Carbon footprint number */}
                      <Box textAlign="right">
                        <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
                          <Co2Icon color="primary" />
                          <Typography variant="h6" fontWeight={900} color="primary.main">
                            {row.carbonEmission.toFixed(1)}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {t('leaderboard.savings')}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                );
              })
            )}
          </Stack>
        </Grid>

        {/* User Badges */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            🏅 {t('profile.tabAchievements')}
          </Typography>
          
          {badges.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <WorkspacePremiumIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {t('profile.badgesLocked')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('profile.badgesLockedDesc')}
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {badges.map((ub) => (
                <Grid item xs={12} key={ub.id}>
                  <Card 
                    sx={{ 
                      p: 2.5, 
                      display: 'flex', 
                      alignItems: 'center', 
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
                      borderColor: 'rgba(16, 185, 129, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)'
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(16, 185, 129, 0.12)', 
                        color: 'primary.main', 
                        mr: 2.5, 
                        width: 52, 
                        height: 52,
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <MilitaryTechIcon sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                        {ub.badge.badgeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                        {ub.badge.description}
                      </Typography>
                      <Chip 
                        label={`{t('profile.badgesEarnedOn')}${new Date(ub.awardedDate).toLocaleDateString()}`}
                        size="small" 
                        color="primary"
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                      />
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Leaderboard;
