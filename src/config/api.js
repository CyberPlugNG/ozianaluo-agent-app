// API Configuration
// Change the DOMAIN here to update the API endpoint

export const API_CONFIG = {
  // ⚙️ CHANGE THIS TO YOUR DOMAIN
  DOMAIN: 'https://ozianaluo.com',
  
  // API Endpoints
  BASE_URL: () => `${API_CONFIG.DOMAIN}/api`,
  LOGIN: () => `${API_CONFIG.BASE_URL()}/agent/login`,
  LOCATION: () => `${API_CONFIG.BASE_URL()}/agent/location`,
  LOCATION_BATCH: () => `${API_CONFIG.BASE_URL()}/agent/location-batch`,
  CURRENT_DELIVERY: () => `${API_CONFIG.BASE_URL()}/agent/current-delivery`,
  LOGOUT: () => `${API_CONFIG.BASE_URL()}/agent/logout`,
};

// Location Update Interval (in milliseconds)
export const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds

// Batch Size for location updates
export const BATCH_SIZE = 10;

// Request Timeout (in milliseconds)
export const REQUEST_TIMEOUT = 15000; // 15 seconds
