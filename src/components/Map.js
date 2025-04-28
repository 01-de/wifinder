/* global google */
import çReact, { useState, useEffect, useMemo, useCallback } from 'react';
import { GoogleMap, useLoadScript, DirectionsRenderer } from '@react-google-maps/api';
import { MarkerF as Marker, InfoWindowF as InfoWindow, MarkerClustererF as MarkerClusterer } from '@react-google-maps/api';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Box, Paper, Typography, Button, Rating, CircularProgress, Alert, Snackbar, ToggleButton, ToggleButtonGroup, IconButton } from '@mui/material';
import QRCode from 'qrcode.react';
import ReviewDialog from './ReviewDialog';
import MapLegend from './MapLegend';
import { useNavigate } from 'react-router-dom';
import AddWifiSpot from './AddWifiSpot';
import { Add as AddIcon, Navigation as NavigationIcon, DirectionsWalk, DirectionsCar, DirectionsBike, DirectionsTransit, Visibility, VisibilityOff } from '@mui/icons-material';
import { decryptPassword } from '../encryption';

// Move libraries array outside component
const libraries = ['places', 'directions'];

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 64px)',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

// Custom WiFi icon SVG paths
const wifiIconPath = {
  secured: "M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z",
  open: "M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"
};

const Map = ({ filters }) => {
  const [wifiSpots, setWifiSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [tempMarker, setTempMarker] = useState(null);
  const [addWifiOpen, setAddWifiOpen] = useState(false);
  const [directions, setDirections] = useState(null);
  const [directionsError, setDirectionsError] = useState(null);
  const [travelMode, setTravelMode] = useState('WALKING');
  const [showPassword, setShowPassword] = useState({});
  const navigate = useNavigate();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapOptions = useMemo(() => ({
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
    clickableIcons: false,
    maxZoom: 20,
    minZoom: 3,
  }), []);

  const onMapClick = useCallback((event) => {
    if (isAddingMode) {
      const clickedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      setTempMarker(clickedLocation);
      setAddWifiOpen(true);
    } else {
      setSelectedSpot(null);
    }
  }, [isAddingMode]);

  const toggleAddingMode = useCallback(() => {
    setIsAddingMode(prev => !prev);
    if (tempMarker) {
      setTempMarker(null);
    }
  }, []);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          fetchWifiSpots(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Could not get your location. Using default location.');
          fetchWifiSpots(defaultCenter);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Using default location.');
      fetchWifiSpots(defaultCenter);
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchWifiSpots(userLocation);
    }
  }, [filters]);

  const fetchWifiSpots = async (center) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching WiFi spots with center:', center);
      console.log('Current filters:', filters);

      let wifiQuery = collection(db, 'wifiSpots');
      let queryConstraints = [];

      if (filters) {
        if (filters.noPassword) {
          queryConstraints.push(where('hasPassword', '==', false));
        }
        if (filters.networkType && filters.networkType !== 'All') {
          queryConstraints.push(where('networkType', '==', filters.networkType));
        }
      }

      // Apply query constraints if any
      if (queryConstraints.length > 0) {
        wifiQuery = query(wifiQuery, ...queryConstraints);
      }

      const snapshot = await getDocs(wifiQuery);
      console.log('Fetched spots count:', snapshot.size);

      const spots = snapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure location data is properly formatted
        return {
          id: doc.id,
          ...data,
          location: {
            lat: Number(data.location.lat),
            lng: Number(data.location.lng)
          },
          hasPassword: Boolean(data.hasPassword),
          password: data.hasPassword ? decryptPassword(data.password) : '',
          rating: Number(data.rating || 0),
          reviews: Array.isArray(data.reviews) ? data.reviews : []
        };
      });

      console.log('Processed spots:', spots);

      let filteredSpots = spots;
      if (filters?.radius) {
        filteredSpots = spots.filter(spot => {
          if (!spot.location || typeof spot.location.lat !== 'number' || typeof spot.location.lng !== 'number') {
            console.warn('Invalid location data for spot:', spot);
            return false;
          }
          const distance = getDistance(
            center.lat,
            center.lng,
            spot.location.lat,
            spot.location.lng
          );
          return distance <= filters.radius;
        });
      }

      console.log('Final filtered spots:', filteredSpots);
      setWifiSpots(filteredSpots);
    } catch (error) {
      console.error('Error fetching WiFi spots:', error);
      setError('Error loading WiFi networks. Please try again later.');
    }
    setLoading(false);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const generateWifiQR = (ssid, password) => {
    const wifiString = `WIFI:S:${ssid};T:WPA;P:${password};;`;
    return wifiString;
  };

  // Update the AddWifiSpot component to refresh the map after adding a new spot
  const handleSpotAdded = useCallback(() => {
    console.log('Refreshing spots after new addition');
    fetchWifiSpots(userLocation || defaultCenter);
  }, [userLocation]);

  // Define TravelMode inside the component
  const TravelMode = useMemo(() => ({
    WALKING: window.google?.maps?.TravelMode?.WALKING || 'WALKING',
    DRIVING: window.google?.maps?.TravelMode?.DRIVING || 'DRIVING',
    BICYCLING: window.google?.maps?.TravelMode?.BICYCLING || 'BICYCLING',
    TRANSIT: window.google?.maps?.TravelMode?.TRANSIT || 'TRANSIT'
  }), []);

  // Update getDirections function
  const getDirections = useCallback(async (destination, mode) => {
    if (!userLocation) {
      setDirectionsError("Cannot get directions: Your location is not available");
      return;
    }

    if (!destination || !destination.lat || !destination.lng) {
      setDirectionsError("Invalid destination coordinates");
      return;
    }

    // Validate and set default travel mode
    const validModes = ['WALKING', 'DRIVING', 'BICYCLING', 'TRANSIT'];
    const selectedMode = validModes.includes(mode) ? mode : 'WALKING';

    const directionsService = new window.google.maps.DirectionsService();
    const destinationLatLng = new window.google.maps.LatLng(destination.lat, destination.lng);
    const originLatLng = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);

    try {
      const result = await directionsService.route({
        origin: originLatLng,
        destination: destinationLatLng,
        travelMode: TravelMode[selectedMode],
        optimizeWaypoints: true,
        provideRouteAlternatives: true,
      });

      if (result.status === "OK") {
        setDirections(result);
        setDirectionsError(null);
      } else {
        throw new Error("Directions request failed");
      }
    } catch (error) {
      console.error("Error getting directions:", error);
      setDirectionsError("Could not calculate directions. Please try again.");
      setDirections(null);
    }
  }, [userLocation, TravelMode]);

  // Add function to clear directions
  const clearDirections = useCallback(() => {
    setDirections(null);
    setDirectionsError(null);
  }, []);

  const handleTravelModeChange = useCallback((event, newMode) => {
    if (newMode !== null) {
      setTravelMode(newMode);
      if (selectedSpot) {
        getDirections(selectedSpot.location, newMode);
      }
    }
  }, [selectedSpot, getDirections]);

  if (loadError) return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Alert severity="error">
        Error loading Google Maps. Please check your internet connection and try again.
      </Alert>
    </Box>
  );

  if (!isLoaded) return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <CircularProgress />
    </Box>
  );

  const getWifiIcon = (hasPassword) => ({
    path: hasPassword ? wifiIconPath.secured : wifiIconPath.open,
    fillColor: hasPassword ? "#FF5722" : "#4CAF50",
    fillOpacity: 1,
    strokeWeight: 0,
    scale: 1.8,
    anchor: new google.maps.Point(12, 12)
  });

  const getUserLocationIcon = {
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    scale: 12,
    fillColor: "#4285F4",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
  };

  // Update the tempMarker icon
  const getTempMarkerIcon = () => ({
    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
    scale: 8,
    fillColor: "#1976D2",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
  });

  return (
    <>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={14}
        center={userLocation || defaultCenter}
        options={{
          ...mapOptions,
          cursor: isAddingMode ? 'crosshair' : 'default'
        }}
        onClick={onMapClick}
      >
        {userLocation && (
          <Marker
            position={userLocation}
            icon={getUserLocationIcon}
            zIndex={1000}
          />
        )}

        {wifiSpots.length > 0 ? (
          <MarkerClusterer>
            {(clusterer) => (
              <>
                {wifiSpots.map((spot) => {
                  if (!spot.location || typeof spot.location.lat !== 'number' || typeof spot.location.lng !== 'number') {
                    console.warn('Invalid spot data:', spot);
                    return null;
                  }
                  return (
                    <Marker
                      key={spot.id}
                      position={spot.location}
                      onClick={() => setSelectedSpot(spot)}
                      icon={getWifiIcon(spot.hasPassword)}
                      zIndex={900}
                      clusterer={clusterer}
                    />
                  );
                })}
              </>
            )}
          </MarkerClusterer>
        ) : !loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: 2,
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            <Typography>No WiFi networks found in this area</Typography>
          </Box>
        )}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true, // Hide default A/B markers
              polylineOptions: {
                strokeColor: "#1976D2",
                strokeWeight: 5,
                strokeOpacity: 0.8
              }
            }}
          />
        )}

        {selectedSpot && (
          <InfoWindow
              position={selectedSpot.location}
              onCloseClick={() => setSelectedSpot(null)}
          >
            <Box sx={{ p: 1, maxWidth: 300 }}>
              <Typography variant="h6" gutterBottom>
                {selectedSpot.ssid}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedSpot.networkType}
              </Typography>
              {selectedSpot.hasPassword && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      Password: {showPassword[selectedSpot.id] ? selectedSpot.password : '••••••••'}
                    </Typography>
                    <IconButton
                        size="small"
                        onClick={() => setShowPassword(prev => ({
                          ...prev,
                          [selectedSpot.id]: !prev[selectedSpot.id]
                        }))}
                    >
                      {showPassword[selectedSpot.id] ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={selectedSpot.rating} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({selectedSpot.reviews?.length || 0} reviews)
                </Typography>
              </Box>
              {selectedSpot.hasPassword && (
                  <Box sx={{ mb: 1 }}>
                  <QRCode
                    value={generateWifiQR(selectedSpot.ssid, selectedSpot.password)}
                    size={150}
                    level="H"
                    includeMargin={true}
                  />
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    variant="outlined"
                    onClick={() => setReviewDialogOpen(true)}
                >
                  Review
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<NavigationIcon />}
                    onClick={() => getDirections(selectedSpot.location)}
                >
                  Get Directions
                </Button>
              </Box>
            </Box>

          </InfoWindow>
        )}

        {tempMarker && (
          <Marker
            position={tempMarker}
            icon={getTempMarkerIcon()}
          />
        )}

        {isAddingMode && (
          <Box
            sx={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(25, 118, 210, 0.9)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Typography variant="body2">
              Click on the map to add a WiFi network
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={toggleAddingMode}
            >
              Cancel
            </Button>
          </Box>
        )}

        <Box
          sx={{
            position: 'absolute',
            bottom: '24px',
            right: '54px',
            zIndex: 1
          }}
        >
          <Button
            variant="contained"
            color={isAddingMode ? "secondary" : "primary"}
            startIcon={<AddIcon />}
            onClick={toggleAddingMode}
            sx={{
              borderRadius: '28px',
              boxShadow: 3
            }}
          >
            {isAddingMode ? 'Cancel Adding' : 'Add WiFi Network'}
          </Button>
        </Box>

        <MapLegend />

        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '16px',
            borderRadius: '8px',
          }}>
            <CircularProgress />
          </div>
        )}
      </GoogleMap>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {selectedSpot && (
        <ReviewDialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          wifiSpot={selectedSpot}
          onReviewSubmitted={() => {
            setReviewDialogOpen(false);
            fetchWifiSpots(userLocation || defaultCenter);
          }}
        />
      )}

      <AddWifiSpot
        open={addWifiOpen}
        onClose={() => {
          setAddWifiOpen(false);
          setTempMarker(null);
          setIsAddingMode(false);
        }}
        userLocation={tempMarker || userLocation}
        onSpotAdded={() => {
          handleSpotAdded();
          setTempMarker(null);
          setIsAddingMode(false);
        }}
      />
    </>
  );
};

export default Map; 