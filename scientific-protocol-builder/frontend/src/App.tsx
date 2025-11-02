import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Layout from './components/common/Layout';
import ProtocolBuilder from './components/protocol/ProtocolBuilder';
import { CollaborativeProtocolBuilder } from './components/protocol/CollaborativeProtocolBuilder';
import ProtocolManager from './components/management/ProtocolManager';
import InstrumentManager from './components/instruments/InstrumentManager';
import { EnhancedInstrumentManager } from './components/instruments/EnhancedInstrumentManager';
import Dashboard from './components/common/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Providers
import { CollaborationProvider } from './components/collaboration/CollaborationProvider';

// Hooks and stores
import { useAuthStore } from './stores/authStore';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px'
        }}>
          🧪 Loading Scientific Protocol Builder...
        </div>
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          {isAuthenticated ? (
            <CollaborationProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/builder" element={<ProtocolBuilder />} />
                  <Route path="/builder/:protocolId" element={<CollaborativeProtocolBuilder protocolId={""} />} />
                  <Route path="/protocols" element={<ProtocolManager />} />
                  <Route path="/instruments" element={<EnhancedInstrumentManager />} />
                <Route path="/instruments-legacy" element={<InstrumentManager />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </Layout>
            </CollaborationProvider>
          ) : (
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Login />} />
            </Routes>
          )}
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;