import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Slider,
  Typography,
  Box,
} from '@mui/material';

const networkTypes = ['All', 'Café', 'Restaurant', 'Public', 'Hotel', 'Library', 'Other'];

const FilterDialog = ({ open, onClose, onSubmit, currentFilters }) => {
  const [filters, setFilters] = useState({
    noPassword: false,
    networkType: 'All',
    radius: 1, // in kilometers
    ...currentFilters,
  });

  useEffect(() => {
    if (currentFilters) {
      setFilters(prev => ({
        ...prev,
        ...currentFilters,
      }));
    }
  }, [currentFilters]);

  const handleChange = (name) => (event) => {
    setFilters(prev => ({
      ...prev,
      [name]: event.target.value,
    }));
  };

  const handleSwitchChange = (name) => (event) => {
    setFilters(prev => ({
      ...prev,
      [name]: event.target.checked,
    }));
  };

  const handleSubmit = () => {
    onSubmit(filters);
  };

  const handleReset = () => {
    setFilters({
      noPassword: false,
      networkType: 'All',
      radius: 1,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filter Wi-Fi Networks</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={filters.noPassword}
                onChange={handleSwitchChange('noPassword')}
              />
            }
            label="Show only networks without password"
          />
        </Box>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Network Type</InputLabel>
          <Select
            value={filters.networkType}
            onChange={handleChange('networkType')}
            label="Network Type"
          >
            {networkTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 4 }}>
          <Typography gutterBottom>
            Search Radius (km)
          </Typography>
          <Slider
            value={filters.radius}
            onChange={(event, newValue) => {
              setFilters(prev => ({
                ...prev,
                radius: newValue,
              }));
            }}
            min={0.1}
            max={5}
            step={0.1}
            marks={[
              { value: 0.1, label: '0.1' },
              { value: 1, label: '1' },
              { value: 2.5, label: '2.5' },
              { value: 5, label: '5' },
            ]}
            valueLabelDisplay="auto"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="inherit">
          Reset
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog; 