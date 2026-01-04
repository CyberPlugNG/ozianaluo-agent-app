import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { BATCH_SIZE, LOCATION_UPDATE_INTERVAL } from '../config/api';
import { apiService } from './api';

const LOCATION_TASK_NAME = 'background-location-task';

let locationBuffer = [];
let currentBookingId = null;

// Define background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data;
    if (locations && locations.length > 0) {
      const location = locations[locations.length - 1];
      
      if (currentBookingId) {
        locationBuffer.push({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        });

        // Send batch when buffer reaches limit
        if (locationBuffer.length >= BATCH_SIZE) {
          await sendLocationBatch();
        }
      }
    }
  }
});

// Send location batch to server
const sendLocationBatch = async () => {
  if (locationBuffer.length === 0 || !currentBookingId) return;

  try {
    const buffer = [...locationBuffer];
    locationBuffer = [];
    
    await apiService.updateLocationBatch(currentBookingId, buffer);
    console.log(`Sent ${buffer.length} location updates`);
  } catch (error) {
    console.error('Failed to send location batch:', error);
    // Re-add to buffer for retry
    locationBuffer.unshift(...buffer);
  }
};

export const locationService = {
  // Request location permissions
  requestPermissions: async () => {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    return foregroundStatus === 'granted' && backgroundStatus === 'granted';
  },

  // Check if permissions are granted
  checkPermissions: async () => {
    const foreground = await Location.getForegroundPermissionsAsync();
    const background = await Location.getBackgroundPermissionsAsync();
    
    return foreground.granted && background.granted;
  },

  // Start location tracking for a booking
  startTracking: async (bookingId) => {
    try {
      const hasPermission = await locationService.checkPermissions();
      if (!hasPermission) {
        const granted = await locationService.requestPermissions();
        if (!granted) {
          throw new Error('Location permissions not granted');
        }
      }

      currentBookingId = bookingId;
      locationBuffer = [];

      // Start background location updates
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: LOCATION_UPDATE_INTERVAL,
        distanceInterval: 0, // Update regardless of distance
        pausesUpdatesAutomatically: false,
        foregroundService: {
          notificationTitle: 'Location Tracking',
          notificationBody: 'Tracking your delivery location',
          notificationColor: '#FF6B6B',
        },
      });

      console.log('Location tracking started for booking:', bookingId);
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      throw error;
    }
  },

  // Stop location tracking
  stopTracking: async () => {
    try {
      // Send any remaining locations
      if (locationBuffer.length > 0) {
        await sendLocationBatch();
      }

      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      currentBookingId = null;
      locationBuffer = [];
      
      console.log('Location tracking stopped');
      return true;
    } catch (error) {
      console.error('Failed to stop location tracking:', error);
      throw error;
    }
  },

  // Get current location
  getCurrentLocation: async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('Failed to get current location:', error);
      throw error;
    }
  },

  // Send location immediately (non-batched)
  sendLocationNow: async (bookingId, latitude, longitude, accuracy) => {
    try {
      await apiService.updateLocation(bookingId, latitude, longitude, accuracy);
      return true;
    } catch (error) {
      console.error('Failed to send location:', error);
      throw error;
    }
  },

  // Get task status
  isTracking: async () => {
    return await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  },
};
