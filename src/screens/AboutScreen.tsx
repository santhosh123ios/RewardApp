import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import colors from '../theme/colors';
import { RootStackParamList } from '../types/navigation';

type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'About'>;

export default function AboutScreen() {
  const navigation = useNavigation<AboutScreenNavigationProp>();

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
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerBtn} />
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Reward App</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
        
        <Text style={styles.sectionTitle}>About the App</Text>
        <Text style={styles.description}>
          Reward App is a comprehensive platform that connects vendors with potential customers, 
          helping businesses grow through lead generation and customer acquisition services.
        </Text>
        
        <Text style={styles.sectionTitle}>Features</Text>
        
        <View style={styles.featureItem}>
          <Icon name="people" size={20} color={colors.primary} />
          <Text style={styles.featureText}>Lead Generation</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Icon name="wallet" size={20} color={colors.primary} />
          <Text style={styles.featureText}>Commission Tracking</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Icon name="analytics" size={20} color={colors.primary} />
          <Text style={styles.featureText}>Performance Analytics</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Icon name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={styles.featureText}>Secure Transactions</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.contactItem}>
          <Icon name="mail" size={20} color={colors.primary} />
          <Text style={styles.contactText}>info@rewardapp.com</Text>
        </View>
        
        <View style={styles.contactItem}>
          <Icon name="call" size={20} color={colors.primary} />
          <Text style={styles.contactText}>+1 (555) 123-4567</Text>
        </View>
        
        <View style={styles.contactItem}>
          <Icon name="globe" size={20} color={colors.primary} />
          <Text style={styles.contactText}>www.rewardapp.com</Text>
        </View>
        
        <Text style={styles.copyright}>
          © 2024 Reward App. All rights reserved.
        </Text>
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
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 20,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 12,
  },
  copyright: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
});
