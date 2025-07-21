// services/ApiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = 'https://crmgcc.net/api/';

// ApiService now accepts an optional onTokenNull callback, called if token is null.
const ApiService = async (endpoint: string, method: string = 'GET', body: any = null, onTokenNull?: () => void) => {
  console.log('ApiService called:', endpoint);
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
    const text = await response.text();
    console.log('Raw API response:', text);
    console.log('Raw API response dddd:', JSON.parse(text));
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', e, text);
      throw e;
    }
    console.log('API Response:', json);
    // If API returns token expired error, trigger logout
    if (
      json?.error &&
      Array.isArray(json.error) &&
      (json.error[0]?.message === 'Token expired' || json.error[0]?.message === 'Invalid token')
    ) {
      console.log('Token error detected:', json.error[0]?.message);
      if (onTokenNull) onTokenNull();
      return null;
    }
    console.log('No auth token found CCCCCCCCC');
    return json;
  } catch (error) {
    console.log('ApiService error catch:', error);
    console.error('API Error:', error);
    throw error;
  }
};

export default ApiService;