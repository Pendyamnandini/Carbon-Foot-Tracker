import React, { useState, useEffect, useContext } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Menu, MenuItem, Box, Tooltip, Avatar, List, ListItem, ListItemText, Popover, Divider, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../App';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Navbar = ({ handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter((n) => !n.isRead).length);
      }
    } catch (e) {
      // Ignore background errors
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleOpenNotifMenu = (event) => setAnchorElNotif(event.currentTarget);
  const handleCloseNotifMenu = () => setAnchorElNotif(null);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (e) {
      // Ignore
    }
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    navigate('/profile');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 800, letterSpacing: 0.5 }}
          onClick={() => navigate('/')}
        >
          <Box component="span" sx={{ color: 'primary.main', mr: 1 }}>♻</Box>
          Carbon<Box component="span" sx={{ color: 'secondary.main', fontWeight: 300 }}>Tracker</Box>
        </Typography>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <Tooltip title={theme.palette.mode === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
                {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <IconButton color="inherit" onClick={handleOpenNotifMenu}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <Popover
              open={Boolean(anchorElNotif)}
              anchorEl={anchorElNotif}
              onClose={handleCloseNotifMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: { width: 320, maxHeight: 400, background: theme.palette.background.paper, border: '1px solid ' + theme.palette.divider }
              }}
            >
              <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
                {unreadCount > 0 && <Typography variant="caption" color="primary">{unreadCount} new</Typography>}
              </Box>
              <Divider />
              <List sx={{ p: 0 }}>
                {notifications.length === 0 ? (
                  <ListItem><ListItemText primary="No new notifications" /></ListItem>
                ) : (
                  notifications.map((notif) => (
                    <ListItem 
                      key={notif.id} 
                      onClick={() => handleMarkAsRead(notif.id)}
                      button
                      sx={{ background: notif.isRead ? 'transparent' : (theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.15)'), borderBottom: '1px solid ' + theme.palette.divider }}
                    >
                      <ListItemText
                        primary={notif.title}
                        secondary={notif.message}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: notif.isRead ? 400 : 700 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Popover>

            {/* Profile Dropdown */}
            <Tooltip title="User Account">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                  {user.fullName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              PaperProps={{
                sx: { background: theme.palette.background.paper, border: '1px solid ' + theme.palette.divider }
              }}
            >
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>{user.fullName}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                  <Typography variant="caption" display="block" color="primary.main">{user.role}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfile}>
                <AccountCircleIcon sx={{ mr: 1, fontSize: 20 }} /> Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
