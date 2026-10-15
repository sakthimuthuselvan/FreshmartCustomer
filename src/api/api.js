import axios from 'axios';
import { NativeModules } from 'react-native';

// Dynamically resolve local development server IP from Metro bundle URL
export const getDevHostIp = () => {
  try {
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/http:\/\/([^:]+):/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (e) {
    // fallback
  }
  return 'localhost';
};

const initialIp = getDevHostIp();
const rawBaseUrl = process.env.API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || process.env.API_URL || `http://${initialIp}:3000`;
const BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
console.log('[API Config] Active server host URL:', BASE_URL);

// Base API instance
const api = axios.create({
  baseURL: BASE_URL,
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
    const activeIp = getDevHostIp();
    config.baseURL = `http://${activeIp}:3000/api`;
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

    // 🌐 Log outbound HTTP request
    console.log(`🌐 [NETWORK REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data ? config.data : '');

    return config;
  },
  (error) => {
    console.log(`❌ [NETWORK REQUEST ERROR]`, error);
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
    // ✅ Log incoming HTTP response
    console.log(`✅ [NETWORK RESPONSE ${response.status}] ${response.config.url}`, response.data);
    if (response.data) {
      response.data = mapPrices(response.data);
    }
    return response;
  },
  (error) => {
    console.log(`❌ [NETWORK ERROR ${error.response?.status || 'FAIL'}] ${error.config?.url}`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
