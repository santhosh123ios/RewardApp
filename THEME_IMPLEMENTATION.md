# Dark/Light Mode Theme Implementation Guide

This guide explains how to implement and use the comprehensive dark/light mode theme system in your React Native app.

## 🎨 Theme System Overview

The theme system consists of three main components:
1. **ThemeContext** - Manages theme state and provides theme data
2. **Color Schemes** - Defines light and dark color palettes
3. **Global Styles** - Theme-aware styling system

## 🚀 Quick Start

### 1. Using Theme in Components

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../theme/globalStyles';

export default function MyComponent() {
  const { colors_theme_theme, isDark } = useTheme();
  const globalStyles = createGlobalStyles(colors_theme);

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Hello World</Text>
    </View>
  );
}
```

### 2. Theme Toggle Component

```tsx
import ThemeToggle from '../components/ThemeToggle';

// Different variants available:
<ThemeToggle />                    // Default button style
<ThemeToggle variant="icon" />     // Icon only
<ThemeToggle variant="compact" />  // Compact style
<ThemeToggle size="small" />       // Small size
<ThemeToggle showLabel={false} />  // Hide text label
```

## 🎯 Available Theme Properties

### colors_theme Object
```tsx
const { colors_theme_theme } = useTheme();

// Primary colors_theme
colors_theme.primary        // Main brand color (#f8d307)
colors_theme.primaryDark    // Darker variant
colors_theme.primaryLight   // Lighter variant

// Background colors_theme
colors_theme.background     // Main background
colors_theme.surface        // Card/surface background
colors_theme.surfaceVariant // Secondary surface

// Text colors_theme
colors_theme.text           // Primary text
colors_theme.textSecondary  // Secondary text
colors_theme.textTertiary   // Tertiary text
colors_theme.textDisabled   // Disabled text

// Status colors_theme
colors_theme.success        // Success state
colors_theme.error          // Error state
colors_theme.warning        // Warning state
colors_theme.info           // Info state

// Border and divider colors_theme
colors_theme.border         // Border color
colors_theme.divider        // Divider color
colors_theme.inputBorder    // Input border

// Special colors_theme
colors_theme.overlay        // Modal overlay
colors_theme.ripple         // Touch feedback
colors_theme.placeholder    // Input placeholder
colors_theme.link           // Link color
```

### Theme State
```tsx
const { theme, isDark, themeMode } = useTheme();

theme        // 'light' | 'dark'
isDark       // boolean
themeMode    // 'light' | 'dark' | 'system'
```

## 🎨 Available Global Styles

### Basic Layout
```tsx
globalStyles.container      // Main container
globalStyles.safeContainer  // Safe area container
globalStyles.card          // Card component
```

### Typography
```tsx
globalStyles.title         // Main title
globalStyles.subTitle      // Subtitle
globalStyles.sectionHeader // Section headers
globalStyles.label         // Form labels
globalStyles.listItemText  // List item text
```

### Forms
```tsx
globalStyles.input         // Text input
globalStyles.button        // Primary button
globalStyles.buttonText    // Button text
globalStyles.passwordContainer // Password input container
globalStyles.passwordInput // Password input field
```

### Navigation
```tsx
globalStyles.header        // Header container
globalStyles.headerTitle   // Header title
globalStyles.link          // Link text
```

### Lists
```tsx
globalStyles.listItem      // List item container
globalStyles.statusBadge   // Status indicator
globalStyles.statusText    // Status text
```

## 🔧 Customizing Themes

### Adding New colors_theme

1. **Update colors_theme.js**:
```tsx
export const lightcolors_theme = {
  // ... existing colors_theme
  customColor: '#ff6b6b',
};

export const darkcolors_theme = {
  // ... existing colors_theme
  customColor: '#ff8e8e',
};
```

2. **Use in components**:
```tsx
const { colors_theme_theme } = useTheme();
<View style={{ backgroundColor: colors_theme_theme.customColor }} />
```

### Adding New Global Styles

1. **Update globalStyles.js**:
```tsx
export const createGlobalStyles = (colors_theme) => StyleSheet.create({
  // ... existing styles
  customStyle: {
    backgroundColor: colors_theme.surface,
    borderColor: colors_theme.border,
    color: colors_theme.text,
  },
});
```

2. **Use in components**:
```tsx
const globalStyles = createGlobalStyles(colors_theme);
<View style={globalStyles.customStyle} />
```

## 🌓 Theme Modes

### System Mode (Default)
- Automatically follows device appearance settings
- Updates when user changes system theme
- Best for user experience

### Manual Mode
- User explicitly chooses light or dark
- Persists across app sessions
- Good for user preference control

### Switching Modes
```tsx
const { setThemeMode } = useTheme();

// Set specific mode
setThemeMode('light');    // Always light
setThemeMode('dark');     // Always dark
setThemeMode('system');   // Follow system

// Toggle between light/dark
const { toggleTheme } = useTheme();
toggleTheme();
```

## 📱 Platform Considerations

### iOS
- Supports system appearance changes
- Automatic theme switching
- Status bar styling

### Android
- Supports system appearance changes
- Automatic theme switching
- Status bar and navigation bar styling

### Status Bar
```tsx
import { StatusBar } from 'react-native';

<StatusBar 
  barStyle={isDark ? 'light-content' : 'dark-content'} 
  backgroundColor={colors_theme.background}
/>
```

## 🎨 Best Practices

### 1. Always Use Theme colors_theme
```tsx
// ✅ Good
<Text style={{ color: colors_theme.text }}>Hello</Text>

// ❌ Bad
<Text style={{ color: '#000' }}>Hello</Text>
```

### 2. Use Global Styles When Possible
```tsx
// ✅ Good
<Text style={globalStyles.title}>Title</Text>

// ❌ Bad
<Text style={{ fontSize: 28, fontWeight: 'bold' }}>Title</Text>
```

### 3. Handle Loading States
```tsx
const { colors_theme_theme } = useTheme();

if (!colors_theme_theme) {
  return <LoadingSpinner />;
}
```

### 4. Test Both Themes
- Always test your components in both light and dark modes
- Ensure sufficient contrast ratios
- Check readability of all text elements

## 🔍 Troubleshooting

### Common Issues

1. **Theme not updating**
   - Check if component is wrapped in ThemeProvider
   - Verify useTheme hook is called correctly

2. **colors_theme undefined**
   - Ensure ThemeProvider is at the root level
   - Check import paths

3. **Styles not applying**
   - Verify createGlobalStyles is called with colors_theme
   - Check if styles are properly merged

### Debug Mode
```tsx
const { colors_theme, theme, isDark } = useTheme();
console.log('Current theme:', theme);
console.log('Is dark:', isDark);
console.log('colors_theme:', colors_theme);
```

## 📚 Examples

### Complete Component Example
```tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../theme/globalStyles';

export default function ExampleComponent() {
  const { colors_theme, isDark } = useTheme();
  const globalStyles = createGlobalStyles(colors_theme);

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Example Component</Text>
      
      <View style={globalStyles.card}>
        <Text style={globalStyles.listItemText}>
          This is a themed card
        </Text>
      </View>
      
      <TouchableOpacity style={globalStyles.button}>
        <Text style={globalStyles.buttonText}>Themed Button</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Custom Themed Component
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CustomComponent() {
  const { colors_theme_theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors_theme_theme.surface,
      borderColor: colors_theme_theme.border,
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
    },
    text: {
      color: colors_theme.text,
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Custom themed component</Text>
    </View>
  );
}
```

## 🎉 Conclusion

This theme system provides a robust foundation for implementing dark/light mode in your React Native app. By following these guidelines, you can create a consistent and user-friendly experience across all themes.

Remember to:
- Always use theme colors_theme instead of hardcoded values
- Leverage global styles for consistency
- Test both themes thoroughly
- Consider user preferences and system settings

Happy theming! 🎨✨
