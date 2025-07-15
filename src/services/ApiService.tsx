// services/ApiService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://crmgcc.net/api/';

const ApiService = async (endpoint, method = 'GET', body = null) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');

    if (!token) {
      console.warn('No auth token found');
      return null;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const options = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
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