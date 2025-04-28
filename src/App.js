import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  AccountCircle,
  Logout as LogoutIcon,
} from '@mui/icons-material';

import Login from './components/Login';
import Map from './components/Map';
import AddWifiSpot from './components/AddWifiSpot';
import ReviewDialog from './components/ReviewDialog';
import FilterDialog from './components/FilterDialog';



const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addWifiOpen, setAddWifiOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Error getting location:', error)
      );
    }

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFilterSubmit = (newFilters) => {
    setFilters(newFilters);
    setFilterOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem button onClick={() => setAddWifiOpen(true)}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Add Wi-Fi Network" />
        </ListItem>
        <ListItem button onClick={() => setFilterOpen(true)}>
          <ListItemIcon>
            <FilterIcon />
          </ListItemIcon>
          <ListItemText primary="Filter Networks" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            {user && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              WiFinder
            </Typography>
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton color="inherit">
                  <AccountCircle />
                </IconButton>
                <Typography variant="body1" sx={{ ml: 1 }}>
                  {user.displayName || user.email}
                </Typography>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          {drawer}
        </Drawer>

        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <>
                  <Map filters={filters} />
                  <AddWifiSpot
                    open={addWifiOpen}
                    onClose={() => setAddWifiOpen(false)}
                    userLocation={userLocation}
                  />
                  <FilterDialog
                    open={filterOpen}
                    onClose={() => setFilterOpen(false)}
                    onSubmit={handleFilterSubmit}
                    currentFilters={filters}
                  />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/"
            element={<Navigate to={user ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
