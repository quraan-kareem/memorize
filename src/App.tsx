import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import QuranMemorizer from './components/QuranMemorizer';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3498db',
    },
    secondary: {
      main: '#95a5a6',
    },
    background: {
      default: '#f0f4f8',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        root: {
          borderRadius: 15,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
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
