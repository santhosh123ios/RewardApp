// services/ApiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = 'https://crmgcc.net/api/';

const ApiService = async (endpoint: string, method: string = 'GET', body: any = null) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');

    if (!token) {
      console.warn('No auth token found');
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

    return json;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export default ApiService;