/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useContext } from 'react';
import { ActivityIndicator, StatusBar, useColorScheme, View, Text, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext, AuthProvider } from './src/context/AuthContext';
import Main from './src/screens/Main';
import LoginScreen from './src/screens/LoginScreen';
import OfferDetailsScreen from './src/screens/OfferDetailsScreen';
import ProductdetailsScreen from './src/screens/Home/ProductdetailsScreen';
import CreateLeadScreen from './src/screens/Leads/CreateLeadScreen';
import LeadDetailsScreen from './src/screens/Leads/LeadDetailsScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import ComplaintsScreen from './src/screens/Complaints/ComplaintsScreen';
import ComplaintCreateScreen from './src/screens/Complaints/ComplaintCreateScreen';
import ComplaintDetailsScreen from './src/screens/Complaints/ComplaintDetailsScreen';
import VendorsScreen from './src/screens/Vendors/VendorsScreen';
import VendorDetailsScreen from './src/screens/Vendors/VendorDetailsScreen';
import ReportsScreen from './src/screens/Reports/ReportsScreen';

function AppContent() {
  const isDarkMode = true; //useColorScheme() === 'dark';
  const Stack = createNativeStackNavigator();
  const { isLoggedIn, loading } = useContext(AuthContext);

  if (loading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        {/* <Image
          source={require('./assets/logo.jpg')}
          style={{ width: 120, height: 120, marginBottom: 24, borderRadius: 16 }}
          resizeMode="contain"
        /> */}
      <ActivityIndicator size="large" color="#f8d307" />
      </View>
      <View style={{ position: 'absolute', bottom: 32, width: '100%', alignItems: 'center' }}>
        {/* <Text style={{ color: '#fff', fontSize: 16, opacity: 0.7 }}>Provided by Your Company</Text> */}
      </View>
    </View>
  );
}

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'dark-content' : 'dark-content'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={Main} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
        <Stack.Screen name="OfferDetails" component={OfferDetailsScreen}/>
        <Stack.Screen name="ProductDetails" component={ProductdetailsScreen}/>
        <Stack.Screen name="CreateLead" component={CreateLeadScreen}/>
        <Stack.Screen name="LeadDetails" component={LeadDetailsScreen}/>
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen}/>
        <Stack.Screen name="Complaints" component={ComplaintsScreen}/>
        <Stack.Screen name="ComplaintCreate" component={ComplaintCreateScreen}/>
        <Stack.Screen name="ComplaintDetails" component={ComplaintDetailsScreen}/>
        <Stack.Screen name="Vendors" component={VendorsScreen}/>
        <Stack.Screen name="VendorDetails" component={VendorDetailsScreen}/>
        <Stack.Screen name="Reports" component={ReportsScreen}/>
        
        
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
