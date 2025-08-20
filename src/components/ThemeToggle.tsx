import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'button' | 'icon' | 'compact';
}

export default function ThemeToggle({ 
  showLabel = true, 
  size = 'medium',
  variant = 'button'
}: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 28;
      default: return 20;
    }
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'icon':
        return [
          styles.iconContainer,
          { 
            backgroundColor: isDark ? '#333' : '#f0f0f0',
            width: getIconSize() + 16,
            height: getIconSize() + 16,
          }
        ];
      case 'compact':
        return [
          styles.compactContainer,
          { backgroundColor: isDark ? '#333' : '#f0f0f0' }
        ];
      default:
        return [
          styles.buttonContainer,
          { backgroundColor: isDark ? '#333' : '#f0f0f0' }
        ];
    }
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <Icon
        name={isDark ? 'sunny' : 'moon'}
        size={getIconSize()}
        color={isDark ? '#f8d307' : '#333'}
      />
      {showLabel && variant !== 'icon' && (
        <Text style={[
          styles.text, 
          { 
            color: isDark ? '#fff' : '#333',
            fontSize: size === 'small' ? 12 : size === 'large' ? 16 : 14
          }
        ]}>
          {isDark ? 'Light' : 'Dark'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  text: {
    marginLeft: 6,
    fontWeight: '600',
  },
});
