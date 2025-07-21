// services/ApiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = 'https://crmgcc.net/api/';

// ApiService now accepts an optional onTokenNull callback, called if token is null.
const ApiService = async (endpoint: string, method: string = 'GET', body: any = null, onTokenNull?: () => void) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');

    if (!token) {
      console.warn('No auth token found');
      if (onTokenNull) onTokenNull();
      return null;
    }

    let headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };

    // Only set Content-Type for non-FormData bodies
    if (!(body && typeof body === 'object' && body.constructor && body.constructor.name === 'FormData')) {
      headers['Content-Type'] = 'application/json';
    }

    const options: any = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = (body && typeof body === 'object' && body.constructor && body.constructor.name === 'FormData') ? body : JSON.stringify(body);
    }

    const response = await fetch(BASE_URL + endpoint, options);
    const json = await response.json();

    // If API returns token expired error, trigger logout
    if (json?.error && Array.isArray(json.error) && json.error[0]?.message === 'Token expired') {
      if (onTokenNull) onTokenNull();
      return null;
    }

    return json;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default ApiService;