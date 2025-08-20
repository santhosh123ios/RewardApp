// colors.ts - Theme-aware color system
export const lightColors = {
  // Primary colors
  primary: '#f8d307',
  primaryDark: '#e6c200',
  primaryLight: '#fde066',
  
  // Background colors
  background: '#f8f9fa',
  surface: '#ffffff',
  surfaceVariant: '#f1f3f4',
  
  // Text colors
  text: '#1a1a1a',
  textSecondary: '#5f6368',
  textTertiary: '#9aa0a6',
  textDisabled: '#c4c7c5',
  label: '#1a1a1a', // Added missing label color
  
  // Status colors
  success: '#03ad00',
  error: '#d50000',
  warning: '#ff9800',
  info: '#2196f3',
  
  // Additional status colors
  green: '#4CAF50',
  red: '#d0021b',
  
  // Border and divider colors
  border: '#dadce0',
  divider: '#e8eaed',
  inputBorder: '#dadce0',
  
  // Card and shadow colors
  card: '#ffffff',
  shadow: '#000000',
  
  // Special colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  ripple: 'rgba(0, 0, 0, 0.1)',
  
  // Additional colors for consistency
  white: '#ffffff',
  link: '#2196f3',
  placeholder: '#9aa0a6',
  
  // Legacy color support
  slelectedLabel: '#1a1a1a', // Typo in original code, keeping for compatibility
};

export const darkColors = {
  // Primary colors
  primary: '#f8d307',
  primaryDark: '#e6c200',
  primaryLight: '#fde066',
  
  // Background colors
  background: '#121212',
  surface: '#1e1e1e',
  surfaceVariant: '#2d2d2d',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  textTertiary: '#808080',
  textDisabled: '#666666',
  label: '#ffffff', // Added missing label color
  
  // Status colors
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#2196f3',
  
  // Additional status colors
  green: '#4CAF50',
  red: '#d0021b',
  
  // Border and divider colors
  border: '#333333',
  divider: '#424242',
  inputBorder: '#333333',
  
  // Card and shadow colors
  card: '#1e1e1e',
  shadow: '#000000',
  
  // Special colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  ripple: 'rgba(255, 255, 255, 0.1)',
  
  // Additional colors for consistency
  white: '#1e1e1e',
  link: '#64b5f6',
  placeholder: '#808080',
  
  // Legacy color support
  slelectedLabel: '#ffffff', // Typo in original code, keeping for compatibility
};

// Legacy color support for backward compatibility
const colors = lightColors;

export default colors;
