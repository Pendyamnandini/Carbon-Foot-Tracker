import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Box, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoutConfirmationModal = ({ open, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleConfirm = async () => {
    const isOrgAdmin = user?.role === 'ORG_ADMIN';
    onClose();
    await logout();
    if (isOrgAdmin) {
      navigate('/organization/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px', // Extra curvy edges for the modal
          p: 2,
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box sx={{ display: 'flex', p: 1.2, borderRadius: '50%', bgcolor: 'error.light', color: 'error.main', backgroundColor: 'rgba(211, 47, 47, 0.1)' }}>
          <WarningAmberIcon />
        </Box>
        <Typography variant="h6" fontWeight={700}>
          {t('logout.confirmTitle', 'Confirm Logout')}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" sx={{ mt: 1, color: 'text.secondary', fontSize: '1rem', lineHeight: 1.5 }}>
          {t('logout.confirmMessage', 'Are you sure you want to log out? You will need to sign back in to access your dashboard.')}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1.5, justifyContent: 'center' }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          color="inherit" 
          sx={{ borderRadius: '20px', textTransform: 'none', px: 4, py: 1, fontWeight: 600 }}
        >
          {t('logout.cancel', 'Cancel')}
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="error" 
          autoFocus
          disableElevation
          sx={{ borderRadius: '20px', textTransform: 'none', px: 4, py: 1, fontWeight: 600 }}
        >
          {t('logout.confirm', 'Log Out')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutConfirmationModal;
