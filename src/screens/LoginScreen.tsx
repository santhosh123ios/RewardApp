import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import globalStyles from '../theme/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BallIndicator } from 'react-native-indicators';
import { useNavigation } from '@react-navigation/native';


export default function LoginScreen() {

   const navigation = useNavigation();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const isValid = email.trim() !== '' && password.trim() !== '';


    /////API CALL
    const login = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://crmgcc.net/api/admin/login', {
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

            const data = await response.json();

            if (response.ok) {
        
            console.log('Login successful:', data);
            const token = data?.result?.token;
            const user_type = data?.result?.data?.user_type; //If 2 or 3 access the login

            
            
            if (user_type === 2 || user_type === 3 )
            {
              await AsyncStorage.setItem('auth_token', token);
              await AsyncStorage.setItem('isLoggedIn', 'true');
              navigation.navigate('App');
              Alert.alert('Success', 'Logged in successfully!'+user_type);
              // Save token
              // await AsyncStorage.setItem('auth_token', token);
              // await AsyncStorage.setItem('isLoggedIn', 'true');
              // //navigation.replace('Main'); // replaces Login with Main
              // navigation.navigate('Main');
              // ///Alert.alert('Success', 'Logged in successfully!'+user_type);

            }
            else
            {
                Alert.alert('Login Failed', data.message || 'Invalid credentials');
            }
            } else {
            console.log('Login failed:', data);
            Alert.alert('Login Failed', data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Error logging in:', error);
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
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* <TouchableOpacity
            style={[
                globalStyles.button,
                (!isValid || loading) && { backgroundColor: '#ccc' },
            ]}
            disabled={!isValid || loading}
            onPress={login}
            >
            {true ? (
                <ActivityIndicator
                  color="#f8d307"
                  size="large" // or "large"
                  style={{ marginVertical: 4 }} // customize as needed
                />
            ) : (
                <Text style={globalStyles.buttonText}>Log In</Text>
            )}
       </TouchableOpacity> */}

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

const styles = StyleSheet.create({
  
});