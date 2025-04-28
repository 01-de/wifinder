import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Rating,
  Box,
  Typography,
  Alert,
} from '@mui/material';

const ReviewDialog = ({ open, onClose, wifiSpot }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      if (!rating) {
        throw new Error('Please provide a rating');
      }

      const review = {
        rating,
        comment,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email,
        createdAt: new Date(),
      };

      const wifiSpotRef = doc(db, 'wifiSpots', wifiSpot.id);
      
      // Add the review to the reviews array
      await updateDoc(wifiSpotRef, {
        reviews: arrayUnion(review),
      });

      // Update the average rating
      const newAvgRating = wifiSpot.reviews 
        ? ((wifiSpot.rating * wifiSpot.reviews.length) + rating) / (wifiSpot.reviews.length + 1)
        : rating;
      
      await updateDoc(wifiSpotRef, {
        rating: newAvgRating,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setRating(0);
        setComment('');
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Review Wi-Fi Network</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Review submitted successfully!</Alert>}

        <Box sx={{ mb: 2 }}>
          <Typography component="legend">Rating</Typography>
          <Rating
            name="rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            precision={0.5}
            size="large"
          />
        </Box>

        <TextField
          margin="dense"
          label="Comment"
          multiline
          rows={4}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this network..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDialog; 