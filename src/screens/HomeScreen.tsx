import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createGlobalStyles } from '../theme/globalStyles';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/ApiService';
import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

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
  const { colors, isDark, toggleTheme } = useTheme();
  const globalStyles = createGlobalStyles(colors);
  
  const [activeTab, setActiveTab] = useState('Offers');
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProd, setLoadingProd] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  
  // ScrollView ref for tab navigation
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (activeTab === 'Offers') {
      fetchOffers();
      // Scroll to first tab
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    } else if (activeTab === 'Products') {
      fetchProducts();
      // Scroll to second tab
      scrollViewRef.current?.scrollTo({ x: windowWidth, animated: true });
    }
  }, [activeTab]);

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
      onPress={() => (navigation as any).navigate('OfferDetails', { offer: item })}
      style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: `https://crmgcc.net/uploads/${item.image}` }}
        style={styles.image}
      />
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
      <Text style={[styles.discount, { color: colors.green }]}>Discount: {item.discount}%</Text>
    </TouchableOpacity>
  );

  const renderCardProduct = ({ item }: { item: ProductItem }) => (
    <TouchableOpacity
      onPress={() => (navigation as any).navigate('ProductDetails', { product: item })}
      style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: `https://crmgcc.net/uploads/${item.image}` }}
        style={styles.image}
      />
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
      <View style={styles.priceView}>
        <Text style={[styles.priceLable, { color: colors.label }]}>Price: </Text>
        <Text style={[styles.offerPrice, { color: colors.green }]}>{item.offer_price}</Text>
        <Text style={[styles.price, { color: colors.textSecondary }]}>{item.price}</Text>
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

  // Handle scroll to change tabs
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / windowWidth);
    
    if (page === 0 && activeTab !== 'Offers') {
      setActiveTab('Offers');
    } else if (page === 1 && activeTab !== 'Products') {
      setActiveTab('Products');
    }
  };

  // Handle tab press
  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    const tabIndex = tabs.indexOf(tab);
    scrollViewRef.current?.scrollTo({ x: tabIndex * windowWidth, animated: true });
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
      {/* Header with Theme Toggle */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reward Club</Text>
        <TouchableOpacity 
          style={[styles.themeToggle, { backgroundColor: colors.primary }]} 
          onPress={toggleTheme}
        >
          <Icon 
            name={isDark ? 'sunny' : 'moon'} 
            size={20} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Tab selector */}
      <View style={[styles.TabView, { backgroundColor: colors.surface }]}>
        <View style={[styles.tabBar, { backgroundColor: colors.surfaceVariant }]}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                activeTab === tab && [styles.activeTabItem, { backgroundColor: colors.primary }],
              ]}
              onPress={() => handleTabPress(tab)}
            >
              <Text style={[
                activeTab === tab ? styles.activeTabText : styles.tabText,
                { color: activeTab === tab ? colors.slelectedLabel : colors.label }
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        

      </View>

      {/* Swipeable Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.swipeContainer}
      >
        {/* Offers Page */}
        <View style={styles.pageContainer}>
          {/* Loader */}
          {loading && !refreshing && (
            <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          
          {/* Offers Grid */}
          <FlatList
            data={offers}
            renderItem={renderCard}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            contentContainerStyle={[styles.grid, { backgroundColor: colors.background }]}
            refreshing={refreshing}
            onRefresh={onRefresh}
            style={{ backgroundColor: colors.background }}
            scrollEnabled={false} // Disable vertical scroll in horizontal scroll view
          />
        </View>

        {/* Products Page */}
        <View style={styles.pageContainer}>
          {/* Loader */}
          {loadingProd && !refreshing && (
            <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          
          {/* Products Grid */}
          <FlatList
            data={products}
            renderItem={renderCardProduct}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            contentContainerStyle={[styles.grid, { backgroundColor: colors.background }]}
            refreshing={refreshing}
            onRefresh={onRefresh}
            style={{ backgroundColor: colors.background }}
            scrollEnabled={false} // Disable vertical scroll in horizontal scroll view
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    height: windowHeight - 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  container: {
    flex: 1,
  },
  TabView: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabBar: {
    width: 250,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
    // backgroundColor will be set dynamically
  },
  tabText: {
    fontWeight: '600',
  },
  activeTabText: {
    fontWeight: '700',
  },
  swipeContainer: {
    flex: 1,
  },
  pageContainer: {
    width: windowWidth,
    flex: 1,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
  },
  grid: {
    padding: 10,
  },
  card: {
    width: windowWidth / 2 - 20,
    borderRadius: 10,
    margin: 5,
    padding: 10,
    elevation: 2,
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
  },
  description: {
    fontSize: 12,
  },
  discount: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  priceView: {
    flexDirection: 'row',
  },
  priceLable: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  offerPrice: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 12,
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
