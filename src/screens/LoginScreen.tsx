import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createGlobalStyles } from '../theme/globalStyles';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BallIndicator } from 'react-native-indicators';
import { AuthContext } from '../context/AuthContext';
import ApiService from '../services/ApiService';
export default function LoginScreen() {
  const { colors: colors_theme } = useTheme();
  const globalStyles = createGlobalStyles(colors_theme);
  
  //const navigation = useNavigation();

  const { setLoggedIn, setUserType } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = email.trim() !== '' && password.trim() !== '';

  /////API CALL
  const login = async () => {
    try {
      setLoading(true);
      // Use computer's IP address for Android, localhost for iOS
      //Local IP address 192.168.8.68
      // const apiUrl = Platform.OS === 'android' 
      //     ? 'http://192.168.8.68:8000/api/admin/login'
      //     : 'http://localhost:8000/api/admin/login';

      //Live IP address 192.168.8.68
      const apiUrl = 'https://crmgcc.net/api/admin/login';
          
      console.log('Platform:', Platform.OS);
      console.log('API URL:', apiUrl);
      console.log('Attempting login with email:', email);
          
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // add 'Accept': 'application/json' if needed
        },
        body: JSON.stringify({
          email: email, // replace with real values
          password: password,
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        console.log('Login successful:', data);
        const token = data?.result?.token;
        const user_type = data?.result?.data?.user_type; //If 2 or 3 access the login

        if (user_type === 2 || user_type === 3) //3 for vendor
        {
          await AsyncStorage.setItem('auth_token', token);
          await AsyncStorage.setItem('isLoggedIn', 'true');
          await AsyncStorage.setItem('user_type', user_type.toString());
          setUserType(user_type);
          setLoggedIn(true);
          //Alert.alert('Success', 'Logged in successfully!'+user_type);
        }
        else
        {
          Alert.alert('Login Failed', data.message || 'Invalid credentials');
        }
      } else {
        console.log('Login failed:', data);
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Error logging in:', error.message, error);
      console.error('Error stack:', error.stack);
      Alert.alert('Network Error', error.message);
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Sign In</Text>
      <Text style={globalStyles.subTitle}>Sign In and explore points and rewards</Text>

      {/* <Text style={globalStyles.label}>Email</Text> */}
      <TextInput
        style={globalStyles.input}
        placeholder="Enter your email"
        placeholderTextColor={colors_theme.placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* <Text style={globalStyles.label}>Password</Text> */}
      <View style={globalStyles.passwordContainer}>
        <TextInput
          style={globalStyles.passwordInput}
          placeholder="Enter your password"
          placeholderTextColor={colors_theme.placeholder}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color={colors_theme.textTertiary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          globalStyles.button,
          (!isValid || loading) && { backgroundColor: colors_theme.textDisabled },
        ]}
        disabled={!isValid || loading}
        onPress={login}
      >
        {loading ? (
          <BallIndicator
            size={25}
            color={colors_theme.text}
            style={{ alignSelf: 'center' }}
          />
        ) : (
          <Text style={globalStyles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={globalStyles.link}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={globalStyles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}