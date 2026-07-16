import React from 'react';
import { Drawer, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PersonIcon from '@mui/icons-material/Person';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const isOrg = user.role === 'ORG_ADMIN' || user.role === 'ORG_USER';

  const menuItems = [];

  if (isAdmin) {
    menuItems.push(
      { text: 'Admin Dashboard', icon: <AdminPanelSettingsIcon />, path: '/admin', color: '#10b981' },
      { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users', color: '#0ea5e9' },
      { text: 'Emission Factors', icon: <SettingsSuggestIcon />, path: '/admin/emission-factors', color: '#fbbf24' },
      { text: 'User Feedback', icon: <RateReviewIcon />, path: '/admin/feedbacks', color: '#f43f5e' },
      { text: 'Platform Reports', icon: <AssessmentIcon />, path: '/admin/reports', color: '#8b5cf6' }
    );
  } else {
    // User or Org User
    menuItems.push(
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', color: '#0ea5e9' },
      { text: 'Log Activities', icon: <AddCircleIcon />, path: '/activities/log', color: '#10b981' },
      { text: 'Goals Tracker', icon: <AssignmentIcon />, path: '/goals', color: '#8b5cf6' },
      { text: 'Insights & Tips', icon: <LightbulbIcon />, path: '/recommendations', color: '#fbbf24' },
      { text: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard', color: '#f43f5e' },
      { text: 'Profile Settings', icon: <PersonIcon />, path: '/profile', color: '#06b6d4' },
      { text: 'Submit Feedback', icon: <FeedbackIcon />, path: '/feedback', color: '#6366f1' }
    );

    if (isOrg) {
      menuItems.push({ text: 'Organization Info', icon: <BusinessIcon />, path: '/organization', color: '#14b8a6' });
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
                  borderLeft: active ? `4px solid ${item.color}` : '4px solid transparent',
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
                  primary={item.text} 
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

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
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
