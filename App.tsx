/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useContext } from 'react';
import { ActivityIndicator, StatusBar, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext, AuthProvider } from './src/context/AuthContext';
import Main from './src/screens/Main';
import LoginScreen from './src/screens/LoginScreen';

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const Stack = createNativeStackNavigator();
  const { isLoggedIn, loading } = useContext(AuthContext);

  if (loading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#f8d307" />
    </View>
  );
}

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={Main} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
















// import React, { useEffect,useState } from 'react';
// import { StatusBar, useColorScheme } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import LoginScreen from './src/screens/LoginScreen';
// import Main from './src/screens/Main';


// function App() {
//   const isDarkMode = useColorScheme() === 'dark';
//   const Stack = createNativeStackNavigator();
  
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
  
//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       const value = await AsyncStorage.getItem('isLoggedIn');
//       setIsLoggedIn(value === 'true'); // convert string to boolean
//       console.log('Login status:', value);
//     };

//     checkLoginStatus();
//   }, []);
  
//   return (
//     <NavigationContainer>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {isLoggedIn ? (
//           <Stack.Screen name="Main" component={Main} />
          
//         ) : (
//           <Stack.Screen name="Login" component={LoginScreen} />
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>

    
//   );
// }


// export default App;
