import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import colors from '../theme/colors';
import { RootStackParamList } from '../types/navigation';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

export default function NotificationsScreen() {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();

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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerBtn} />
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <TouchableOpacity style={styles.toggleButton}>
            <Icon name="toggle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email Notifications</Text>
          <TouchableOpacity style={styles.toggleButton}>
            <Icon name="toggle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>SMS Notifications</Text>
          <TouchableOpacity style={styles.toggleButton}>
            <Icon name="toggle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Recent Notifications</Text>
        
        <View style={styles.notificationItem}>
          <Icon name="notifications" size={20} color={colors.primary} />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>New Lead Available</Text>
            <Text style={styles.notificationTime}>2 hours ago</Text>
          </View>
        </View>
        
        <View style={styles.notificationItem}>
          <Icon name="wallet" size={20} color={colors.primary} />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Payment Received</Text>
            <Text style={styles.notificationTime}>1 day ago</Text>
          </View>
        </View>
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
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  notificationContent: {
    marginLeft: 12,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  notificationTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
