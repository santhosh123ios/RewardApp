import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import globalStyles from '../../theme/globalStyles';
import ApiService from '../../services/ApiService';
import { AuthContext } from '../../context/AuthContext';

const dummyImg = require('../../../assets/dummy.jpg');

const VendorsScreen = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const json = await ApiService('member/vendorlist', 'GET', null, logout);
      if (json?.result?.status === 1) {
        setVendors(json.result.data);
      } else {
        setVendors([]);
      }
    } catch (e) {
      setVendors([]);
    }
    setLoading(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('VendorDetails', { vendor: item, defaultTab: 'Offer' })}
      activeOpacity={0.85}
      style={styles.vendorItem}
    >
      <Image
        source={item.profile_img ? { uri: 'https://crmgcc.net/uploads/' + item.profile_img } : dummyImg}
        style={styles.vendorImg}
        resizeMode="cover"
      />
      <View style={styles.vendorInfoRow}>
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{item.name}</Text>
          <Text style={styles.vendorEmail}>{item.email}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={(e) => {
              e.stopPropagation();
              if (item.phone) {
                Linking.openURL(`tel:${item.phone}`);
              } else {
                Alert.alert('No phone number available');
              }
            }}
          >
            <Icon name="call" size={20} color="#4caf50" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={(e) => {
              e.stopPropagation();
              if (item.latitude && item.longitude) {
                const url = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
                Linking.openURL(url);
              } else {
                Alert.alert('No location available for this vendor');
              }
            }}
          >
            <Icon name="location" size={20} color="#2196f3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('VendorDetails', { vendor: item, defaultTab: 'Trans' });
            }}
          >
            <Icon name="card" size={20} color="#f8d307" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>Vendors</Text>
      </View>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#f8d307" style={{ marginTop: 40 }} />
        ) : vendors.length === 0 ? (
          <Text style={styles.placeholderText}>No vendors found.</Text>
        ) : (
          <FlatList
            data={vendors}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingVertical: 16 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  vendorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    minHeight: 72,
  },
  vendorImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#eee',
    // Ensure image is not overlapped
    overflow: 'hidden',
  },
  vendorInfoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vendorInfo: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  iconBtn: {
    marginLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  vendorName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  vendorEmail: {
    fontSize: 15,
    color: '#555',
    marginTop: 2,
  },
});

export default VendorsScreen;
