import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" paragraph>
          The page you are looking for does not exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/dashboard"
          sx={{ mt: 2 }}
        >
          Return to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
