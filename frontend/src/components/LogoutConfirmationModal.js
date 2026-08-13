import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
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
      PaperProps={{
        sx: {
          background: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2
        }
      }}
    >
      <DialogTitle id="alert-dialog-title" fontWeight={800}>
        {t('logout.confirmTitle', 'Are you sure you want to log out?')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" color="text.secondary">
          {t('logout.confirmMessage', 'You will need to sign back in to access your dashboard and activities.')}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          {t('logout.cancel', 'Cancel')}
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="error" autoFocus>
          {t('logout.confirm', 'Yes, Log Out')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutConfirmationModal;
