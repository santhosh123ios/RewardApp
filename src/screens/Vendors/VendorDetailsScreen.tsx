import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import globalStyles from '../../theme/globalStyles';
import ApiService from '../../services/ApiService';
import { AuthContext } from '../../context/AuthContext';
import colors from '../../theme/colors';

const windowWidth = Dimensions.get('window').width;
const tabs = ['Offer', 'Product', 'Trans', 'Leads'];
const dummyImg = require('../../../assets/dummy.jpg');

const statusMap = {
  '0': { color: 'orange', text: 'PENDING' },
  '1': { color: 'yellow', text: 'REVIEW' },
  '2': { color: 'paleturquoise', text: 'Processing' },
  '3': { color: 'green', text: 'DONE' },
  '4': { color: 'red', text: 'REJECTED' },
};

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
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'Offer') {
      fetchOffers();
    } else if (activeTab === 'Product') {
      fetchProducts();
    } else if (activeTab === 'Trans') {
      fetchTransactions();
    } else if (activeTab === 'Leads') {
      fetchLeads();
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

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const json = await ApiService('member/getleads', 'GET', null, logout);
      if (json?.result?.status === 1) {
        setLeads(json.result.data.filter((item: any) => String(item.vendor_id) === String(vendor.id)));
      } else {
        setLeads([]);
      }
    } catch (e) {
      setLeads([]);
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
      onPress={() => navigation.navigate('OfferDetails', { offer: item })}
      style={styles.card}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: `https://crmgcc.net/uploads/${item.image}` }}
        style={styles.image}
      />
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.discount}>Discount: {item.discount}%</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
      style={styles.card}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: `https://crmgcc.net/uploads/${item.image}` }}
        style={styles.image}
      />
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.priceView}>
        <Text style={styles.priceLable}>Price: </Text>
        <Text style={styles.offerPrice}>{item.offer_price}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTransaction = ({ item }: { item: any }) => (
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

  const renderLead = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('LeadDetails', { lead: item })}>
      <View style={styles.leadItem}>
        <Image
          source={item.vendor_image ? { uri: 'https://crmgcc.net/uploads/' + item.vendor_image } : dummyImg}
          style={styles.leadImage}
        />
        <View style={styles.leadInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.leadTitle}>{item.lead_name}</Text>
          </View>
          <Text style={styles.leadDescription}>{item.lead_description}</Text>
          <Text style={styles.leadDatetime}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.statusText, { color: statusMap[item.lead_status]?.color || 'gray' }]}> 
            {statusMap[item.lead_status]?.text || 'UNKNOWN'}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: statusMap[item.lead_status]?.color || 'gray' }]} />
        </View>
      </View>
    </TouchableOpacity>
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
            contentContainerStyle={styles.grid}
            ListEmptyComponent={<Text style={styles.placeholder}>No offers found.</Text>}
            key={'offers'}
          />
        ) : activeTab === 'Product' ? (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.grid}
            ListEmptyComponent={<Text style={styles.placeholder}>No products found.</Text>}
            key={'products'}
          />
        ) : activeTab === 'Trans' ? (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item, index) => (item.transaction_id ? String(item.transaction_id) : String(index))}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.placeholder}>No transactions found.</Text>}
            key={'trans'}
          />
        ) : (
          <FlatList
            data={leads}
            renderItem={renderLead}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.grid}
            ListEmptyComponent={<Text style={styles.placeholder}>No leads found.</Text>}
            key={'leads'}
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
    color: colors.label,
    marginTop: 4,
    fontWeight: 'bold',
  },
  offerPrice: {
    fontSize: 12,
    color: colors.green,
    marginTop: 4,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 12,
    color: colors.text,
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
  leadItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  leadImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  leadInfo: {
    flex: 1,
  },
  leadTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    color: '#222',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green',
    marginLeft: 6,
  },
  statusText: {
    fontSize: 13,
    color: 'green',
    fontWeight: '500',
  },
  leadDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  leadDatetime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default VendorDetailsScreen;
