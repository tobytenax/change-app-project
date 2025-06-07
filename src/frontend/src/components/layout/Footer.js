import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200]
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' Change App - Empowering Communities Through Direct Democracy'}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          <Link color="inherit" href="https://github.com/tobytenax/the-change-app" target="_blank">
            GitHub Repository
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
