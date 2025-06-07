import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useDispatch } from 'react-redux';

// Layout Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/routing/PrivateRoute';

// Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import ProposalDetail from './pages/ProposalDetail';
import CreateProposal from './pages/CreateProposal';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Onboarding from './pages/Onboarding';

// Utils
import setAuthToken from './utils/setAuthToken';
import { initializeIntegration } from './utils/integrationUtils';

// Check for token in localStorage
if (localStorage.token) {
  setAuthToken(localStorage.token);
}

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    success: {
      main: '#2e7d32',
    },
    info: {
      main: '#0288d1',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

const App = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Initialize token and quiz integration
    initializeIntegration();
  }, [dispatch]);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/proposals" element={<PrivateRoute><Proposals /></PrivateRoute>} />
            <Route path="/proposals/:id" element={<PrivateRoute><ProposalDetail /></PrivateRoute>} />
            <Route path="/proposals/create" element={<PrivateRoute><CreateProposal /></PrivateRoute>} />
            <Route path="/proposals/:id/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
