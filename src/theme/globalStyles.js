// globalStyles.js

import { StyleSheet } from 'react-native';
import colors from './colors'; // import your global colors if you have them 
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width; 


const globalStyles = StyleSheet.create({
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
    color: colors.label,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'normal',
    marginBottom: 24,
    textAlign: 'center',
    color: colors.label,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    marginTop: 12,
    color: colors.label,
  },
  input: {
    height: 48,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
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
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  link: {
    color: colors.link,
    textAlign: 'center',
    marginTop: 16,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.inputBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    height: 48,
    borderRadius: 24,
    marginTop: 12,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    },
    
    header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    },
    headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign:'center',
    width: windowWidth - 76
    },
});

export default globalStyles;