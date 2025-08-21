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
import ApiService from '../services/ApiService';

const RedeemScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [cardNumber, setCardNumber] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanningFor, setScanningFor] = useState<'card' | 'offer' | undefined>(undefined);
  const [offerValidityResult, setOfferValidityResult] = useState<any>(null);
  const [showOfferDetails, setShowOfferDetails] = useState(false);
  const [isApplyingOffer, setIsApplyingOffer] = useState(false);
  const [errorResponse, setErrorResponse] = useState<any>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [successResponse, setSuccessResponse] = useState<any>(null);
  const [showSuccessDetails, setShowSuccessDetails] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [memberPointsResult, setMemberPointsResult] = useState<any>(null);
  const [showMemberPoints, setShowMemberPoints] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState('');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showRedeemPinModal, setShowRedeemPinModal] = useState(false);
  const [redeemPin, setRedeemPin] = useState('');
  const [redeemPinError, setRedeemPinError] = useState('');

  const handleOfferCheck = async () => {
    if (!cardNumber.trim() && !offerCode.trim()) {
      Alert.alert('Error', 'Please enter either a card number or offer code');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await ApiService('vendor/offers_validity_check', 'POST', {
        offer_code: offerCode.trim()
      });
      
              if (response.result && response.result.status === 1) {
          setOfferValidityResult(response);
          setShowOfferDetails(true);
        } else {
          // Show error response in popup
          setErrorResponse(response);
          setShowErrorDetails(true);
        }
    } catch (error) {
      Alert.alert('Error', 'Failed to check offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePointCheckMember = async () => {
    if (!cardNumber.trim()) {
      Alert.alert('Error', 'Please enter a card number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService('vendor/check_member_points', 'POST', {
        card_no: cardNumber.trim()
      });
      
      if (response.result && response.result.status === 1) {
        setMemberPointsResult(response);
        setShowMemberPoints(true);
      } else if (response.error && response.error.length > 0) {
        // Handle error response format
        setErrorResponse(response);
        setShowErrorDetails(true);
      } else {
        // Fallback error
        setErrorResponse({
          status: 0,
          message: 'Failed to retrieve member points',
          error: 'Unknown error occurred'
        });
        setShowErrorDetails(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check member points. Please try again.');
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

  const handleApplyOffer = async () => {
    if (!offerValidityResult?.result?.data) {
      Alert.alert('Error', 'No offer data available');
      return;
    }

    setIsApplyingOffer(true);
    try {
      const payload = {
        offer_id: offerValidityResult.result.data.offer_id,
        user_id: offerValidityResult.result.data.user_id,
        notes: `Offer applied via PIN verification on ${new Date().toLocaleString()}`
      };

      const response = await ApiService('vendor/mark_offer_as_used', 'POST', payload);
      
              if (response.result && response.result.status === 1) {
          setSuccessResponse(response);
          setShowSuccessDetails(true);
          setShowOfferDetails(false);
          setOfferValidityResult(null);
          setOfferCode('');
        } else {
          // Show error response in popup
          setErrorResponse(response);
          setShowErrorDetails(true);
        }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply offer. Please try again.');
    } finally {
      setIsApplyingOffer(false);
    }
  };

  const closeOfferDetails = () => {
    setShowOfferDetails(false);
    setOfferValidityResult(null);
  };

  const closeErrorDetails = () => {
    setShowErrorDetails(false);
    setErrorResponse(null);
  };

  const closeSuccessDetails = () => {
    setShowSuccessDetails(false);
    setSuccessResponse(null);
  };

  const openPinModal = () => {
    setShowPinModal(true);
    setPin('');
    setPinError('');
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setPin('');
    setPinError('');
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      setPinError('Please enter a 4-digit PIN');
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setPinError('PIN must contain only numbers');
      return;
    }

    setPinError('');
    closePinModal();
    
    // Now call the apply API
    await handleApplyOffer();
  };

  const handlePointCheck = async () => {
    if (!cardNumber.trim()) {
      Alert.alert('Error', 'Please enter a card number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService('vendor/check_member_points', 'POST', {
        card_number: cardNumber.trim()
      });
      
      if (response.result && response.result.status === 1) {
        setMemberPointsResult(response);
        setShowMemberPoints(true);
      } else {
        // Show error response in popup
        setErrorResponse(response);
        setShowErrorDetails(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check member points. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openRedeemModal = () => {
    setShowRedeemModal(true);
    setRedeemPoints('');
  };

  const closeRedeemModal = () => {
    setShowRedeemModal(false);
    setRedeemPoints('');
  };

  const handleRedeemPoints = async () => {
    if (!redeemPoints.trim()) {
      Alert.alert('Error', 'Please enter the number of points to redeem');
      return;
    }

    if (isNaN(Number(redeemPoints))) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    const pointsToRedeem = Number(redeemPoints);
    if (pointsToRedeem <= 0) {
      Alert.alert('Error', 'Points must be greater than 0');
      return;
    }

    const availablePoints = memberPointsResult?.result?.data?.available_points || 0;
    if (availablePoints < pointsToRedeem) {
      Alert.alert(
        'Insufficient Points', 
        `You only have ${availablePoints} points available. Cannot redeem ${pointsToRedeem} points.`
      );
      return;
    }

    // Show PIN modal instead of direct redemption
    setShowRedeemModal(false);
    setShowRedeemPinModal(true);
  };

  const handleRedeemPinSubmit = async () => {
    if (redeemPin.length !== 4) {
      setRedeemPinError('Please enter a 4-digit PIN');
      return;
    }
    
    setRedeemPinError('');
    setIsRedeeming(true);
    
    try {
      // Validate and format the request data
      if (!cardNumber.trim()) {
        setRedeemPinError('Card number is required');
        setIsRedeeming(false);
        return;
      }

      if (!redeemPoints || isNaN(Number(redeemPoints)) || Number(redeemPoints) <= 0) {
        setRedeemPinError('Please enter a valid number of points');
        setIsRedeeming(false);
        return;
      }

      // Check if we have member data
      const memberId = memberPointsResult?.result?.data?.user_id || memberPointsResult?.result?.data?.member_id;
      if (!memberId) {
        setRedeemPinError('Member information not available. Please check member points first.');
        setIsRedeeming(false);
        return;
      }
      
      console.log('Member ID found:', memberId);
      console.log('Member data structure:', memberPointsResult?.result?.data);

      const requestData = {
        member_id: memberId,
        transaction_point: Number(redeemPoints),
        transaction_title: redeemPin
      };

      console.log('Redeem API Request Data:', requestData);
      console.log('API Endpoint: vendor/redeem_member_points');
      console.log('Data Types:', {
        member_id: typeof requestData.member_id,
        transaction_point: typeof requestData.transaction_point,
        transaction_title: typeof requestData.transaction_title
      });
      
      // Log the exact JSON that will be sent
      const requestBody = JSON.stringify(requestData);
      console.log('Request Body JSON:', requestBody);
      console.log('Request Body Length:', requestBody.length);

      console.log('Making API call to:', 'vendor/redeem_member_points');
      console.log('Full URL will be:', 'https://crmgcc.net/api/vendor/redeem_member_points');
      
      // Try to make the API call
      let response;
      try {
        // Try the original endpoint first
        response = await ApiService('vendor/redeem_member_points', 'POST', requestData);
      } catch (apiError) {
        console.error('API Service Error with vendor/redeem_member_points:', apiError);
        
        // Try alternative endpoint format
        try {
          console.log('Trying alternative endpoint: vendor/redeem-member-points');
          response = await ApiService('vendor/redeem-member-points', 'POST', requestData);
        } catch (altApiError) {
          console.error('Alternative endpoint also failed:', altApiError);
          throw apiError; // Throw the original error
        }
      }
      
      console.log('Redeem API Response:', response);
      console.log('Response status check:', response?.result?.status);
      
      if (response?.result?.status === 1) {
        // Show success message in popup
        setSuccessResponse({
          result: {
            message: `Successfully redeemed ${redeemPoints} points!`,
            data: {
              redeemed_points: redeemPoints,
              member_id: memberId,
              transaction_title: redeemPin
            }
          }
        });
        setShowSuccessDetails(true);
        
        // Close modals and reset state
        setShowRedeemPinModal(false);
        setRedeemPin('');
        setRedeemPoints('');
        setIsRedeeming(false);
        setShowMemberPoints(false);
        setMemberPointsResult(null);
        setCardNumber('');
      } else {
        // Handle error response
        console.log('API Error Response:', response);
        if (response?.error && Array.isArray(response.error) && response.error.length > 0) {
          const errorMessage = response.error[0].message || 'Redemption failed';
          console.log('Error Message:', errorMessage);
          setRedeemPinError(errorMessage);
        } else if (response?.result?.message) {
          console.log('Result Message:', response.result.message);
          setRedeemPinError(response.result.message);
        } else {
          console.log('Generic error - no specific error message');
          setRedeemPinError('Redemption failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Redemption error:', error);
      setRedeemPinError('Failed to redeem points. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
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
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Card Number</Text>
              {cardNumber.trim() && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setCardNumber('')}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.textInput,
                  offerCode.trim() && styles.disabledInput
                ]}
                placeholder="Enter card number"
                placeholderTextColor={colors.placeholder}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                editable={!offerCode.trim()}
              />
              <TouchableOpacity 
                style={[
                  styles.qrButton,
                  offerCode.trim() && styles.disabledButton
                ]} 
                onPress={() => handleQRCodeScan('card')}
                disabled={!!offerCode.trim()}
              >
                <Icon 
                  name="qr-code-outline" 
                  size={24} 
                  color={offerCode.trim() ? colors.textSecondary : colors.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Offer Code Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Offer Code</Text>
              {offerCode.trim() && (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setOfferCode('')}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.textInput,
                  cardNumber.trim() && styles.disabledInput
                ]}
                placeholder="Enter offer code"
                placeholderTextColor={colors.placeholder}
                value={offerCode}
                onChangeText={setOfferCode}
                autoCapitalize="characters"
                editable={!cardNumber.trim()}
              />
              <TouchableOpacity 
                style={[
                  styles.qrButton,
                  cardNumber.trim() && styles.disabledButton
                ]} 
                onPress={() => handleQRCodeScan('offer')}
                disabled={!!cardNumber.trim()}
              >
                <Icon 
                  name="qr-code-outline" 
                  size={24} 
                  color={cardNumber.trim() ? colors.textSecondary : colors.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.offerCheckButton]} 
            //onPress={handleOfferCheck}
            onPress={!cardNumber.trim()? handleOfferCheck: handlePointCheckMember}
            
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="checkmark-circle-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Check</Text>
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
          
          {/* Debug Section */}
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>Card Number: {cardNumber || 'Not entered'}</Text>
            <Text style={styles.debugText}>Member ID: {memberPointsResult?.result?.data?.user_id || memberPointsResult?.result?.data?.member_id || 'Not available'}</Text>
            <Text style={styles.debugText}>Redeem Points: {redeemPoints || 'Not entered'}</Text>
            <Text style={styles.debugText}>PIN Length: {redeemPin.length}/4</Text>
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

      {/* Offer Details Modal */}
      <Modal
        visible={showOfferDetails}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Offer Details</Text>
              <TouchableOpacity onPress={closeOfferDetails}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {offerValidityResult?.result?.data && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Member Name:</Text>
                  <Text style={styles.modalDetailValue}>{offerValidityResult.result.data.member_name}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Offer Title:</Text>
                  <Text style={styles.modalDetailValue}>{offerValidityResult.result.data.offer_title}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Description:</Text>
                  <Text style={styles.modalDetailValue}>{offerValidityResult.result.data.offer_description}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Discount Code:</Text>
                  <Text style={styles.modalDetailValue}>{offerValidityResult.result.data.discount_code}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Discount:</Text>
                  <Text style={styles.modalDetailValue}>{offerValidityResult.result.data.discount}%</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Vendor:</Text>
                  <Text style={styles.modalDetailValue}>{offerValidityResult.result.data.vendor_name}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Start Date:</Text>
                  <Text style={styles.modalDetailValue}>{new Date(offerValidityResult.result.data.start_date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>End Date:</Text>
                  <Text style={styles.modalDetailValue}>{new Date(offerValidityResult.result.data.end_date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Status:</Text>
                  <Text style={[styles.modalDetailValue, { color: offerValidityResult.result.data.is_valid ? '#4caf50' : '#f44336' }]}>
                    {offerValidityResult.result.data.is_valid ? 'Valid' : 'Invalid'}
                  </Text>
                </View>
              </ScrollView>
            )}
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={closeOfferDetails}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.applyButton]} 
                onPress={openPinModal}
                disabled={isApplyingOffer}
              >
                {isApplyingOffer ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.applyButtonText}>Apply Offer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
                  </View>
        </Modal>

        {/* Error Response Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showErrorDetails}
          onRequestClose={closeErrorDetails}
        >
          <View style={styles.errorModalOverlay}>
            <View style={styles.errorModalContent}>
              {/* Error Icon and Title */}
              <View style={styles.errorHeader}>
                <View style={styles.errorIconContainer}>
                  <Icon name="alert-circle" size={48} color="#ff4757" />
                </View>
                <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
                <TouchableOpacity style={styles.errorCloseButton} onPress={closeErrorDetails}>
                  <Icon name="close" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              {/* Error Content */}
              {errorResponse && (
                <View style={styles.errorContent}>
                  {errorResponse.message && (
                    <View style={styles.errorMessageContainer}>
                      <View style={styles.errorMessageHeader}>
                        <Icon name="information-circle-outline" size={20} color="#ff6b6b" />
                        <Text style={styles.errorMessageTitle}>Error Message</Text>
                      </View>
                      <Text style={styles.errorMessageText}>{errorResponse.message}</Text>
                    </View>
                  )}
                  
                  {errorResponse.error && Array.isArray(errorResponse.error) && errorResponse.error.length > 0 && (
                    <View style={styles.errorDetailsContainer}>
                      <View style={styles.errorDetailsHeader}>
                        <Icon name="bug-outline" size={20} color="#ff6b6b" />
                        <Text style={styles.errorDetailsTitle}>Error Details</Text>
                      </View>
                      {errorResponse.error.map((err: any, index: number) => (
                        <Text key={index} style={[styles.errorDetailsText, { marginTop: index > 0 ? 5 : 0 }]}>
                          {err.message}
                        </Text>
                      ))}
                    </View>
                  )}
                  {errorResponse.error && typeof errorResponse.error === 'string' && (
                    <View style={styles.errorDetailsContainer}>
                      <View style={styles.errorDetailsHeader}>
                        <Icon name="bug-outline" size={20} color="#ff6b6b" />
                        <Text style={styles.errorDetailsTitle}>Technical Details</Text>
                      </View>
                      <Text style={styles.errorDetailsText}>{errorResponse.error}</Text>
                    </View>
                  )}
                  
                  
                </View>
              )}
              
              {/* Action Buttons */}
              <View style={styles.errorFooter}>
                <TouchableOpacity 
                  style={styles.errorRetryButton} 
                  onPress={closeErrorDetails}
                >
                  <Icon name="refresh" size={18} color="#fff" />
                  <Text style={styles.errorRetryText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.errorCloseButtonFooter} 
                  onPress={closeErrorDetails}
                >
                  <Text style={styles.errorCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Success Response Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSuccessDetails}
          onRequestClose={closeSuccessDetails}
        >
          <View style={styles.successModalOverlay}>
            <View style={styles.successModalContent}>
              {/* Success Icon and Title */}
              <View style={styles.successHeader}>
                <View style={styles.successIconContainer}>
                  <Icon name="checkmark-circle" size={48} color="#2ed573" />
                </View>
                <Text style={styles.successTitle}>Points Redeemed Successfully!</Text>
                <TouchableOpacity style={styles.successCloseButton} onPress={closeSuccessDetails}>
                  <Icon name="close" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              {/* Success Content */}
              {successResponse && (
                <View style={styles.successContent}>
                  <View style={styles.successMessageContainer}>
                    <View style={styles.successMessageHeader}>
                      <Icon name="gift" size={20} color="#2ed573" />
                      <Text style={styles.successMessageTitle}>Redemption Successful!</Text>
                    </View>
                    <Text style={styles.successMessageText}>
                      {successResponse.result?.message || 'Points have been successfully redeemed!'}
                    </Text>
                  </View>
                  
                  {successResponse.result?.data && (
                    <View style={styles.successDetailsContainer}>
                      <View style={styles.successDetailsHeader}>
                        <Icon name="checkmark-circle-outline" size={20} color="#2ed573" />
                        <Text style={styles.successDetailsTitle}>Transaction Details</Text>
                      </View>
                      
                      <View style={styles.successDetailRow}>
                        <Text style={styles.successDetailLabel}>Points Redeemed:</Text>
                        <Text style={styles.successDetailValue}>
                          {successResponse.result.data.redeemed_points} pts
                        </Text>
                      </View>
                      
                      <View style={styles.successDetailRow}>
                        <Text style={styles.successDetailLabel}>Member ID:</Text>
                        <Text style={styles.successDetailValue}>
                          {successResponse.result.data.member_id}
                        </Text>
                      </View>
                      
                      <View style={styles.successDetailRow}>
                        <Text style={styles.successDetailLabel}>Transaction ID:</Text>
                        <Text style={styles.successDetailValue}>
                          {successResponse.result.data.transaction_title}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
              
              {/* Action Buttons */}
              <View style={styles.successFooter}>
                <TouchableOpacity 
                  style={styles.successDoneButton} 
                  onPress={closeSuccessDetails}
                >
                  <Icon name="checkmark" size={18} color="#fff" />
                  <Text style={styles.successDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* PIN Entry Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showPinModal}
          onRequestClose={closePinModal}
        >
          <View style={styles.pinModalOverlay}>
            <View style={styles.pinModalContent}>
              {/* PIN Header */}
              <View style={styles.pinHeader}>
                <View style={styles.pinIconContainer}>
                  <Icon name="lock-closed" size={48} color="#3498db" />
                </View>
                <Text style={styles.pinTitle}>Enter 4-Digit PIN</Text>
                <Text style={styles.pinSubtitle}>Please enter your PIN to apply this offer</Text>
                <TouchableOpacity style={styles.pinCloseButton} onPress={closePinModal}>
                  <Icon name="close" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              {/* PIN Input */}
              <View style={styles.pinContent}>
                <View style={styles.pinInputContainer}>
                  <TextInput
                    style={styles.pinInput}
                    value={pin}
                    onChangeText={(text) => {
                      setPin(text.replace(/[^0-9]/g, '').slice(0, 4));
                      setPinError('');
                    }}
                    placeholder="0000"
                    placeholderTextColor={colors.border}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry={false}
                    textAlign="center"
                    autoFocus={true}
                  />
                </View>
                
                {pinError ? (
                  <Text style={styles.pinErrorText}>{pinError}</Text>
                ) : null}
                
                <Text style={styles.pinHint}>
                  Enter exactly 4 digits to proceed
                </Text>
              </View>
              
              {/* PIN Action Buttons */}
              <View style={styles.pinFooter}>
                <TouchableOpacity 
                  style={styles.pinCancelButton} 
                  onPress={closePinModal}
                >
                  <Text style={styles.pinCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.pinSubmitButton} 
                  onPress={handlePinSubmit}
                  disabled={pin.length !== 4}
                >
                  <Text style={styles.pinSubmitText}>Submit PIN</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Member Points Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showMemberPoints}
          onRequestClose={() => setShowMemberPoints(false)}
        >
          <View style={styles.memberPointsModalOverlay}>
            <View style={styles.memberPointsModalContent}>
              {/* Member Points Header */}
              <View style={styles.memberPointsHeader}>
                <View style={styles.memberPointsIconContainer}>
                  <Icon name="card" size={40} color="#f1c40f" />
                </View>
                <Text style={styles.memberPointsTitle}>Member Details</Text>
                <TouchableOpacity style={styles.memberPointsCloseButton} onPress={() => setShowMemberPoints(false)}>
                  <Icon name="close" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              {/* Member Points Content - Scrollable */}
              {memberPointsResult?.result?.data && (
                <ScrollView 
                  style={styles.memberPointsContent}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.memberPointsContentContainer}
                >
                  
                  
                                      {/* Member Details Section */}
                    <View style={styles.memberDetailsSection}>
                      <Text style={styles.sectionTitle}>Member Information</Text>
                      
                      {/* Member Name */}
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <Icon name="person" size={20} color="#f1c40f" />
                        </View>
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>Member Name</Text>
                          <Text style={styles.detailValue}>{memberPointsResult.result.data.member_name || 'N/A'}</Text>
                        </View>
                      </View>
                      
                      {/* Available Points */}
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <Icon name="star" size={20} color="#f1c40f" />
                        </View>
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>Available Points</Text>
                          <Text style={styles.detailValue}>{memberPointsResult.result.data.available_points || '0'}</Text>
                        </View>
                      </View>
                      
                      {/* Member Status */}
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <Icon name="person-circle" size={20} color="#f1c40f" />
                        </View>
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>Member Status</Text>
                          <Text style={styles.detailValue}>
                            {memberPointsResult.result.data.member_status === 1 ? 'Active' : 'Inactive'}
                          </Text>
                        </View>
                      </View>
                      
                      {/* Member Number */}
                      <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                          <Icon name="call" size={20} color="#f1c40f" />
                        </View>
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>Member Number</Text>
                          <Text style={styles.detailValue}>{memberPointsResult.result.data.member_number || 'N/A'}</Text>
                        </View>
                      </View>
                    </View>
                </ScrollView>
              )}
              
              {/* Action Buttons */}
              <View style={styles.memberPointsFooter}>
                <TouchableOpacity 
                  style={styles.redeemButton} 
                  onPress={openRedeemModal}
                >
                  <Icon name="gift" size={18} color="#fff" />
                  <Text style={styles.redeemButtonText}>Redeem Points</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Redeem Points Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showRedeemModal}
          onRequestClose={closeRedeemModal}
        >
          <View style={styles.redeemModalOverlay}>
            <View style={styles.redeemModalContent}>
              {/* Redeem Header */}
              <View style={styles.redeemHeader}>
                {/* <View style={styles.redeemIconContainer}>
                  <Icon name="gift" size={48} color="#f1c40f" />
                </View> */}
                <Text style={styles.redeemTitle}>Redeem Points</Text>
                <Text style={styles.redeemSubtitle}>Enter the number of points you want to redeem</Text>
                <TouchableOpacity style={styles.redeemCloseButton} onPress={closeRedeemModal}>
                  <Icon name="close" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              {/* Redeem Input */}
              <View style={styles.redeemContent}>
                <View style={styles.redeemInputContainer}>
                  {/* <Text style={styles.redeemInputLabel}>Points to Redeem</Text> */}
                  <TextInput
                    style={[
                      styles.redeemInput,
                      redeemPoints && !isNaN(Number(redeemPoints)) && Number(redeemPoints) > 0 && 
                      Number(redeemPoints) <= (memberPointsResult?.result?.data?.available_points || 0) 
                        ? styles.validInput 
                        : redeemPoints && (isNaN(Number(redeemPoints)) || Number(redeemPoints) <= 0 || 
                          Number(redeemPoints) > (memberPointsResult?.result?.data?.available_points || 0))
                        ? styles.invalidInput
                        : null
                    ]}
                    value={redeemPoints}
                    onChangeText={setRedeemPoints}
                    placeholder="Enter points"
                    placeholderTextColor={colors.border}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                
                {/* Available Points Display */}
                <View style={styles.availablePointsContainer}>
                  <View style={styles.availablePointsRow}>
                    <Icon name="star" size={16} color="#f1c40f" />
                    <Text style={styles.availablePointsLabel}>Available Points:</Text>
                    <Text style={styles.availablePointsValue}>
                      {memberPointsResult?.result?.data?.available_points || '0'} pts
                    </Text>
                  </View>
                </View>
                
                {/* Validation Messages */}
                {redeemPoints && (
                  <View style={styles.validationContainer}>
                    {isNaN(Number(redeemPoints)) ? (
                      <View style={styles.validationError}>
                        <Icon name="close-circle" size={16} color="#e74c3c" />
                        <Text style={styles.validationErrorText}>Please enter a valid number</Text>
                      </View>
                    ) : Number(redeemPoints) <= 0 ? (
                      <View style={styles.validationError}>
                        <Icon name="close-circle" size={16} color="#e74c3c" />
                        <Text style={styles.validationErrorText}>Points must be greater than 0</Text>
                      </View>
                    ) : Number(redeemPoints) > (memberPointsResult?.result?.data?.available_points || 0) ? (
                      <View style={styles.validationError}>
                        <Icon name="close-circle" size={16} color="#e74c3c" />
                        <Text style={styles.validationErrorText}>
                          Insufficient points. You only have {memberPointsResult?.result?.data?.available_points || '0'} points available.
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.validationSuccess}>
                        <Icon name="checkmark-circle" size={16} color="#2ed573" />
                        <Text style={styles.validationSuccessText}>
                          Valid amount: {redeemPoints} points
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                
                {/* Points Summary */}
                {redeemPoints && !isNaN(Number(redeemPoints)) && Number(redeemPoints) > 0 && 
                 Number(redeemPoints) <= (memberPointsResult?.result?.data?.available_points || 0) && (
                  <View style={styles.pointsSummaryContainer}>
                    <View style={styles.pointsSummaryRow}>
                      <Text style={styles.pointsSummaryLabel}>After Redemption:</Text>
                      <Text style={styles.pointsSummaryValue}>
                        {(memberPointsResult?.result?.data?.available_points || 0) - Number(redeemPoints)} pts
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              
              {/* Redeem Action Buttons */}
              <View style={styles.redeemFooter}>
                <TouchableOpacity 
                  style={styles.redeemCancelButton} 
                  onPress={closeRedeemModal}
                >
                  <Text style={styles.redeemCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.redeemSubmitButton,
                    (!redeemPoints.trim() || isNaN(Number(redeemPoints)) || 
                     Number(redeemPoints) <= 0 || 
                     Number(redeemPoints) > (memberPointsResult?.result?.data?.available_points || 0))
                      ? styles.disabledButton
                      : null
                  ]} 
                  onPress={handleRedeemPoints}
                  disabled={
                    isRedeeming || 
                    !redeemPoints.trim() || 
                    isNaN(Number(redeemPoints)) || 
                    Number(redeemPoints) <= 0 || 
                    Number(redeemPoints) > (memberPointsResult?.result?.data?.available_points || 0)
                  }
                >
                  {isRedeeming ? (
                    <Text style={styles.redeemSubmitText}>Redeeming...</Text>
                  ) : (
                    <Text style={styles.redeemSubmitText}>Redeem</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Redeem PIN Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showRedeemPinModal}
          onRequestClose={() => setShowRedeemPinModal(false)}
        >
          <View style={styles.redeemPinModalOverlay}>
            <View style={styles.redeemPinModalContent}>
              {/* PIN Header */}
              <View style={styles.redeemPinHeader}>
                <View style={styles.redeemPinIconContainer}>
                  <Icon name="lock-closed" size={48} color="#f1c40f" />
                </View>
                <Text style={styles.redeemPinTitle}>Enter PIN</Text>
                <Text style={styles.redeemPinSubtitle}>Enter 4-digit PIN to confirm redemption</Text>
                <TouchableOpacity style={styles.redeemPinCloseButton} onPress={() => setShowRedeemPinModal(false)}>
                  <Icon name="close" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              {/* PIN Input */}
              <View style={styles.redeemPinContent}>
                <View style={styles.redeemPinInputContainer}>
                  <Text style={styles.redeemPinInputLabel}>4-Digit PIN</Text>
                  <TextInput
                    style={styles.redeemPinInput}
                    value={redeemPin}
                    onChangeText={setRedeemPin}
                    placeholder="Enter 4-digit PIN"
                    placeholderTextColor={colors.border}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry={false}
                  />
                  {redeemPinError ? (
                    <Text style={styles.redeemPinErrorText}>{redeemPinError}</Text>
                  ) : null}
                </View>
                
                <Text style={styles.redeemPinHint}>
                  Points to redeem: {redeemPoints} points
                </Text>
              </View>
              
              {/* PIN Action Buttons */}
              <View style={styles.redeemPinFooter}>
                <TouchableOpacity 
                  style={styles.redeemPinCancelButton} 
                  onPress={() => setShowRedeemPinModal(false)}
                >
                  <Text style={styles.redeemPinCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.redeemPinSubmitButton} 
                  onPress={handleRedeemPinSubmit}
                  disabled={redeemPin.length !== 4 || isRedeeming}
                >
                  {isRedeeming ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.redeemPinSubmitText}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    marginBottom: 20,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.error || '#ff4444',
    borderRadius: 12,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
  disabledInput: {
    opacity: 0.5,
    backgroundColor: colors.disabled || 'rgba(128, 128, 128, 0.1)',
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: colors.disabled || 'rgba(128, 128, 128, 0.1)',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
      modalDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 15,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
      modalDetailLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      flex: 1,
    },
    modalDetailValue: {
      fontSize: 14,
      color: colors.text,
      flex: 2,
      textAlign: 'right',
    },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
      applyButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    
    // Error Modal Styles
    errorModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorModalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 15,
    },
    errorHeader: {
      alignItems: 'center',
      paddingTop: 30,
      paddingHorizontal: 20,
      paddingBottom: 20,
      position: 'relative',
    },
    errorIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 71, 87, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 5,
    },
    errorCloseButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContent: {
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    errorMessageContainer: {
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: '#ff6b6b',
    },
    errorMessageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    errorMessageTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ff6b6b',
      marginLeft: 8,
    },
    errorMessageText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
    errorDetailsContainer: {
      backgroundColor: 'rgba(255, 107, 107, 0.05)',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: 'rgba(255, 107, 107, 0.2)',
    },
    errorDetailsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    errorDetailsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ff6b6b',
      marginLeft: 8,
    },
    errorDetailsText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 20,
      fontFamily: 'monospace',
    },
    errorStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(255, 107, 107, 0.05)',
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
    },
    errorStatusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    errorStatusTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ff6b6b',
      marginLeft: 8,
    },
    errorStatusBadge: {
      backgroundColor: '#ff4757',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      minWidth: 50,
      alignItems: 'center',
    },
    errorStatusText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    errorFooter: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 20,
      paddingTop: 10,
      gap: 12,
    },
    errorRetryButton: {
      flex: 1,
      backgroundColor: '#ff6b6b',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#ff6b6b',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    errorRetryText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    errorCloseButtonFooter: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorCloseText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    
    // Success Modal Styles
    successModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    successModalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 15,
    },
    successHeader: {
      alignItems: 'center',
      paddingTop: 30,
      paddingHorizontal: 20,
      paddingBottom: 20,
      position: 'relative',
    },
    successIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(46, 213, 115, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    successTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 5,
    },
    successCloseButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    successContent: {
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    successMessageContainer: {
      backgroundColor: 'rgba(46, 213, 115, 0.1)',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: '#2ed573',
    },
    successMessageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    successMessageTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#2ed573',
      marginLeft: 8,
    },
    successMessageText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 22,
    },
    successDetailsContainer: {
      backgroundColor: 'rgba(46, 213, 115, 0.05)',
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: 'rgba(46, 213, 115, 0.2)',
    },
    successDetailsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    successDetailsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#2ed573',
      marginLeft: 8,
    },
    successDetailsText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 20,
    },
    successDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      paddingVertical: 4,
    },
    successDetailLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      flex: 1,
    },
    successDetailValue: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      textAlign: 'right',
    },
    successStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(46, 213, 115, 0.05)',
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
    },
    successStatusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    successStatusTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#2ed573',
      marginLeft: 8,
    },
    successStatusBadge: {
      backgroundColor: '#2ed573',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      minWidth: 50,
      alignItems: 'center',
    },
    successStatusText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    successFooter: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      paddingTop: 10,
    },
    successDoneButton: {
      backgroundColor: '#2ed573',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#2ed573',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    successDoneText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    
    // PIN Modal Styles
    pinModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    pinModalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 15,
    },
    pinHeader: {
      alignItems: 'center',
      paddingTop: 30,
      paddingHorizontal: 20,
      paddingBottom: 20,
      position: 'relative',
    },
    pinIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    pinTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    pinSubtitle: {
      fontSize: 16,
      color: colors.textSecondary || colors.text,
      textAlign: 'center',
      opacity: 0.8,
      lineHeight: 22,
    },
    pinCloseButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pinContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      alignItems: 'center',
    },
    pinInputContainer: {
      width: '100%',
      marginBottom: 20,
    },
    pinInput: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      backgroundColor: colors.border,
      borderRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 20,
      textAlign: 'center',
      letterSpacing: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    pinErrorText: {
      color: '#e74c3c',
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 15,
      textAlign: 'center',
    },
    pinHint: {
      color: colors.textSecondary || colors.text,
      fontSize: 14,
      opacity: 0.7,
      textAlign: 'center',
      lineHeight: 20,
    },
    pinFooter: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 20,
      paddingTop: 10,
      gap: 12,
    },
    pinCancelButton: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pinCancelText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    pinSubmitButton: {
      flex: 1,
      backgroundColor: '#3498db',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#3498db',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    pinSubmitText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    
    // Member Points Modal Styles
    memberPointsModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    memberPointsModalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 15,
    },
    memberPointsHeader: {
      alignItems: 'center',
      paddingTop: 30,
      paddingHorizontal: 20,
      paddingBottom: 20,
      position: 'relative',
    },
    memberPointsIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(241, 196, 15, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    memberPointsTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 5,
    },
    memberPointsCloseButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    memberPointsContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    memberPointsContentContainer: {
      paddingBottom: 20,
    },
    pointsSummaryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(241, 196, 15, 0.1)',
      borderRadius: 16,
      padding: 20,
      marginBottom: 25,
      borderWidth: 1,
      borderColor: 'rgba(241, 196, 15, 0.2)',
    },
    pointsIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(241, 196, 15, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    pointsInfoContainer: {
      flex: 1,
    },
    pointsLabel: {
      fontSize: 14,
      color: '#f1c40f',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    pointsValue: {
      fontSize: 28,
      fontWeight: '700',
      color: '#f1c40f',
    },
    statusBadge: {
      backgroundColor: '#f1c40f',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      minWidth: 80,
      alignItems: 'center',
    },
    statusText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    
    // Member Details Styles
    memberDetailsSection: {
      backgroundColor: 'rgba(241, 196, 15, 0.05)',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(241, 196, 15, 0.1)',
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: 'rgba(241, 196, 15, 0.05)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(241, 196, 15, 0.1)',
    },
    detailIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(241, 196, 15, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    detailContent: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 12,
      color: '#f1c40f',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    detailValue: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
      lineHeight: 20,
    },
    memberPointsFooter: {
      paddingHorizontal: 20,
      paddingVertical: 20,
      paddingTop: 10,
    },
    redeemButton: {
      backgroundColor: '#f1c40f',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#f1c40f',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    redeemButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    
    // Redeem Points Modal Styles
    redeemModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    redeemModalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 15,
    },
    redeemHeader: {
      alignItems: 'center',
      paddingTop: 30,
      paddingHorizontal: 20,
      paddingBottom: 20,
      position: 'relative',
    },
    redeemIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(241, 196, 15, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    redeemTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    redeemSubtitle: {
      fontSize: 16,
      color: colors.textSecondary || colors.text,
      textAlign: 'center',
      opacity: 0.8,
      lineHeight: 22,
    },
    redeemCloseButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    redeemContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      alignItems: 'center',
    },
    redeemInputContainer: {
      width: '100%',
      marginBottom: 20,
    },
    redeemInputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    redeemInput: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 20,
      textAlign: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    redeemHint: {
      color: colors.textSecondary || colors.text,
      fontSize: 14,
      opacity: 0.7,
      textAlign: 'center',
      lineHeight: 20,
    },
    redeemFooter: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 20,
      paddingTop: 10,
      gap: 12,
    },
    redeemCancelButton: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    redeemCancelText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    redeemSubmitButton: {
      flex: 1,
      backgroundColor: '#f1c40f',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#f1c40f',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    redeemSubmitText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    // Enhanced Redeem Modal Styles
    validInput: {
      borderColor: '#2ed573',
      backgroundColor: 'rgba(46, 213, 115, 0.05)',
    },
    invalidInput: {
      borderColor: '#e74c3c',
      backgroundColor: 'rgba(231, 76, 60, 0.05)',
    },
    availablePointsContainer: {
      marginTop: 15,
      marginBottom: 15,
      padding: 12,
      backgroundColor: 'rgba(241, 196, 15, 0.1)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(241, 196, 15, 0.3)',
    },
    availablePointsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    availablePointsLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    availablePointsValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#f1c40f',
    },
    validationContainer: {
      marginTop: 10,
      marginBottom: 15,
    },
    validationError: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 8,
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(231, 76, 60, 0.3)',
    },
    validationErrorText: {
      fontSize: 12,
      color: '#e74c3c',
      fontWeight: '500',
      flex: 1,
    },
    validationSuccess: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 8,
      backgroundColor: 'rgba(46, 213, 115, 0.1)',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: 'rgba(46, 213, 115, 0.3)',
    },
    validationSuccessText: {
      fontSize: 12,
      color: '#2ed573',
      fontWeight: '500',
      flex: 1,
    },
    pointsSummaryContainer: {
      marginTop: 10,
      padding: 12,
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(52, 152, 219, 0.3)',
    },
    pointsSummaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pointsSummaryLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    pointsSummaryValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#3498db',
    },
    
    // Redeem PIN Modal Styles
    redeemPinModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    redeemPinModalContent: {
      backgroundColor: colors.background,
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 15,
    },
    redeemPinHeader: {
      alignItems: 'center',
      paddingTop: 30,
      paddingHorizontal: 20,
      paddingBottom: 20,
      position: 'relative',
    },
    redeemPinIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(241, 196, 15, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    redeemPinTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    redeemPinSubtitle: {
      fontSize: 16,
      color: colors.textSecondary || colors.text,
      textAlign: 'center',
      opacity: 0.8,
      lineHeight: 22,
    },
    redeemPinCloseButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    redeemPinContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      alignItems: 'center',
    },
    redeemPinInputContainer: {
      width: '100%',
      marginBottom: 20,
    },
    redeemPinInputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    redeemPinInput: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 20,
      textAlign: 'center',
      borderWidth: 2,
      borderColor: 'rgba(241, 196, 15, 0.3)',
      letterSpacing: 8,
    },
    redeemPinErrorText: {
      color: '#e74c3c',
      fontSize: 12,
      marginTop: 8,
      textAlign: 'center',
    },
    redeemPinHint: {
      color: colors.textSecondary || colors.text,
      fontSize: 14,
      opacity: 0.7,
      textAlign: 'center',
      lineHeight: 20,
      fontStyle: 'italic',
    },
    redeemPinFooter: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 20,
      paddingTop: 10,
      gap: 12,
    },
    redeemPinCancelButton: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    redeemPinCancelText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    redeemPinSubmitButton: {
      flex: 1,
      backgroundColor: '#f1c40f',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#f1c40f',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    redeemPinSubmitText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    // Debug Styles
    debugSection: {
      marginTop: 20,
      padding: 15,
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 193, 7, 0.3)',
    },
    debugTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#f1c40f',
      marginBottom: 10,
      textTransform: 'uppercase',
    },
    debugText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 5,
      fontFamily: 'monospace',
    },
  });
  
  export default RedeemScreen;
