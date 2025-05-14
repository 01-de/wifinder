import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const MapLegend = () => {
  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 80,
        left: 16,
        p: 2,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 2,
      }}
    >
      <Typography variant="subtitle2" gutterBottom>
        WiFi Networks
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#ffffff">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
          </svg>
        </div>
        <Typography variant="body2">Open Network</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: '#FF5722',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#ffffff">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
          </svg>
        </div>
        <Typography variant="body2">Secured Network</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: '#4285F4',
        }} />
        <Typography variant="body2">Your Location</Typography>
      </Box>
    </Paper>
  );
};

export default MapLegend; 