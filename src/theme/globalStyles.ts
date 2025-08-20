// globalStyles.ts - Theme-aware global styles
import { StyleSheet } from 'react-native';


export const createGlobalStyles = (colors: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 24,
      textAlign: 'center',
      color: colors.text,
    },
    subTitle: {
      fontSize: 18,
      fontWeight: 'normal',
      marginBottom: 24,
      textAlign: 'center',
      color: colors.textSecondary,
    },
    label: {
      fontSize: 16,
      marginBottom: 6,
      marginTop: 12,
      color: colors.text,
    },
    input: {
      height: 48,
      borderColor: colors.inputBorder,
      borderWidth: 1,
      borderRadius: 24,
      paddingHorizontal: 12,
      color: colors.text,
      backgroundColor: colors.surface,
      marginTop: 12,
    },
    button: {
      height: 48,
      marginTop: 24,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 24,
    },
    buttonText: {
      fontSize: 18,
      color: colors.surface,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    link: {
      color: colors.info,
      textAlign: 'center',
      marginTop: 16,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: colors.inputBorder,
      borderWidth: 1,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
      height: 48,
      borderRadius: 24,
      marginTop: 12,
    },
    passwordInput: {
      flex: 1,
      height: '100%',
      color: colors.text,
    },
    safeContainer: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 0,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      position: 'relative',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
      position: 'absolute',
      left: 0,
      right: 0,
      color: colors.text,
    },
    headerBackButton: {
      padding: 8,
      marginRight: 8,
    },
    headerBackButtonText: {
      fontSize: 16,
      color: colors.primary,
    },
    content: {
      flex: 1,
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    cardContent: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    rowLabel: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    rowValue: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'right',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    statusText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
    successStatus: {
      backgroundColor: colors.success + '20',
    },
    successStatusText: {
      color: colors.success,
    },
    errorStatus: {
      backgroundColor: colors.error + '20',
    },
    errorStatusText: {
      color: colors.error,
    },
    warningStatus: {
      backgroundColor: colors.warning + '20',
    },
    warningStatusText: {
      color: colors.warning,
    },
    infoStatus: {
      backgroundColor: colors.info + '20',
    },
    infoStatusText: {
      color: colors.info,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    emptyStateText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: 'center',
      marginTop: 16,
    },
    retryButton: {
      marginTop: 16,
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    sectionHeader: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginVertical: 16,
      marginHorizontal: 16,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },
    listItemText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
  });
};

// Default export for backward compatibility - provides light theme styles
const defaultGlobalStyles = createGlobalStyles({
  background: '#f8f9fa',
  surface: '#ffffff',
  surfaceVariant: '#f1f3f4',
  text: '#1a1a1a',
  textSecondary: '#5f6368',
  textTertiary: '#9aa0a6',
  textDisabled: '#c4c7c5',
  label: '#1a1a1a',
  primary: '#f8d307',
  primaryDark: '#e6c200',
  primaryLight: '#fde066',
  success: '#03ad00',
  error: '#d50000',
  warning: '#ff9800',
  info: '#2196f3',
  green: '#4CAF50',
  red: '#d0021b',
  border: '#dadce0',
  divider: '#e8eaed',
  inputBorder: '#dadce0',
  card: '#ffffff',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  ripple: 'rgba(0, 0, 0, 0.1)',
  white: '#ffffff',
  link: '#2196f3',
  placeholder: '#9aa0a6',
  slelectedLabel: '#1a1a1a',
});

export default defaultGlobalStyles;
