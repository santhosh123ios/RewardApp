import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import globalStyles from '../../theme/globalStyles';
import ApiService from '../../services/ApiService';
import { AuthContext } from '../../context/AuthContext';

const windowWidth = Dimensions.get('window').width;
const tabs = ['Offer', 'Product', 'Transaction'];
const dummyImg = require('../../../assets/dummy.jpg');

const VendorDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { logout } = useContext(AuthContext);
  const vendor = (route as any)?.params?.vendor;
  const defaultTab = (route as any)?.params?.defaultTab;

  const [activeTab, setActiveTab] = useState(defaultTab || 'Offer');
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'Offer') {
      fetchOffers();
    } else if (activeTab === 'Product') {
      fetchProducts();
    } else if (activeTab === 'Transaction') {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const json = await ApiService('member/get_all_offers', 'GET', null, logout);
      if (json?.result?.status === 1) {
        setOffers(json.result.data.filter((item: any) => String(item.vendor_id) === String(vendor.id)));
      } else {
        setOffers([]);
      }
    } catch (e) {
      setOffers([]);
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const json = await ApiService('member/get_all_product', 'GET', null, logout);
      if (json?.result?.status === 1) {
        setProducts(json.result.data.filter((item: any) => String(item.vendor_id) === String(vendor.id)));
      } else {
        setProducts([]);
      }
    } catch (e) {
      setProducts([]);
    }
    setLoading(false);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const json = await ApiService('member/get_transaction', 'GET', null, logout);
      if (json?.result?.status === 1) {
        setTransactions(json.result.data.filter((item: any) => String(item.vendor_id) === String(vendor.id)));
      } else {
        setTransactions([]);
      }
    } catch (e) {
      setTransactions([]);
    }
    setLoading(false);
  };

  function formatDate(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  }

  const renderOffer = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('OfferDetails', { offer: item })}
    >
      <Image source={{ uri: `https://crmgcc.net/uploads/${item.image}` }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.discount}>Discount: {item.discount}%</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <Image source={{ uri: `https://crmgcc.net/uploads/${item.image}` }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.priceView}>
        <Text style={styles.priceLable}>Price: </Text>
        <Text style={styles.offerPrice}>{item.offer_price}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTransaction = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.listItem}>
      <View>
        <Text style={styles.itemLabel}>{item.transaction_title}</Text>
        <Text style={styles.itemDate}>{formatDate(item.transaction_created_at)}</Text>
        <Text style={styles.itemVendor}>{item.vendor_name}</Text>
      </View>
      <Text style={[styles.itemAmount, { color: item.transaction_cr > 0 ? '#4caf50' : '#d0021b' }]}> 
        {item.transaction_cr > 0 ? '+' : '-'}{(item.transaction_cr > 0 ? item.transaction_cr : item.transaction_dr)?.toFixed(2) ?? '0'}
      </Text>
    </View>
  );

  // Debug: log transactions
  useEffect(() => {
    if (activeTab === 'Transaction') {
      console.log('Vendor transactions:', transactions);
    }
  }, [transactions, activeTab]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>Vendor Details</Text>
      </View>
      {/* Vendor Details Top */}
      <View style={styles.vendorTop}>
        <Image
          source={vendor?.profile_img ? { uri: 'https://crmgcc.net/uploads/' + vendor.profile_img } : dummyImg}
          style={styles.vendorImg}
        />
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{vendor?.name}</Text>
          <Text style={styles.vendorEmail}>{vendor?.email}</Text>
        </View>
      </View>
      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={activeTab === tab ? styles.activeTabText : styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#f8d307" style={{ marginTop: 32 }} />
        ) : activeTab === 'Offer' ? (
          <FlatList
            data={offers}
            renderItem={renderOffer}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            key={'offers'} // <-- Add a unique key for this layout
            contentContainerStyle={styles.grid}
            ListEmptyComponent={<Text style={styles.placeholder}>No offers found.</Text>}
          />
        ) : activeTab === 'Product' ? (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            key={'products'} // <-- Add a unique key for this layout
            contentContainerStyle={styles.grid}
            ListEmptyComponent={<Text style={styles.placeholder}>No products found.</Text>}
          />
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item, index) => (item.transaction_id ? String(item.transaction_id) : String(index))}
            numColumns={1}
            key={'transactions'} // <-- Add a unique key for this layout
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.placeholder}>No transactions found.</Text>}
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
  vendorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  vendorImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  vendorEmail: {
    fontSize: 15,
    color: '#555',
  },
  tabBar: {
    width: windowWidth - 32,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    alignSelf: 'center',
    marginVertical: 12,
  },
  tabItem: {
    flex: 1,
    height: 40,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabItem: {
    backgroundColor: '#f8d307',
  },
  tabText: {
    color: '#222',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
  },
  grid: {
    padding: 10,
  },
  card: {
    width: windowWidth / 2 - 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 5,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: windowWidth / 2 - 40,
    borderRadius: 6,
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
  },
  description: {
    fontSize: 12,
    color: '#666',
  },
  discount: {
    fontSize: 12,
    color: '#d0021b',
    marginTop: 4,
    fontWeight: 'bold',
  },
  priceView: {
    flexDirection: 'row',
  },
  priceLable: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontWeight: 'bold',
  },
  offerPrice: {
    fontSize: 12,
    color: '#4caf50',
    marginTop: 4,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 12,
    color: '#d0021b',
    marginTop: 4,
    fontWeight: 'bold',
    marginLeft: 5,
    textDecorationLine: 'line-through',
  },
  placeholder: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
  },
  placeholderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  itemDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  itemVendor: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VendorDetailsScreen;
