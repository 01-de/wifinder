import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          {isSignUp ? 'Sign Up for WiFinder' : 'Sign In to WiFinder'}
        </Typography>

        <Button
          fullWidth
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          sx={{ mt: 3, mb: 2 }}
        >
          Continue with Google
        </Button>

        <Divider sx={{ width: '100%', mb: 2 }}>OR</Divider>

        <Box component="form" onSubmit={handleEmailAuth} sx={{ mt: 1, width: '100%' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 