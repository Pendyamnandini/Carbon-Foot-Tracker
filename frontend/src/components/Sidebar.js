import React from 'react';
import { Drawer, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PersonIcon from '@mui/icons-material/Person';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SpeedIcon from '@mui/icons-material/Speed';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const theme = useTheme();

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isOrg = user.role === 'ORG_ADMIN' || user.role === 'ORG_USER';

  const menuItems = [];

  if (isAdmin) {
    menuItems.push(
      { text: 'Admin Dashboard', icon: <AdminPanelSettingsIcon />, path: '/admin', color: '#10b981' },
      { text: 'User Analytics', icon: <PeopleIcon />, path: '/admin/users', color: '#0ea5e9' },
      { text: 'Platform Analytics', icon: <AssessmentIcon />, path: '/admin/reports', color: '#8b5cf6' },
      { text: 'Emission Factors', icon: <SettingsSuggestIcon />, path: '/admin/emission-factors', color: '#fbbf24' },
      { text: 'Feedback Management', icon: <RateReviewIcon />, path: '/admin/feedbacks', color: '#f43f5e' },
      { text: 'Support Management', icon: <HelpIcon />, path: '/admin/support', color: '#10b981' },
      { text: 'Organization Analytics', icon: <BusinessIcon />, path: '/organization', color: '#14b8a6' }
    );
  } else {
    // User or Org User
    menuItems.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', color: '#0ea5e9' },
      { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics', color: '#10b981' },
      { text: 'Activity Logs', icon: <AddCircleIcon />, path: '/activities/log', color: '#3b82f6' },
      { text: 'Goals', icon: <AssignmentIcon />, path: '/goals', color: '#8b5cf6' },
      { text: 'Recommendations', icon: <LightbulbIcon />, path: '/recommendations', color: '#fbbf24' },
      { text: 'Sustainability Score', icon: <SpeedIcon />, path: '/analytics?tab=score', color: '#ec4899' },
      { text: 'Benchmarking', icon: <EqualizerIcon />, path: '/analytics?tab=benchmarking', color: '#14b8a6' },
      { text: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard', color: '#f43f5e' },
      { text: 'Reports', icon: <HistoryIcon />, path: '/analytics?tab=exports', color: '#6366f1' },
      { text: 'Profile', icon: <PersonIcon />, path: '/profile', color: '#06b6d4' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/profile?tab=settings', color: '#64748b' },
      { text: 'Support', icon: <HelpIcon />, path: '/support', color: '#10b981' }
    );

    if (isOrg) {
      menuItems.push({ text: 'Organization Analytics', icon: <BusinessIcon />, path: '/organization', color: '#14b8a6' });
    } else {
      menuItems.push({ text: 'Join/Create Org', icon: <BusinessIcon />, path: '/organization', color: '#14b8a6' });
    }
  }

  const drawerContent = (
    <Box sx={{ height: '100%', background: 'background.default', color: 'text.primary' }}>
      <Toolbar />
      <Divider sx={{ borderColor: 'divider' }} />
      <List>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                onClick={() => {
                  navigate(item.path);
                  if (mobileOpen) handleDrawerToggle();
                }}
                sx={{
                  py: 1.5,
                  px: 3,
                  background: active ? `${item.color}14` : 'transparent',
                  borderInlineStart: active ? `4px solid ${item.color}` : '4px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'action.hover',
                    '& .MuiListItemIcon-root': {
                      transform: 'scale(1.1)',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: item.color, minWidth: 40, opacity: active ? 1 : 0.75, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={t('nav.' + item.text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))} 
                  primaryTypographyProps={{ 
                    variant: 'body2', 
                    fontWeight: active ? 800 : 500,
                    color: active ? 'text.primary' : 'text.secondary',
                    transition: 'all 0.2s'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const isRTL = theme.direction === 'rtl';

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor={isRTL ? 'right' : 'left'}
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            borderInlineEnd: '1px solid', 
            borderColor: 'divider' 
          },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        anchor={isRTL ? 'right' : 'left'}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            borderInlineEnd: '1px solid', 
            borderColor: 'divider' 
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
export { drawerWidth };
