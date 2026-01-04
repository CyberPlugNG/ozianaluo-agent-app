import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG, REQUEST_TIMEOUT } from '../config/api';

const client = axios.create({
  timeout: REQUEST_TIMEOUT,
});

// Add token to requests
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('agent_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Login with phone and password
  login: async (phone, password) => {
    try {
      const response = await client.post(API_CONFIG.LOGIN(), {
        phone,
        password,
      });
      if (response.data.token) {
        await AsyncStorage.setItem('agent_token', response.data.token);
        await AsyncStorage.setItem('agent', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Logout
  logout: async () => {
    try {
      await client.post(API_CONFIG.LOGOUT());
      await AsyncStorage.removeItem('agent_token');
      await AsyncStorage.removeItem('agent');
    } catch (error) {
      // Still remove token even if request fails
      await AsyncStorage.removeItem('agent_token');
      await AsyncStorage.removeItem('agent');
    }
  },

  // Send single location update
  updateLocation: async (bookingId, latitude, longitude, accuracy = 0) => {
    try {
      const response = await client.post(API_CONFIG.LOCATION(), {
        booking_id: bookingId,
        latitude,
        longitude,
        accuracy,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('Location update failed:', error);
      throw error;
    }
  },

  // Send batch location updates
  updateLocationBatch: async (bookingId, locations) => {
    try {
      const response = await client.post(API_CONFIG.LOCATION_BATCH(), {
        booking_id: bookingId,
        locations: locations.map(loc => ({
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy || 0,
          timestamp: new Date().toISOString(),
        })),
      });
      return response.data;
    } catch (error) {
      console.error('Batch location update failed:', error);
      throw error;
    }
  },

  // Get current delivery
  getCurrentDelivery: async () => {
    try {
      const response = await client.get(API_CONFIG.CURRENT_DELIVERY());
      return response.data;
    } catch (error) {
      console.error('Get current delivery failed:', error);
      return null;
    }
  },

  // Get stored token
  getToken: async () => {
    return await AsyncStorage.getItem('agent_token');
  },

  // Get stored agent info
  getAgent: async () => {
    const agent = await AsyncStorage.getItem('agent');
    return agent ? JSON.parse(agent) : null;
  },
};
