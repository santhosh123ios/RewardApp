/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useContext } from 'react';
import { ActivityIndicator, StatusBar, View, Text, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext, AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import Main from './src/screens/Main';
import VendorDashboard from './src/screens/VendorDashboard';
import LoginScreen from './src/screens/LoginScreen';
import OfferDetailsScreen from './src/screens/OfferDetailsScreen';
import ProductdetailsScreen from './src/screens/Home/ProductdetailsScreen';
import CreateLeadScreen from './src/screens/Leads/CreateLeadScreen';
import LeadDetailsScreen from './src/screens/Leads/LeadDetailsScreen';
import VendorLeadDetailsScreen from './src/screens/VendorLeadDetailsScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import ComplaintsScreen from './src/screens/Complaints/ComplaintsScreen';
import ComplaintCreateScreen from './src/screens/Complaints/ComplaintCreateScreen';
import ComplaintDetailsScreen from './src/screens/Complaints/ComplaintDetailsScreen';
import VendorsScreen from './src/screens/Vendors/VendorsScreen';
import VendorDetailsScreen from './src/screens/Vendors/VendorDetailsScreen';
import ReportsScreen from './src/screens/Reports/ReportsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import SupportScreen from './src/screens/SupportScreen';
import AboutScreen from './src/screens/AboutScreen';
import ThemeSettingsScreen from './src/screens/ThemeSettingsScreen';
import AllTransactionsScreen from './src/screens/AllTransactionsScreen';
import RedeemScreen from './src/screens/RedeemScreen';

const AppContent: React.FC = () => {
  const Stack = createNativeStackNavigator();
  const { isLoggedIn, loading, userType } = useContext(AuthContext);
  const { isDark, colors } = useTheme();

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background 
      }}>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%' 
        }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <View style={{ 
          position: 'absolute', 
          bottom: 32, 
          width: '100%', 
          alignItems: 'center' 
        }}>
          <Text style={{ 
            color: colors.textSecondary, 
            fontSize: 16, 
            opacity: 0.7 
          }}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
        translucent={false}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          userType === 3 ? (
            <>
              <Stack.Screen name="VendorDashboard" component={VendorDashboard} />
              {/* Vendor-specific screens that can be accessed from tab navigator */}
              <Stack.Screen name="ProfileEdit" component={ProfileEditScreen}/>
              <Stack.Screen name="Notifications" component={NotificationsScreen}/>
              <Stack.Screen name="Privacy" component={PrivacyScreen}/>
              <Stack.Screen name="Support" component={SupportScreen}/>
              <Stack.Screen name="About" component={AboutScreen}/>
              <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen}/>
              {/* Vendor lead management screens */}
              <Stack.Screen name="CreateLead" component={CreateLeadScreen}/>
              <Stack.Screen name="LeadDetails" component={LeadDetailsScreen}/>
              <Stack.Screen name="VendorLeadDetails" component={VendorLeadDetailsScreen}/>
              {/* Vendor offer and product screens */}
              <Stack.Screen name="OfferDetails" component={OfferDetailsScreen}/>
              <Stack.Screen name="ProductDetails" component={ProductdetailsScreen}/>
              {/* Vendor wallet screens */}
              <Stack.Screen name="AllTransactions" component={AllTransactionsScreen}/>
              <Stack.Screen name="Redeem" component={RedeemScreen}/>
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={Main} />
              {/* User-specific screens */}
              <Stack.Screen name="ProfileEdit" component={ProfileEditScreen}/>
              <Stack.Screen name="OfferDetails" component={OfferDetailsScreen}/>
              <Stack.Screen name="ProductDetails" component={ProductdetailsScreen}/>
              <Stack.Screen name="CreateLead" component={CreateLeadScreen}/>
              <Stack.Screen name="LeadDetails" component={LeadDetailsScreen}/>
              <Stack.Screen name="Complaints" component={ComplaintsScreen}/>
              <Stack.Screen name="ComplaintCreate" component={ComplaintCreateScreen}/>
              <Stack.Screen name="ComplaintDetails" component={ComplaintDetailsScreen}/>
              <Stack.Screen name="Vendors" component={VendorsScreen}/>
              <Stack.Screen name="VendorDetails" component={VendorDetailsScreen}/>
              <Stack.Screen name="Reports" component={ReportsScreen}/>
            </>
          )
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
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
