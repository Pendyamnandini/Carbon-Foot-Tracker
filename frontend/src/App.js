import React, { useState, createContext, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Toolbar } from '@mui/material';
import getTheme from './theme';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar, { drawerWidth } from './components/Sidebar';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// User Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ActivityLogging from './pages/ActivityLogging';
import Goals from './pages/Goals';
import Recommendations from './pages/Recommendations';
import Leaderboard from './pages/Leaderboard';
import Feedback from './pages/Feedback';
import OrganizationDashboard from './pages/OrganizationDashboard';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import EmissionFactorManagement from './pages/EmissionFactorManagement';
import FeedbackManagement from './pages/FeedbackManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const AppContent = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Dynamic Glowing Blur Orbs */}
      <Box sx={{
        position: 'absolute',
        width: 350,
        height: 350,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.07) 0%, transparent 70%)',
        top: '15%',
        left: '25%',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <Box sx={{
        position: 'absolute',
        width: 450,
        height: 450,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.07) 0%, transparent 70%)',
        bottom: '15%',
        right: '15%',
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {user && <Navbar handleDrawerToggle={handleDrawerToggle} />}
      {user && <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: user ? { sm: `calc(100% - ${drawerWidth}px)` } : '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1
        }}
      >
        {user && <Toolbar />} {/* Spacing below Fixed App Bar */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
          <Route path="/verify-otp" element={user ? <Navigate to="/dashboard" replace /> : <OtpVerificationPage />} />
          <Route path="/reset-password" element={user ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />} />

          {/* Protected User Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['USER', 'ORG_ADMIN', 'ORG_USER']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['USER', 'ORG_ADMIN', 'ORG_USER']}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/activities/log" element={
            <ProtectedRoute allowedRoles={['USER', 'ORG_ADMIN', 'ORG_USER']}>
              <ActivityLogging />
            </ProtectedRoute>
          } />
          <Route path="/goals" element={
            <ProtectedRoute allowedRoles={['USER', 'ORG_ADMIN', 'ORG_USER']}>
              <Goals />
            </ProtectedRoute>
          } />
          <Route path="/recommendations" element={
            <ProtectedRoute allowedRoles={['USER', 'ORG_ADMIN', 'ORG_USER']}>
              <Recommendations />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute allowedRoles={['USER', 'ORG_ADMIN', 'ORG_USER']}>
              <Leaderboard />
            </ProtectedRoute>
          } />
          <Route path="/feedback" element={
            <ProtectedRoute allowedRoles={['USER', 'ORG_ADMIN', 'ORG_USER']}>
              <Feedback />
            </ProtectedRoute>
          } />
          <Route path="/organization" element={
            <ProtectedRoute allowedRoles={['USER', 'ORG_ADMIN', 'ORG_USER']}>
              <OrganizationDashboard />
            </ProtectedRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/emission-factors" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <EmissionFactorManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/feedbacks" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <FeedbackManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ReportsAnalytics />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

const App = () => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark';
  });

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => {
        const nextMode = prevMode === 'light' ? 'dark' : 'light';
        localStorage.setItem('themeMode', nextMode);
        return nextMode;
      });
    },
  }), []);

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
