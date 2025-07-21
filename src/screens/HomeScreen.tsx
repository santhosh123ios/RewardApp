import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/ApiService';
import { AuthContext } from '../context/AuthContext';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const tabs = ['Offers', 'Products'];

type OfferItem = {
  id: string;
  title: string;
  description: string;
  discount: string;
  image: string;
};

type ProductItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  offer_price: string;
  image: string;
};

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Offers');
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProd, setLoadingProd] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  

  useEffect(() => {
    if (activeTab === 'Offers') {
      fetchOffers();
    } else if (activeTab === 'Products') {
      fetchProducts();
    }
  }, [activeTab]);

  // Refresh API data when switching tabs
  useEffect(() => {
    if (activeTab === 'Offers') {
      fetchOffers();
    } else if (activeTab === 'Products') {
      fetchProducts();
    }
  }, [activeTab]);

// const fetchOffers = async () => {
//   try {
//     const token = await AsyncStorage.getItem('auth_token'); // 👈 or your token key
//     if (!token) {
//       console.warn('No token found');
//       return;
//     }

//     const response = await fetch('https://crmgcc.net/api/member/get_all_offers', {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`, // ✅ Pass token here
//       },
//     });

//     const json = await response.json();

//     if (json.result && json.result.status === 1) {
//       setOffers(json.result.data);
//     } else {
//       console.warn('Failed to fetch offers');
//     }
//   } catch (error) {
//     console.error('Fetch error:', error);
//   } finally {
//     setLoading(false);
//   }
// };

const fetchOffers = async () => {
  setLoading(true);
  try {
    const json = await ApiService('member/get_all_offers', 'GET', null, logout);

    if (json?.result?.status === 1) {
      setOffers(json.result.data);
    } else {
      console.warn('Failed to fetch offers');
    }
  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    setLoading(false);
  }
};

const fetchProducts = async () => {
  setLoadingProd(true);
  try {
    const json = await ApiService('member/get_all_product', 'GET', null, logout);

    if (json?.result?.status === 1) {
      setProducts(json.result.data);
    } else {
      console.warn('Failed to fetch offers');
    }
  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    setLoadingProd(false);
  }
};

const renderCard = ({ item }: { item: OfferItem }) => (
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

const renderCardProduct = ({ item }: { item: ProductItem }) => (
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

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'Offers') {
      await fetchOffers();
    } else if (activeTab === 'Products') {
      await fetchProducts();
    }
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Tab selector */}
      <View style={styles.TabView}>
        <View style={styles.tabBar}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  activeTab === tab && styles.activeTabItem,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={activeTab === tab ? styles.activeTabText : styles.tabText}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      {/* Loader below the tab bar */}
      {((activeTab === 'Offers' && loading && !refreshing) || (activeTab === 'Products' && loadingProd && !refreshing)) && (
        <View style={{ justifyContent: 'center', alignItems: 'center', minHeight: 60 }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Offers Grid */}
      {activeTab === 'Offers' && (
        <FlatList
          data={offers}
          renderItem={renderCard}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      {activeTab === 'Products' && (
        <FlatList
          data={products}
          renderItem={renderCardProduct}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.grid}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeContainer: {
  backgroundColor: colors.white,
  height: windowHeight-50
},
  container: {
    flex: 1,
    backgroundColor: colors.white,

  },
  TabView: {
    height: 60,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    width: 250,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    alignSelf: 'center'
  },

  tabItem: {
    width: 125,
    height: 40,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabItem: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.label,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.slelectedLabel,
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
  priceView:
  {
    flexDirection: 'row',
  },
  priceLable:
  {
    fontSize: 12,
    color: colors.label,
    marginTop: 4,
    fontWeight: 'bold',
  },
  offerPrice:
  {
    fontSize: 12,
    color: colors.green,
    marginTop: 4,
    fontWeight: 'bold',
  },
  price:
  {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
    fontWeight: 'bold',
    marginLeft: 5,
    textDecorationLine: 'line-through',
  },

  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
