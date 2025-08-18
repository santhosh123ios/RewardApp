import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal,Alert,
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';
//import { Ionicons } from '@expo/vector-icons'; // or react-native-vector-icons/Ionicons
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import Svg, { Circle } from 'react-native-svg';
import colors from '../theme/colors';
import ApiService from '../services/ApiService';

const windowWidth = Dimensions.get('window').width;

interface OfferCodeResponse {
  offer_id: number;
  user_id: number;
  encrypted_code: string;
  offer_details: any;
}

interface ApiResponse {
  result: {
    message: string;
    status: number;
    data: OfferCodeResponse;
  };
}

const OfferDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const offer = route.params?.offer;
  //Clipboard.setString("code");

  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<OfferCodeResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleRedeemNow = async () => {
    setIsLoading(true);
    setApiError(null);
    setApiResponse(null);
    
    try {
      const response = await ApiService('member/generate_offer_code', 'POST', {
        offer_id: offer.id
      });
      
      if (response && response.result && response.result.status === 1) {
        setApiResponse(response.result.data);
        setModalVisible(true);
      } else {
        setApiError(response?.message || 'Failed to generate offer code');
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error generating offer code:', error);
      setApiError('Network error occurred. Please try again.');
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!offer) return <Text>No offer data</Text>;

  return (
    <SafeAreaView style={styles.safeContainer}>

        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Offer Details</Text>
        </View>

        <ScrollView style={styles.container}>
        

        {/* Image */}
        <Image
            source={{ uri: `https://crmgcc.net/uploads/${offer.image}` }}
            style={styles.image}
        />

        {/* Title */}
        <Text style={styles.title}>{offer.title}</Text>

        {/* Discount */}
        <Text style={styles.discount}>Discount: {offer.discount}%</Text>

        {/* Description */}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{offer.description}</Text>

        {/* Terms */}
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <Text style={styles.terms}>
            - Valid until {new Date(offer.end_date).toLocaleDateString()}
            {'\n'}- Discount code: {offer.discount_code}
            {'\n'}- One-time use only
            {'\n'}- Cannot be combined with other offers
        </Text>

        {/* Redeem Now Button */}
        
        </ScrollView>
        
        <TouchableOpacity
        style={[styles.redeemButton, isLoading && styles.redeemButtonDisabled]}
        onPress={handleRedeemNow}
        disabled={isLoading}
        >
            <Text style={styles.redeemButtonText}>
              {isLoading ? 'Generating...' : 'Redeem Now'}
            </Text>
        </TouchableOpacity>

        <Modal visible={isModalVisible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      {apiError ? (
        // Error Modal
        <>
          <Icon name="close-circle" size={50} color="#ff4444" style={styles.errorIcon} />
          <Text style={styles.modalTitle}>Error</Text>
          <Text style={styles.errorMessage}>{apiError}</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </>
      ) : (
        // Success Modal
        <>
          <Text style={styles.modalTitle}>Scan this code</Text>

          {/* ✅ QR Code */}
          <QRCode value={apiResponse?.encrypted_code || 'DEFAULTCODE'} size={150} />

          <Text style={styles.discountCodeText}>{apiResponse?.encrypted_code}</Text>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => {
              Clipboard.setString(apiResponse?.encrypted_code || '');
              Alert.alert('Copied', 'Code copied to clipboard');
            }}
          >
            <Text style={styles.copyButtonText}>Copy Code</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
};

export default OfferDetailsScreen;


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
  redeemButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  redeemButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  discount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.green,
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
errorIcon: {
  marginBottom: 10,
},
errorMessage: {
  fontSize: 16,
  color: '#ff4444',
  textAlign: 'center',
  marginBottom: 20,
},
});