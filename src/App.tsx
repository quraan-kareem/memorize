import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import QuranMemorizer from './components/QuranMemorizer';

const theme = createTheme({
  palette: {
    primary: {
      light: '#64b5f6',
      main: '#3498db',
      dark: '#1976d2',
      contrastText: '#fff',
    },
    secondary: {
      light: '#b0bec5',
      main: '#95a5a6',
      dark: '#607d8b',
      contrastText: '#fff',
    },
    success: {
      light: '#81c784',
      main: '#4caf50',
      dark: '#2e7d32',
      contrastText: '#fff',
    },
    error: {
      light: '#e57373',
      main: '#e74c3c',
      dark: '#c0392b',
      contrastText: '#fff',
    },
    background: {
      default: '#f0f4f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#5f7286',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '6px 16px',
          boxShadow: '0 3px 5px rgba(0,0,0,0.08)',
          '&:hover': {
            boxShadow: '0 6px 10px rgba(0,0,0,0.12)',
          },
        },
        contained: {
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QuranMemorizer />
    </ThemeProvider>
  );
}

export default App;
