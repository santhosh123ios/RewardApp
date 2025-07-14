import React, { useState, useEffect } from 'react';
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


const windowWidth = Dimensions.get('window').width;
const tabs = ['Offers', 'Products'];

type OfferItem = {
  id: string;
  title: string;
  description: string;
  discount: string;
  image: string;
};

const offerData = [
  {
    id: '1',
    title: 'Summer Sale',
    description: 'Up to 50% off on all items',
    discount: '50%',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    title: 'Winter Deals',
    description: 'Buy 1 Get 1 Free',
    discount: 'BOGO',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '1',
    title: 'Summer Sale',
    description: 'Up to 50% off on all items',
    discount: '50%',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    title: 'Winter Deals',
    description: 'Buy 1 Get 1 Free',
    discount: 'BOGO',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '1',
    title: 'Summer Sale',
    description: 'Up to 50% off on all items',
    discount: '50%',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    title: 'Winter Deals',
    description: 'Buy 1 Get 1 Free',
    discount: 'BOGO',
    image: 'https://via.placeholder.com/150',
  },
  // Add more items...
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Offers');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  

  useEffect(() => {
    fetchOffers();
}, []);

// const fetchOffers = async () => {
//   try {
//     const response = await axios.get('https://crmgcc.net/api/member/get_all_offers');
//     const { data } = response.data.result;
//     setOffers(data);
//   } catch (error) {
//     console.error('Error fetching offers:', error);
//   } finally {
//     setLoading(false);
//   }
// };

const fetchOffers = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token'); // 👈 or your token key
    if (!token) {
      console.warn('No token found');
      return;
    }

    const response = await fetch('https://crmgcc.net/api/member/get_all_offers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // ✅ Pass token here
      },
    });

    const json = await response.json();

    if (json.result && json.result.status === 1) {
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

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Tab selector */}
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

      {/* Offers Grid */}
      {activeTab === 'Offers' && (
        loading ? (
          <ActivityIndicator size="large" color="#f8d307" />
        ) : (
          <FlatList
            data={offers}
            renderItem={renderCard}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.grid}
          />
        )
      )}

      {activeTab === 'Products' && (
        <View style={styles.placeholder}>
          <Text>Products tab coming soon...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeContainer: {
  flex: 1,
  backgroundColor: '#fff',
},
  container: {
    flex: 1,
    backgroundColor: '#fff',

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
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
