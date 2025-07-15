import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
//import { Ionicons } from '@expo/vector-icons'; // or react-native-vector-icons/Ionicons
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme/colors';



const windowWidth = Dimensions.get('window').width;

const ProductdetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const product = route.params?.product;
  //Clipboard.setString("code");

  const [isModalVisible, setModalVisible] = useState(false);
  

  if (!product) return(
    <SafeAreaView style={styles.safeContainer}>

        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Product Details</Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
             <Text style={{alignSelf: 'center'}} >No product data</Text>;
        </View>

       
    </SafeAreaView>
  );
   

  return (
    <SafeAreaView style={styles.safeContainer}>

        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Product Details</Text>
        </View>

        <ScrollView style={styles.container}>
        

        {/* Image */}
        <Image
            source={{ uri: `https://crmgcc.net/uploads/${product.image}` }}
            style={styles.image}
        />

        {/* Title */}
        <Text style={styles.title}>{product.title}</Text>

        {/* Price */}
        <View style={styles.priceView}>
             <Text style={styles.priceLable}>Price: </Text>
             <Text style={styles.offerPrice}>{product.offer_price}</Text>
             <Text style={styles.price}>{product.price}</Text>
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* Terms */}
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <Text style={styles.terms}>
            - Valid until {new Date(product.end_date).toLocaleDateString()}
            {'\n'}- Discount code: {product.discount_code}
            {'\n'}- One-time use only
            {'\n'}- Cannot be combined with other offers
        </Text>

        {/* Redeem Now Button */}
        
        </ScrollView>
        
        <TouchableOpacity
        style={styles.redeemButton}
        onPress={() => setModalVisible(true)}
        >
            <Text style={styles.redeemButtonText}>Create a Lead</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProductdetailsScreen;


const styles = StyleSheet.create({
safeContainer: {
flex: 1,
backgroundColor: '#fff',
 padding: 16,
},
  container: {
    flex: 1,
    backgroundColor: '#fff',
   
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign:'center',
    width: windowWidth - 76
  },
  image: {
    width: '100%',
    height: windowWidth - 30,
    borderRadius: 8,
    marginBottom: 12,
    
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  terms: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  discountBox: {
    backgroundColor: '#f8d307',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  discountText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  redeemButton: {
    backgroundColor: '#f8d307',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 0,
  },
  redeemButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  discount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#d0021b',
    marginTop: 4,
  },

  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 10,
  width: '80%',
  alignItems: 'center',
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 20,
},
discountCodeText: {
  fontSize: 16,
  fontWeight: 'bold',
  marginVertical: 12,
},
copyButton: {
  backgroundColor: '#f8d307',
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 6,
  marginBottom: 15,
},
copyButtonText: {
  color: '#000',
  fontWeight: '600',
},
closeText: {
  color: '#888',
  marginTop: 10,
},
priceView:
  {
    flexDirection: 'row',
  },
  priceLable:
  {
    fontSize: 16,
    color: colors.label,
    marginTop: 4,
    fontWeight: 'bold',
  },
  offerPrice:
  {
    fontSize: 16,
    color: colors.green,
    marginTop: 4,
    fontWeight: 'bold',
  },
  price:
  {
    fontSize: 16,
    color: colors.text,
    marginTop: 4,
    fontWeight: 'bold',
    marginLeft: 5,
    textDecorationLine: 'line-through',
  },
});