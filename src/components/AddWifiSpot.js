import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Box,
  Typography
} from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { encryptPassword } from '../encryption';


// Define network types array
const networkTypes = ['Café', 'Restaurant', 'Public', 'Hotel', 'Library', 'Other'];

const AddWifiSpot = ({ open, onClose, userLocation, onSpotAdded }) => {
  const [formData, setFormData] = useState({
    ssid: '',
    password: '',
    networkType: 'Public', // Set default to Public
    hasPassword: true,
    location: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userLocation) {
      setFormData(prev => ({
        ...prev,
        location: {
          lat: Number(userLocation.lat),
          lng: Number(userLocation.lng)
        }
      }));
    }
  }, [userLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordToggle = (e) => {
    const hasPassword = e.target.checked;
    setFormData(prev => ({
      ...prev,
      hasPassword,
      password: hasPassword ? prev.password : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.ssid.trim()) {
        throw new Error('Network name (SSID) is required');
      }

      if (formData.hasPassword && !formData.password.trim()) {
        throw new Error('Password is required for secured networks');
      }

      if (!formData.location || !formData.location.lat || !formData.location.lng) {
        throw new Error('Location is required');
      }

      if (!auth.currentUser) {
        throw new Error('You must be logged in to add a network');
      }

      // Prepare data for submission
      const wifiSpotData = {
        ssid: formData.ssid.trim(),
        password: formData.hasPassword ? encryptPassword(formData.password.trim()) : '',
        networkType: formData.networkType,
        hasPassword: formData.hasPassword,
        location: {
          lat: Number(formData.location.lat),
          lng: Number(formData.location.lng)
        },
        createdAt: new Date(),
        rating: 0,
        reviews: [],
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email
      };

      // Add to Firestore
      await addDoc(collection(db, 'wifiSpots'), wifiSpotData);
      console.log('New WiFi spot added successfully');

      // Reset form and close dialog
      setFormData({
        ssid: '',
        password: '',
        networkType: 'Public',
        hasPassword: true,
        location: null
      });

      if (onSpotAdded) {
        onSpotAdded();
      }
      onClose();
    } catch (error) {
      console.error('Error adding WiFi spot:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New WiFi Network</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            name="ssid"
            label="Network Name (SSID)"
            type="text"
            fullWidth
            value={formData.ssid}
            onChange={handleChange}
            required
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.hasPassword}
                onChange={handlePasswordToggle}
                color="primary"
              />
            }
            label="Password Protected"
            sx={{ my: 1 }}
          />

          {formData.hasPassword && (
            <TextField
              margin="dense"
              name="password"
              label="Password"
              type="text"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              required={formData.hasPassword}
            />
          )}

          <FormControl fullWidth margin="dense">
            <InputLabel>Location Type</InputLabel>
            <Select
              name="networkType"
              value={formData.networkType}
              onChange={handleChange}
              label="Location Type"
            >
              {networkTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {userLocation && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Network'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddWifiSpot;