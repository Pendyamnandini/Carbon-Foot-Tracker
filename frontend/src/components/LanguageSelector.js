import React, { useState, useMemo } from 'react';
import { Button, Menu, TextField, Box, InputAdornment, Typography, List, ListItemButton, ListItemText } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../locales/languages';

export const LanguageSelector = ({ size = 'small', color = 'inherit' }) => {
  const { lang, changeLanguage } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setSearchQuery('');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectLanguage = (code) => {
    changeLanguage(code);
    handleClose();
  };

  // Find currently selected language
  const currentLang = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === lang) || { label: 'English', native: 'English' };
  }, [lang]);

  // Sort and filter languages based on search input
  const filteredLanguages = useMemo(() => {
    const sorted = [...SUPPORTED_LANGUAGES].sort((a, b) => a.label.localeCompare(b.label));
    if (!searchQuery) return sorted;
    const query = searchQuery.toLowerCase().trim();
    return sorted.filter(
      (l) =>
        l.label.toLowerCase().includes(query) ||
        l.native.toLowerCase().includes(query) ||
        l.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <Box>
      <Button
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        color="inherit"
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          color: color === 'inherit' ? 'text.primary' : color,
          '&:hover': {
            background: 'rgba(255,255,255,0.05)',
          }
        }}
      >
        {currentLang.native}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        autoFocus={false}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            borderRadius: 3,
            mt: 1,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {/* Search Input Box */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Search language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                fontSize: '0.875rem'
              }
            }}
          />
        </Box>

        {/* Scrollable Language List */}
        <List sx={{ overflowY: 'auto', maxHeight: 280, py: 1, bgcolor: 'background.paper' }}>
          {filteredLanguages.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No languages found
              </Typography>
            </Box>
          ) : (
            filteredLanguages.map((item) => (
              <ListItemButton
                key={item.code}
                selected={item.code === lang}
                onClick={() => handleSelectLanguage(item.code)}
                sx={{
                  py: 1,
                  px: 2.5,
                  transition: 'all 0.15s ease',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    fontWeight: 700,
                    '&:hover': {
                      bgcolor: 'rgba(16, 185, 129, 0.25)',
                    }
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={item.code === lang ? 700 : 500} sx={{ color: 'text.primary' }}>
                        {item.native}
                      </Typography>
                      {item.native !== item.label && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                          {item.label}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
