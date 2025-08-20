import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../theme/globalStyles';

export default function ThemeSettingsScreen() {
  const { theme, themeMode, setThemeMode, isDark, colors } = useTheme();
  const globalStyles = createGlobalStyles(colors);

  const handleThemeModeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
  };

  const getThemeModeIcon = (mode: 'light' | 'dark' | 'system') => {
    switch (mode) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'system':
        return 'settings-outline';
      default:
        return 'settings-outline';
    }
  };

  const getThemeModeColor = (mode: 'light' | 'dark' | 'system') => {
    if (mode === themeMode) {
      return isDark ? '#f8d307' : '#f8d307';
    }
    return isDark ? '#666' : '#999';
  };

  const getThemeModeBackground = (mode: 'light' | 'dark' | 'system') => {
    if (mode === themeMode) {
      return isDark ? '#333' : '#f0f0f0';
    }
    return isDark ? '#2d2d2d' : '#f8f9fa';
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Theme Settings</Text>
      <Text style={globalStyles.subTitle}>Customize your app appearance</Text>

      <View style={styles.section}>
        <Text style={globalStyles.sectionHeader}>Theme Mode</Text>
        
        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: getThemeModeBackground('light') }
          ]}
          onPress={() => handleThemeModeChange('light')}
        >
          <Icon
            name={getThemeModeIcon('light')}
            size={24}
            color={getThemeModeColor('light')}
          />
          <View style={styles.themeOptionContent}>
            <Text style={[styles.themeOptionTitle, { color: isDark ? '#fff' : '#333' }]}>
              Light Theme
            </Text>
            <Text style={[styles.themeOptionDescription, { color: isDark ? '#b3b3b3' : '#666' }]}>
              Always use light colors
            </Text>
          </View>
          {themeMode === 'light' && (
            <Icon name="checkmark-circle" size={24} color="#f8d307" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: getThemeModeBackground('dark') }
          ]}
          onPress={() => handleThemeModeChange('dark')}
        >
          <Icon
            name={getThemeModeIcon('dark')}
            size={24}
            color={getThemeModeColor('dark')}
          />
          <View style={styles.themeOptionContent}>
            <Text style={[styles.themeOptionTitle, { color: isDark ? '#fff' : '#333' }]}>
              Dark Theme
            </Text>
            <Text style={[styles.themeOptionDescription, { color: isDark ? '#b3b3b3' : '#666' }]}>
              Always use dark colors
            </Text>
          </View>
          {themeMode === 'dark' && (
            <Icon name="checkmark-circle" size={24} color="#f8d307" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.themeOption,
            { backgroundColor: getThemeModeBackground('system') }
          ]}
          onPress={() => handleThemeModeChange('system')}
        >
          <Icon
            name={getThemeModeIcon('system')}
            size={24}
            color={getThemeModeColor('system')}
          />
          <View style={styles.themeOptionContent}>
            <Text style={[styles.themeOptionTitle, { color: isDark ? '#fff' : '#333' }]}>
              System Default
            </Text>
            <Text style={[styles.themeOptionDescription, { color: isDark ? '#b3b3b3' : '#666' }]}>
              Follow system appearance
            </Text>
          </View>
          {themeMode === 'system' && (
            <Icon name="checkmark-circle" size={24} color="#f8d307" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={globalStyles.sectionHeader}>Current Theme</Text>
        <View style={[styles.currentThemeCard, { backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa' }]}>
          <Icon
            name={isDark ? 'moon' : 'sunny'}
            size={32}
            color="#f8d307"
          />
          <Text style={[styles.currentThemeText, { color: isDark ? '#fff' : '#333' }]}>
            {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
          </Text>
          <Text style={[styles.currentThemeSubtext, { color: isDark ? '#b3b3b3' : '#666' }]}>
            {themeMode === 'system' ? 'Following system preference' : 'Manual selection'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={globalStyles.sectionHeader}>Quick Actions</Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#f8d307' }]}
          onPress={() => {
            const newTheme = isDark ? 'light' : 'dark';
            setThemeMode(newTheme);
          }}
        >
          <Icon name="refresh" size={20} color="#333" />
          <Text style={styles.actionButtonText}>Toggle Theme</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  themeOptionContent: {
    flex: 1,
    marginLeft: 16,
  },
  themeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeOptionDescription: {
    fontSize: 14,
  },
  currentThemeCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(248, 211, 7, 0.3)',
  },
  currentThemeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  currentThemeSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
