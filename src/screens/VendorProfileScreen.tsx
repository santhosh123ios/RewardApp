import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { AuthContext } from '../context/AuthContext';
import { RootStackParamList } from '../types/navigation';

type VendorProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VendorDashboard'>;

export default function VendorProfileScreen() {
  const navigation = useNavigation<VendorProfileScreenNavigationProp>();
  const { logout } = useContext(AuthContext);
  const { colors, isDark } = useTheme();
  const [profileData, setProfileData] = useState({
    name: 'John Vendor',
    email: 'john.vendor@example.com',
    phone: '+1234567890',
    company: 'Vendor Solutions Inc.',
    location: 'New York, NY',
    rating: 4.8,
    totalLeads: 156,
    totalEarnings: '$12,450',
    memberSince: '2023',
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const renderProfileSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );

  const renderMenuItem = (icon: string, title: string, subtitle?: string, onPress?: () => void) => (
    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: colors.surfaceVariant }]}>
        <Icon name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={styles.headerActions}>
          <ThemeToggle size="small" />
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.surfaceVariant }]} onPress={() => navigation.navigate('ProfileEdit')}>
            <Icon name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require('../../assets/dummy.jpg')}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <TouchableOpacity style={[styles.editImageButton, { backgroundColor: colors.primary }]}>
              <Icon name="camera" size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.profileName, { color: colors.text }]}>{profileData.name}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{profileData.email}</Text>
          
          <View style={styles.ratingContainer}>
            <Icon name="star" size={20} color={colors.primary} />
            <Text style={[styles.ratingText, { color: colors.text }]}>{profileData.rating}</Text>
            <Text style={[styles.ratingSubtext, { color: colors.textSecondary }]}>({profileData.totalLeads} leads)</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <Icon name="people-outline" size={24} color={colors.success} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{profileData.totalLeads}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Leads</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <Icon name="wallet-outline" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{profileData.totalEarnings}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Earnings</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <Icon name="calendar-outline" size={24} color={colors.info} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{profileData.memberSince}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Member Since</Text>
          </View>
        </View>

        {/* Profile Information */}
        {renderProfileSection('Personal Information', (
          <View style={[styles.infoContainer, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
              <Icon name="person-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.text }]}>Name:</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{profileData.name}</Text>
            </View>
            
            <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
              <Icon name="mail-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.text }]}>Email:</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{profileData.email}</Text>
            </View>
            
            <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
              <Icon name="call-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.text }]}>Phone:</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{profileData.phone}</Text>
            </View>
            
            <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
              <Icon name="business-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.text }]}>Company:</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{profileData.company}</Text>
            </View>
            
            <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
              <Icon name="location-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.infoLabel, { color: colors.text }]}>Location:</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{profileData.location}</Text>
            </View>
          </View>
        ))}

        {/* Menu Items */}
        {renderProfileSection('Settings', (
          <View style={[styles.menuContainer, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            {renderMenuItem(
              'color-palette-outline',
              'Theme Settings',
              'Customize app appearance and colors',
              () => navigation.navigate('ThemeSettings')
            )}
            
            {renderMenuItem(
              'notifications-outline',
              'Notifications',
              'Manage your notification preferences',
              () => navigation.navigate('Notifications')
            )}
            
            {renderMenuItem(
              'shield-checkmark-outline',
              'Privacy & Security',
              'Manage your privacy settings',
              () => navigation.navigate('Privacy')
            )}
            
            {renderMenuItem(
              'help-circle-outline',
              'Help & Support',
              'Get help and contact support',
              () => navigation.navigate('Support')
            )}
            
            {renderMenuItem(
              'information-circle-outline',
              'About',
              'App version and information',
              () => navigation.navigate('About')
            )}
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
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
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 8,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#f8d307',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f8d307',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
    marginRight: 5,
  },
  ratingSubtext: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 15,
    marginRight: 15,
    minWidth: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f44336',
    marginLeft: 10,
  },
});
