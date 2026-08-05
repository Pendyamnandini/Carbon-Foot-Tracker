import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode: mode,
    primary: {
      main: mode === 'dark' ? '#10b981' : '#059669', // Emerald Eco-Green
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'dark' ? '#06b6d4' : '#0891b2', // Cyan Flow
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#0b0f19' : '#f8fafc', // Deep Space Navy / Light Slate
      paper: mode === 'dark' ? '#111827' : '#ffffff',   // Slate Grey / Pure White
    },
    text: {
      primary: mode === 'dark' ? '#f3f4f6' : '#0f172a',  // Light Grey / Dark Slate
      secondary: mode === 'dark' ? '#9ca3af' : '#475569',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Manrope", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.25,
    },
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.015em',
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.35,
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    body1: {
      lineHeight: 1.6,
      letterSpacing: '-0.005em',
    },
    body2: {
      lineHeight: 1.6,
      letterSpacing: '-0.005em',
    },
    subtitle1: {
      fontWeight: 600,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: 12,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: mode === 'dark'
            ? 'radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.08) 0px, transparent 50%), radial-gradient(at 50% 0%, rgba(6, 182, 212, 0.08) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.08) 0px, transparent 50%)'
            : 'radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.04) 0px, transparent 50%), radial-gradient(at 50% 0%, rgba(6, 182, 212, 0.04) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.04) 0px, transparent 50%)',
          backgroundAttachment: 'fixed',
          transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'dark'
              ? '0 12px 20px -10px rgba(16, 185, 129, 0.4)'
              : '0 12px 20px -10px rgba(5, 150, 105, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: mode === 'dark' ? 'rgba(17, 24, 39, 0.55)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: 20,
          boxShadow: mode === 'dark' 
            ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
            : '0 10px 30px -10px rgba(148, 163, 184, 0.12)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'dark'
              ? '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 20px 1px rgba(16, 185, 129, 0.08)'
              : '0 20px 40px -15px rgba(148, 163, 184, 0.25), 0 0 20px 1px rgba(5, 150, 105, 0.05)',
            borderColor: mode === 'dark' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 150, 105, 0.2)',
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: mode === 'dark' ? 'rgba(17, 24, 39, 0.55)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: 20,
          boxShadow: mode === 'dark' 
            ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
            : '0 10px 30px -10px rgba(148, 163, 184, 0.12)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'dark' ? 'rgba(11, 15, 25, 0.65)' : 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(20px)',
          borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: 'none',
          color: mode === 'dark' ? '#f3f4f6' : '#0f172a',
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
            }
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        }
      }
    }
  },
});

export default getTheme;
