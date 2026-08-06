import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Button, Menu, TextField, Box, InputAdornment, Typography, 
  List, ListItemButton, ListItemText, IconButton, Divider 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LanguageIcon from '@mui/icons-material/Language';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useTranslation } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../locales/languages';

const getFlagEmoji = (code) => {
  const flagMap = {
    en: '🇺🇸', hi: '🇮🇳', te: '🇮🇳', ta: '🇮🇳', kn: '🇮🇳', ml: '🇮🇳', mr: '🇮🇳', gu: '🇮🇳', pa: '🇮🇳', bn: '🇧🇩', ur: '🇵🇰', or: '🇮🇳', as: '🇮🇳',
    es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', it: '🇮🇹', pt: '🇵🇹', nl: '🇳🇱', ru: '🇷🇺', tr: '🇹🇷', ar: '🇸🇦', he: '🇮🇱', fa: '🇮🇷', zh_CN: '🇨🇳', zh_TW: '🇹🇼',
    ja: '🇯🇵', ko: '🇰🇷', th: '🇹🇭', vi: '🇻🇳', id: '🇮🇩', ms: '🇲🇾', fil: '🇵🇭', sv: '🇸🇪', no: '🇳🇴', da: '🇩🇰', fi: '🇫🇮', pl: '🇵🇱',
    el: '🇬🇷', ro: '🇷🇴', hu: '🇭🇺', cs: '🇨🇿', sk: '🇸🇰', uk: '🇺🇦', bg: '🇧🇬', hr: '🇭🇷', lt: '🇱🇹', lv: '🇱🇻', et: '🇪🇪', sl: '🇸🇮',
    sr: '🇷🇸', mk: '🇲🇰', sq: '🇦🇱', bs: '🇧🇦', hy: '🇦🇲', ka: '🇬🇪', az: '🇦🇿', be: '🇧🇾', kk: '🇰🇿', ky: '🇰🇬', tg: '🇹🇯', tk: '🇹🇲',
    uz: '🇺🇿', mn: '🇲🇳', bo: '🇨🇳', ne: '🇳🇵', si: '🇱🇰', my: '🇲🇲', km: '🇰🇭', lo: '🇱🇦', am: '🇪🇹', ti: '🇪🇹', sw: '🇰🇪', yo: '🇳🇬',
    ig: '🇳🇬', ha: '🇳🇬', zu: '🇿🇦', xh: '🇿🇦', af: '🇿🇦'
  };
  return flagMap[code] || flagMap[code.split('_')[0]] || '🌐';
};

export const LanguageSelector = ({ size = 'small', color = 'inherit' }) => {
  const { lang, changeLanguage, t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const listRef = useRef(null);

  const open = Boolean(anchorEl);

  // Load Favorites and Recents from localStorage
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('fav_langs');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedRecents = localStorage.getItem('recent_langs');
      if (savedRecents) setRecents(JSON.parse(savedRecents));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setSearchQuery('');
    setFocusedIndex(-1);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectLanguage = (code) => {
    changeLanguage(code);
    
    // Add to recents
    let updatedRecents = [code, ...recents.filter(r => r !== code)];
    if (updatedRecents.length > 5) {
      updatedRecents = updatedRecents.slice(0, 5);
    }
    setRecents(updatedRecents);
    localStorage.setItem('recent_langs', JSON.stringify(updatedRecents));

    handleClose();
  };

  const toggleFavorite = (e, code) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(code)) {
      updated = favorites.filter(f => f !== code);
    } else {
      updated = [...favorites, code];
    }
    setFavorites(updated);
    localStorage.setItem('fav_langs', JSON.stringify(updated));
  };

  // Find currently selected language
  const currentLang = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === lang) || { label: 'English', native: 'English', code: 'en' };
  }, [lang]);

  // Sorted list of all supported languages
  const sortedAllLanguages = useMemo(() => {
    return [...SUPPORTED_LANGUAGES].sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  // Filter languages based on search input
  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return sortedAllLanguages;
    const query = searchQuery.toLowerCase().trim();
    return sortedAllLanguages.filter(
      (l) =>
        l.label.toLowerCase().includes(query) ||
        l.native.toLowerCase().includes(query) ||
        l.code.toLowerCase().includes(query)
    );
  }, [searchQuery, sortedAllLanguages]);

  // Group languages for view (when no search query)
  const groupedLanguages = useMemo(() => {
    if (searchQuery) return { filtered: filteredLanguages };

    const favLangsList = sortedAllLanguages.filter(l => favorites.includes(l.code));
    const recentLangsList = sortedAllLanguages.filter(l => recents.includes(l.code));

    return {
      recents: recentLangsList,
      favorites: favLangsList,
      all: sortedAllLanguages
    };
  }, [searchQuery, filteredLanguages, favorites, recents, sortedAllLanguages]);

  // Flattened items list for keyboard navigation
  const flatItemsList = useMemo(() => {
    if (searchQuery) return filteredLanguages;
    
    // Flatten recents, favorites, and all into a single list
    const items = [];
    if (groupedLanguages.recents.length > 0) {
      items.push(...groupedLanguages.recents.map(l => ({ ...l, group: 'recents' })));
    }
    if (groupedLanguages.favorites.length > 0) {
      items.push(...groupedLanguages.favorites.map(l => ({ ...l, group: 'favorites' })));
    }
    items.push(...groupedLanguages.all.map(l => ({ ...l, group: 'all' })));
    return items;
  }, [searchQuery, filteredLanguages, groupedLanguages]);

  // Keyboard navigation handler
  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev + 1) % flatItemsList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev - 1 + flatItemsList.length) % flatItemsList.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < flatItemsList.length) {
        handleSelectLanguage(flatItemsList[focusedIndex].code);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    }
  };

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${focusedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  const renderLanguageItem = (item, index, keySuffix = '') => {
    const isSelected = item.code === lang;
    const isFav = favorites.includes(item.code);
    const isFocused = index === focusedIndex;

    return (
      <ListItemButton
        key={`${item.code}-${keySuffix}`}
        data-index={index}
        selected={isSelected}
        onClick={() => handleSelectLanguage(item.code)}
        sx={{
          py: 0.75,
          px: 2,
          mx: 1,
          borderRadius: 2,
          mb: 0.5,
          border: isFocused 
            ? (isDark ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid #059669') 
            : (isSelected ? (isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(5, 150, 105, 0.3)') : '1px solid transparent'),
          bgcolor: isFocused 
            ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(5, 150, 105, 0.08)') 
            : 'transparent',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.1)',
            color: isDark ? '#10b981' : '#047857',
            '&:hover': {
              bgcolor: isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(5, 150, 105, 0.18)',
            }
          },
          '&:hover': {
            bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
            transform: 'translateX(4px)'
          }
        }}
      >
        <Typography variant="body1" sx={{ mr: 1.5, fontSize: '1.25rem' }}>
          {getFlagEmoji(item.code)}
        </Typography>
        <ListItemText
          primary={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography 
                variant="body2" 
                fontWeight={isSelected ? 700 : 500} 
                sx={{ color: isSelected ? (isDark ? '#10b981' : '#047857') : (isDark ? '#ffffff' : '#0f172a') }}
              >
                {item.native}
              </Typography>
              {item.native !== item.label && (
                <Typography 
                  variant="caption" 
                  sx={{ color: isSelected ? (isDark ? 'rgba(16, 185, 129, 0.8)' : '#059669') : (isDark ? 'rgba(255,255,255,0.5)' : '#475569'), ml: 1 }}
                >
                  {item.label}
                </Typography>
              )}
            </Box>
          }
        />
        <IconButton 
          size="small" 
          onClick={(e) => toggleFavorite(e, item.code)}
          sx={{ 
            ml: 1, 
            color: isFav ? '#f59e0b' : (isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'),
            '&:hover': { color: '#f59e0b' }
          }}
        >
          {isFav ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
        </IconButton>
      </ListItemButton>
    );
  };

  return (
    <Box onKeyDown={handleKeyDown}>
      <Button
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        color="inherit"
        sx={{
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.85rem',
          borderRadius: 2.5,
          px: 2,
          py: 0.75,
          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(5, 150, 105, 0.3)',
          color: color === 'inherit' ? (isDark ? '#ffffff' : '#0f172a') : color,
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(5, 150, 105, 0.08)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.16)',
            borderColor: isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(5, 150, 105, 0.5)',
            color: color === 'inherit' ? (isDark ? '#ffffff' : '#047857') : color,
            transform: 'translateY(-1px)'
          }
        }}
      >
        <span style={{ marginRight: 6 }}>{getFlagEmoji(currentLang.code)}</span>
        {currentLang.native}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        autoFocus={false}
        disableScrollLock={true}
        sx={{ 
          zIndex: 9999, // Super high z-index to avoid clipping
        }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              width: 340,
              maxHeight: 480,
              borderRadius: 4,
              mt: 1.5,
              boxShadow: isDark 
                ? '0 20px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)' 
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1',
              background: isDark ? '#0f172a' : '#ffffff',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9999
            }
          }
        }}
      >
        {/* Search Input Box */}
        <Box sx={{ p: 2, borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', background: isDark ? 'transparent' : '#f8fafc' }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder={t('common.search') || "Search language..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFocusedIndex(-1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b', fontSize: 18 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2.5,
                fontSize: '0.85rem',
                color: isDark ? '#ffffff' : '#0f172a',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                '& fieldset': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
                },
                '&:hover fieldset': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : '#94a3b8',
                },
                '&.Mui-focused fieldset': {
                  borderColor: isDark ? '#10b981' : '#059669',
                }
              }
            }}
          />
        </Box>

        {/* Scrollable Language List */}
        <List ref={listRef} sx={{ overflowY: 'auto', flex: 1, py: 1, maxHeight: 380 }}>
          {searchQuery ? (
            filteredLanguages.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color={isDark ? "rgba(255,255,255,0.5)" : "#64748b"}>
                  No languages found
                </Typography>
              </Box>
            ) : (
              filteredLanguages.map((item, idx) => renderLanguageItem(item, idx, 'search'))
            )
          ) : (
            <>
              {/* Recents Section */}
              {groupedLanguages.recents.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ px: 2.5, py: 1, display: 'block', color: isDark ? '#10b981' : '#047857', fontWeight: 700, letterSpacing: 1.2 }}>
                    RECENT LANGUAGES
                  </Typography>
                  {groupedLanguages.recents.map((item, idx) => renderLanguageItem(item, idx, 'recent'))}
                  <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }} />
                </>
              )}

              {/* Favorites Section */}
              {groupedLanguages.favorites.length > 0 && (
                <>
                  <Typography variant="caption" sx={{ px: 2.5, py: 1, display: 'block', color: isDark ? '#fbbf24' : '#d97706', fontWeight: 700, letterSpacing: 1.2 }}>
                    FAVORITE LANGUAGES
                  </Typography>
                  {groupedLanguages.favorites.map((item, idx) => {
                    const offsetIndex = groupedLanguages.recents.length + idx;
                    return renderLanguageItem(item, offsetIndex, 'fav');
                  })}
                  <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }} />
                </>
              )}

              {/* All Languages Section */}
              <Typography variant="caption" sx={{ px: 2.5, py: 1, display: 'block', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b', fontWeight: 700, letterSpacing: 1.2 }}>
                ALL LANGUAGES
              </Typography>
              {groupedLanguages.all.map((item, idx) => {
                const offsetIndex = groupedLanguages.recents.length + groupedLanguages.favorites.length + idx;
                return renderLanguageItem(item, offsetIndex, 'all');
              })}
            </>
          )}
        </List>
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
