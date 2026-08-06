import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Slide, IconButton, useTheme, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GetAppIcon from '@mui/icons-material/GetApp';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import InstallDesktopIcon from '@mui/icons-material/InstallDesktop';
import { usePWA } from '../context/PWAContext';
import { useTranslation } from '../context/LanguageContext';

const PWAInstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  useEffect(() => {
    // Show banner after 3 seconds if the app is installable and not yet installed
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        // Only show if the user hasn't explicitly dismissed it in this session
        const dismissed = sessionStorage.getItem('pwa_prompt_dismissed');
        if (!dismissed) {
          setShowBanner(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  if (!isInstallable || isInstalled || !showBanner) {
    return null;
  }

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowBanner(false);
    }
  };

  return (
    <Slide direction="up" in={showBanner} mountOnEnter unmountOnExit>
      <Paper
        elevation={24}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 16 : 24,
          left: isMobile ? 16 : 'auto',
          right: 16,
          width: isMobile ? 'calc(100% - 32px)' : 380,
          zIndex: 9999,
          borderRadius: 4,
          border: '1px solid rgba(16, 185, 129, 0.2)',
          background: 'rgba(11, 15, 25, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          overflow: 'hidden',
          p: 3,
        }}
      >
        {/* Glow Element */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: 'linear-gradient(90deg, #10b981, #06b6d4)',
        }} />

        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              {isMobile ? (
                <InstallMobileIcon sx={{ color: '#10b981', fontSize: 24 }} />
              ) : (
                <InstallDesktopIcon sx={{ color: '#10b981', fontSize: 24 }} />
              )}
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={900} sx={{ color: '#ffffff', lineHeight: 1.2 }}>
                {t('pwa.install_title') || 'Install Carbon Tracker'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {isMobile ? (t('pwa.mobile_sub') || 'Add to Home Screen for native experience') : (t('pwa.desktop_sub') || 'Install on your desktop')}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleDismiss} sx={{ color: 'text.secondary', '&:hover': { color: '#ffffff' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.5 }}>
          {t('pwa.description') || 'Monitor your footprint, log emissions offline, access chatbot conversations, and get instant reminders with our installable PWA.'}
        </Typography>

        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleDismiss}
            sx={{
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'text.primary',
              fontWeight: 800,
              borderRadius: 2.5,
              py: 1,
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.2)',
                bg: 'rgba(255,255,255,0.05)',
              }
            }}
          >
            {t('pwa.not_now') || 'Not Now'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleInstall}
            startIcon={<GetAppIcon />}
            sx={{
              bgcolor: '#10b981',
              color: '#ffffff',
              fontWeight: 900,
              borderRadius: 2.5,
              py: 1,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              '&:hover': {
                bgcolor: '#059669',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.6)',
              }
            }}
          >
            {t('pwa.install') || 'Install'}
          </Button>
        </Box>
      </Paper>
    </Slide>
  );
};

export default PWAInstallPrompt;
