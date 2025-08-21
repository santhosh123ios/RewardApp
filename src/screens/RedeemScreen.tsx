import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import QRScanner from '../components/QRScanner';

const RedeemScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [cardNumber, setCardNumber] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanningFor, setScanningFor] = useState<'card' | 'offer' | undefined>(undefined);

  const handleOfferCheck = async () => {
    if (!cardNumber.trim() && !offerCode.trim()) {
      Alert.alert('Error', 'Please enter either a card number or offer code');
      return;
    }
    
    setIsLoading(true);
    try {
      // TODO: Implement offer check API call
      // const response = await ApiService('vendor/check_offer', 'POST', {
      //   card_number: cardNumber.trim(),
      //   offer_code: offerCode.trim()
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Offer check completed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to check offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePointCheck = async () => {
    if (!cardNumber.trim() && !offerCode.trim()) {
      Alert.alert('Error', 'Please enter either a card number or offer code');
      return;
    }
    
    setIsLoading(true);
    try {
      // TODO: Implement point check API call
      // const response = await ApiService('vendor/check_points', 'POST', {
      //   card_number: cardNumber.trim(),
      //   offer_code: offerCode.trim()
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Point check completed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to check points. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRCodeScan = (type: 'card' | 'offer') => {
    console.log('RedeemScreen: Opening QR scanner for', type);
    setScanningFor(type);
    setShowQRScanner(true);
  };

  const handleQRScanResult = (data: string) => {
    console.log('RedeemScreen: QR scan result received:', data, 'for type:', scanningFor);
    if (scanningFor === 'card') {
      setCardNumber(data);
    } else if (scanningFor === 'offer') {
      setOfferCode(data);
    }
    setShowQRScanner(false);
    setScanningFor(undefined);
  };

  const closeQRScanner = () => {
    setShowQRScanner(false);
    setScanningFor(undefined);
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redeem</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Enter Details</Text>
          
          {/* Card Number Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter card number"
                placeholderTextColor={colors.placeholder}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={styles.qrButton} 
                onPress={() => handleQRCodeScan('card')}
              >
                <Icon name="qr-code-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Offer Code Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Offer Code</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter offer code"
                placeholderTextColor={colors.placeholder}
                value={offerCode}
                onChangeText={setOfferCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity 
                style={styles.qrButton} 
                onPress={() => handleQRCodeScan('offer')}
              >
                <Icon name="qr-code-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* QR Code Scan Option */}
          <View style={styles.qrSection}>
            <Text style={styles.qrLabel}>Or scan QR code</Text>
            <TouchableOpacity 
              style={styles.qrScanButton} 
              onPress={() => handleQRCodeScan('card')}
            >
              <Icon name="qr-code" size={32} color={colors.primary} />
              <Text style={styles.qrScanText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.offerCheckButton]} 
            onPress={handleOfferCheck}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="checkmark-circle-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Offer Check</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.pointCheckButton]} 
            onPress={handlePointCheck}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="analytics-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Point Check</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>How to redeem:</Text>
          <View style={styles.instructionItem}>
            <Icon name="1" size={16} color={colors.primary} />
            <Text style={styles.instructionText}>Enter card number or scan QR code</Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="2" size={16} color={colors.primary} />
            <Text style={styles.instructionText}>Or enter offer code manually</Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="3" size={16} color={colors.primary} />
            <Text style={styles.instructionText}>Click Offer Check to validate</Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="4" size={16} color={colors.primary} />
            <Text style={styles.instructionText}>Click Point Check to see balance</Text>
          </View>
        </View>
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal
        visible={showQRScanner}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <QRScanner
          onScan={handleQRScanResult}
          onClose={closeQRScanner}
          scanningFor={scanningFor}
        />
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  qrButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  qrSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  qrLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  qrScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 25,
    backgroundColor: colors.surface,
    gap: 10,
  },
  qrScanText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  buttonSection: {
    marginBottom: 30,
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 10,
  },
  offerCheckButton: {
    backgroundColor: colors.primary,
  },
  pointCheckButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsSection: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
});

export default RedeemScreen;
