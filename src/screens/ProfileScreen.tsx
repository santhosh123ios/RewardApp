import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../theme/colors';
import ApiService from '../services/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

const dummyImg = require('../../assets/dummy.jpg');

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setLoggedIn, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const json = await ApiService('member/get_profile', 'GET', null, logout);
      if (json?.result?.status === 1) {
        setProfile(json.result.data);
      } else {
        setProfile(null);
      }
    } catch (e) {
      setProfile(null);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('isLoggedIn');
      setLoggedIn(false); // This will trigger the app to show the Login screen
    } catch (e) {
      Alert.alert('Error', 'Failed to logout.');
    }
  };

  const handleProfile = async () => {
    
  };

  let profileImgSrc = dummyImg;
  if (profile?.profile_img) {
    profileImgSrc = { uri: 'https://crmgcc.net/uploads/' + profile.profile_img };
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      
      {/* Profile Image, Info, and Edit Button in a row */}
      <View style={styles.profileRow}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginRight: 16 }} />
        ) : (
          <Image source={profileImgSrc} style={styles.profileImg} />
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.name?.toUpperCase() || ''}</Text>
          <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('ProfileEdit')}>
          <Icon name="create-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {/* Menu Options */}
      <View style={styles.menuSection}>
        <MenuButton icon="business-outline" label="Vendor" onPress={() => navigation.navigate('Vendors')} color="#222" />
        <MenuButton icon="document-text-outline" label="Report" onPress={() => navigation.navigate('Reports')} color="#222" />
        <MenuButton icon="alert-circle-outline" label="Complaints" onPress={() => navigation.navigate('Complaints')} color="#222" />
        <MenuButton icon="log-out-outline" label="Logout" onPress={handleLogout} color={colors.red || '#d0021b'} />
      </View>
    </SafeAreaView>
  );
}

function MenuButton({ icon, label, onPress, color }: { icon: string; label: string; onPress: () => void; color?: string }) {
  return (
    <TouchableOpacity style={styles.menuBtn} onPress={onPress}>
      <Icon name={icon} size={22} color={color || colors.primary} style={{ marginRight: 16 }} />
      <Text style={[styles.menuLabel, color ? { color } : {}]}>{label}</Text>
      <Icon name="chevron-forward-outline" size={20} color="#bbb" style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  profileImg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: '#888',
    marginBottom: 8,
  },
  editBtn: {
    padding: 8,
  },
  menuSection: {
    marginTop: 8,
    paddingHorizontal: 24,
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});