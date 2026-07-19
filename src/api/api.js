import axios from 'axios';

// Base API instance pointing to local development server IP
const api = axios.create({
  baseURL: 'http://10.167.74.102:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

import AsyncStorage from '@react-native-async-storage/async-storage';

let userToken = '';

// Set this to true ONLY after you configure google-services.json and build the native app
export const USE_FIREBASE_AUTH = true;

// Helper to set token on login/load
export const setAuthToken = (token) => {
  userToken = token;
};

// Request interceptor to automatically attach authorization header
api.interceptors.request.use(
  async (config) => {
    let token = userToken;
    if (!token) {
      try {
        token = await AsyncStorage.getItem('token');
      } catch (e) {
        console.log('Error reading token from AsyncStorage:', e);
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Recursive mapper to add price: sellingPrice for any product-like objects in API responses
const mapPrices = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(mapPrices);
  }
  if (obj.sellingPrice !== undefined && obj.price === undefined) {
    obj.price = obj.sellingPrice;
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      obj[key] = mapPrices(obj[key]);
    }
  }
  return obj;
};

// Response interceptor to format incoming prices
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = mapPrices(response.data);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
