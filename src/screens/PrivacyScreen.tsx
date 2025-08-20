import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import colors from '../theme/colors';
import { RootStackParamList } from '../types/navigation';

type PrivacyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Privacy'>;

export default function PrivacyScreen() {
  const navigation = useNavigation<PrivacyScreenNavigationProp>();

  const handleBackPress = () => {
    // Since this screen is accessed from tab navigator, always navigate back to VendorDashboard
    navigation.navigate('VendorDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerBtn}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.headerBtn} />
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Profile Visibility</Text>
          <TouchableOpacity style={styles.toggleButton}>
            <Icon name="toggle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Location Sharing</Text>
          <TouchableOpacity style={styles.toggleButton}>
            <Icon name="toggle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Data Analytics</Text>
          <TouchableOpacity style={styles.toggleButton}>
            <Icon name="toggle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Security</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
          <TouchableOpacity style={styles.toggleButton}>
            <Icon name="toggle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Biometric Login</Text>
          <TouchableOpacity style={styles.toggleButton}>
            <Icon name="toggle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 25,
  },
  headerBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 20,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#222',
  },
  toggleButton: {
    padding: 4,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
