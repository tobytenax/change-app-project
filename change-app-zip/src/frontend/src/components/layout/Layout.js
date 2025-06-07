import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Snackbar, Alert } from '@mui/material';
import { loadUser } from '../../slices/authSlice';
import { removeAlert } from '../../slices/alertSlice';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const dispatch = useDispatch();
  const { alerts } = useSelector(state => state.alert);
  
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);
  
  const handleCloseAlert = (id) => {
    dispatch(removeAlert(id));
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
      <Footer />
      
      {alerts.map(alert => (
        <Snackbar
          key={alert.id}
          open={true}
          autoHideDuration={6000}
          onClose={() => handleCloseAlert(alert.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => handleCloseAlert(alert.id)} 
            severity={alert.type} 
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default Layout;
