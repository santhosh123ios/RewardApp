import React, { useState,useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import globalStyles from '../theme/globalStyles';
import colors from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BallIndicator } from 'react-native-indicators';
import { AuthContext } from '../context/AuthContext';
import ApiService from '../services/ApiService';


export default function LoginScreen() {

   //const navigation = useNavigation();

    const { setLoggedIn } = useContext(AuthContext);
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
            const apiUrl = Platform.OS === 'android' 
                ? 'http://192.168.8.68:8000/api/admin/login'
                : 'http://localhost:8000/api/admin/login';
                
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

            
            
            if (user_type === 2 || user_type === 2 ) //3 for vendor
            {
              await AsyncStorage.setItem('auth_token', token);
              await AsyncStorage.setItem('isLoggedIn', 'true');
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
        placeholderTextColor={colors.text}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* <Text style={globalStyles.label}>Password</Text> */}
      <View style={globalStyles.passwordContainer}>
        <TextInput
          style={[globalStyles.passwordInput, { color: colors.label }]}
          placeholder="Enter your password"
          placeholderTextColor={colors.text}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
          style={[
            globalStyles.button,
            (!isValid || loading) && { backgroundColor: '#ccc' },
          ]}
          disabled={!isValid || loading}
          onPress={login}
        >
          {loading ? (
            <BallIndicator
              size={25}
              color="#f8d307"
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

// const styles = StyleSheet.create({
  
// });