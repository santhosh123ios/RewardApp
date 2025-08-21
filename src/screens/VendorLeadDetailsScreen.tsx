import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/ApiService';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const VendorLeadDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const { colors, isDark } = useTheme();
  const { lead } = route.params;
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(lead.lead_status);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [statusUpdateResult, setStatusUpdateResult] = useState<{ success: boolean; message: string } | null>(null);

  const styles = getStyles(colors);
  
  // Message section states
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef(null);

  // Add new state variables for point entry
  const [showPointEntry, setShowPointEntry] = useState(false);
  const [pointAmount, setPointAmount] = useState('');
  const [vendorBalance, setVendorBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [submittingPoints, setSubmittingPoints] = useState(false);

  const statusOptions = [
    { value: 0, label: 'Pending', color: '#ff9800' },
    { value: 1, label: 'Review', color: '#f8d307' },
    { value: 2, label: 'Processing', color: '#2196f3' },
    { value: 3, label: 'Done', color: '#4caf50' },
    { value: 4, label: 'Rejected', color: '#f44336' },
  ];

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

    const handleStatusUpdate = async (newStatus: number) => {
    const statusNumber = Number(newStatus);
    
    if (statusNumber === currentStatus) {
      setShowStatusDropdown(false);
      return;
    }

    // If status is "Done" (3), show point entry modal
    if (statusNumber === 3) {
      setShowPointEntry(true);
      setShowStatusDropdown(false);
      // Fetch vendor balance when opening point entry
      fetchVendorBalance();
      return;
    }

    // For other statuses, proceed with normal update
    await updateLeadStatus(statusNumber);
  };

  const getStatusColor = (status: number) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption ? statusOption.color : '#666';
  };

  const getStatusLabel = (status: number) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption ? statusOption.label : 'Unknown';
  };

  // Message section functions
  useEffect(() => {
    fetchMessages(lead.id);
  }, [lead.id]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (!messageLoading && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messageLoading]);

  useEffect(() => {
    if (!messageLoading && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messageLoading, messages]);

  const fetchMessages = async (leadId) => {
    setMessageLoading(true);
    try {
      const json = await ApiService('vendor/get_lead_message', 'POST', { lead_id: leadId }, logout);
      if (json?.result?.status === 1) {
        setMessages(json.result.data);
      } else {
        setMessages([]);
      }
    } catch (e) {
      setMessages([]);
    }
    setMessageLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const newMessage = {
        text: input,
        lead_id: lead.id,
      };
      const json = await ApiService('vendor/create_lead_message', 'POST', newMessage, logout);
      if (json?.result?.status === 1) {
        setInput('');
        fetchMessages(lead.id); // Refresh messages from server
      } else {
        Alert.alert('Error', json?.result?.message || 'Failed to send message');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getSenderType = (msg) => {
    // Replace with actual vendor ID logic - this should identify if message is from vendor or member
    return msg.sender === 'vendor' ? 'me' : 'other';
  };

  const formatFriendlyDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    let dayPart = '';
    if (isToday) {
      dayPart = 'Today';
    } else if (isYesterday) {
      dayPart = 'Yesterday';
    } else {
      dayPart = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
    }

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;

    return `${dayPart}, ${hours}:${minutes} ${ampm}`;
  };

  // Add new function to fetch vendor balance
  const fetchVendorBalance = async () => {
    setBalanceLoading(true);
    try {
      const response = await ApiService('vendor/get_wallet', 'get', logout);
      if (response && response.result && response.result.status === 1) {
        setVendorBalance(response.result.data?.balance_point || 0);
      } else {
        setVendorBalance(0);
      }
    } catch (error) {
      console.error('Error fetching vendor balance:', error);
      setVendorBalance(0);
    } finally {
      setBalanceLoading(false);
    }
  };

  // New function to handle point submission and status update
  const handlePointSubmission = async () => {
    if (!pointAmount.trim() || isNaN(Number(pointAmount)) || Number(pointAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid point amount');
      return;
    }

    const enteredPoints = Number(pointAmount);
    
    // Check if entered points exceed available balance
    if (enteredPoints > vendorBalance) {
      Alert.alert('Insufficient Balance', `You only have ${vendorBalance} points available. Please enter a smaller amount.`);
      return;
    }

    setSubmittingPoints(true);
    try {
      // First, add transaction points
      const transactionResponse = await ApiService('vendor/add_transaction', 'POST', {
        transaction_point: enteredPoints,
        transaction_title: lead.name,
        to_id: lead.user_id
      }, logout);

      if (transactionResponse && transactionResponse.result && transactionResponse.result.status === 1) {
        // If transaction successful, update lead status to "Done"
        await updateLeadStatus(3);
        setShowPointEntry(false);
        setPointAmount('');
        Alert.alert('Success', 'Points added and lead status updated successfully!');
      } else {
        Alert.alert('Error', transactionResponse?.result?.message || 'Failed to add points');
      }
    } catch (error) {
      console.error('Error submitting points:', error);
      Alert.alert('Error', 'Failed to submit points. Please try again.');
    } finally {
      setSubmittingPoints(false);
    }
  };

  // Separate function for updating lead status
  const updateLeadStatus = async (statusNumber: number) => {
    setLoading(true);
    setStatusUpdateResult(null);
    
    try {
      console.log('Updating status to:', statusNumber, 'for lead:', lead.id);
      
      const response = await ApiService('vendor/lead-status-update', 'POST', {
        id: lead.id,
        lead_status: statusNumber
      }, logout);
        
      console.log('API Response:', response);
        
      if (response && response.result && response.result.status === 1) {
        console.log('Status update successful');
        setCurrentStatus(statusNumber);
        setStatusUpdateResult({ success: true, message: 'Status updated successfully!' });
        
        // Auto-dismiss popup after 2 seconds
        setTimeout(() => {
          setShowStatusDropdown(false);
          setStatusUpdateResult(null);
        }, 2000);
      } else if (response && response.error && response.error.length > 0) {
        console.log('Status update failed with error:', response.error);
        setStatusUpdateResult({ 
          success: false, 
          message: response.error[0].message || 'Failed to update status' 
        });
      } else {
        console.log('Status update failed:', response);
        setStatusUpdateResult({ 
          success: false, 
          message: response?.result?.message || 'Failed to update status' 
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setStatusUpdateResult({ success: false, message: 'Failed to update status. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lead Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContainer}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Lead Info Card */}
          <View style={styles.leadCard}>
            <View style={styles.leadHeader}>
              <Text style={styles.leadTitle}>{lead.name}</Text>
              <TouchableOpacity
                style={[styles.statusDropdown, { backgroundColor: getStatusColor(currentStatus) }]}
                onPress={() => {
                  console.log('Opening status dropdown');
                  setStatusUpdateResult(null); // Clear any previous result
                  setShowStatusDropdown(true);
                }}
                disabled={loading}
              >
                <Text style={styles.statusDropdownText}>{getStatusLabel(currentStatus)}</Text>
                <Icon name="chevron-down" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.leadInfo}>
              <View style={styles.infoRow}>
                <Icon name="person-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>Member:</Text>
                <Text style={styles.infoValue}>{lead.member_name}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="mail-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{lead.email}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="calendar-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>Created:</Text>
                <Text style={styles.infoValue}>{formatDate(lead.created_at)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="document-text-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoLabel}>Description:</Text>
              </View>
              <Text style={styles.descriptionText}>{lead.description}</Text>
              
              {lead.lead_file && (
                <View style={styles.infoRow}>
                  <Icon name="document" size={20} color={colors.textSecondary} />
                  <Text style={styles.infoLabel}>Attachment:</Text>
                  <Text style={styles.infoValue}>Available</Text>
                </View>
              )}
            </View>

            {/* Action Buttons
            <View style={styles.actionSection}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="call" size={20} color="#4caf50" />
                <Text style={styles.actionButtonText}>Call Member</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="mail" size={20} color="#2196f3" />
                <Text style={styles.actionButtonText}>Send Email</Text>
              </TouchableOpacity>
            </View> */}
          </View>
          
          {/* Messages Section */}
          <View style={styles.messagesSection}>
            {/* <Text style={styles.sectionTitle}>Messages</Text>
            <Text style={styles.sectionSubtitle}>Chat with the member about this lead</Text> */}
            
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {messageLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading messages...</Text>
                </View>
              ) : messages.length === 0 ? (
                <View style={styles.noMessagesContainer}>
                  <Icon name="chatbubble-outline" size={48} color={colors.textDisabled} />
                  <Text style={styles.noMessagesText}>No messages yet</Text>
                  <Text style={styles.noMessagesSubtext}>Start the conversation with the member</Text>
                </View>
              ) : (
                (() => {
                  let lastDate = '';
                  return messages.map((msg, idx) => {
                    const msgDate = new Date(msg.create_at);
                    const dateKey = msgDate.toDateString();
                    let showDate = false;
                    if (dateKey !== lastDate) {
                      showDate = true;
                      lastDate = dateKey;
                    }
                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <View style={styles.dateSeparator}>
                            <Text style={styles.dateSeparatorText}>
                              {formatFriendlyDateTime(msg.create_at).split(',')[0]}
                            </Text>
                          </View>
                        )}
                        <View
                          style={[
                            styles.messageBubble,
                            getSenderType(msg) === 'me' ? styles.myMessage : styles.otherMessage,
                          ]}
                        >
                          <Text style={styles.messageText}>{msg.text}</Text>
                          <Text style={styles.messageMeta}>
                            {formatFriendlyDateTime(msg.create_at).split(',')[1]?.trim()}
                          </Text>
                        </View>
                      </React.Fragment>
                    );
                  });
                })()
              )}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Input Row - Fixed at bottom */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={input}
            onChangeText={setInput}
            multiline
            underlineColorAndroid="transparent" // Remove Android underline
            textAlignVertical="center" // Ensures proper text alignment on Android
          />
          <TouchableOpacity 
            style={[styles.sendButton, sending && styles.sendButtonDisabled]} 
            onPress={handleSend} 
            disabled={sending}
          >
            <Icon name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Dropdown Modal */}
      <Modal
        visible={showStatusDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowStatusDropdown(false);
            setStatusUpdateResult(null); // Clear result when closing
          }}
        >
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Status</Text>
              <TouchableOpacity onPress={() => {
                setShowStatusDropdown(false);
                setStatusUpdateResult(null); // Clear result when closing
              }}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {/* Show loader or result */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Updating status...</Text>
              </View>
            ) : statusUpdateResult ? (
              <View style={styles.resultContainer}>
                <Icon 
                  name={statusUpdateResult.success ? "checkmark-circle" : "close-circle"} 
                  size={48} 
                  color={statusUpdateResult.success ? "#4caf50" : "#f44336"} 
                />
                <Text style={[
                  styles.resultText,
                  { color: statusUpdateResult.success ? "#4caf50" : "#f44336" }
                ]}>
                  {statusUpdateResult.message}
                </Text>
              </View>
            ) : (
              /* Show status options */
              statusOptions.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.dropdownOption,
                    currentStatus === status.value && styles.dropdownOptionActive
                  ]}
                  onPress={() => handleStatusUpdate(status.value)}
                >
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                  <Text style={[
                    styles.dropdownOptionText,
                    currentStatus === status.value && styles.dropdownOptionTextActive
                  ]}>
                    {status.label}
                  </Text>
                  {currentStatus === status.value && (
                    <Icon name="checkmark" size={20} color="#4caf50" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Point Entry Modal */}
      <Modal
        visible={showPointEntry}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPointEntry(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPointEntry(false)}
        >
          <View style={styles.pointEntryContainer}>
            <View style={styles.pointEntryHeader}>
              <Text style={styles.pointEntryTitle}>Add Points & Complete Lead</Text>
              <TouchableOpacity onPress={() => setShowPointEntry(false)}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pointEntryContent}>
              {/* Vendor Balance Display */}
              <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>Your Available Balance:</Text>
                {balanceLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.balanceAmount}>{vendorBalance} Points</Text>
                )}
              </View>

              {/* Point Input */}
              <View style={styles.pointInputSection}>
                <Text style={styles.pointInputLabel}>Enter Points to Award:</Text>
                <TextInput
                  style={styles.pointInput}
                  placeholder="Enter point amount"
                  value={pointAmount}
                  onChangeText={setPointAmount}
                  keyboardType="numeric"
                  underlineColorAndroid="transparent"
                />
                {pointAmount && !isNaN(Number(pointAmount)) && Number(pointAmount) > 0 && (
                  <View style={styles.balanceCheckSection}>
                    <Text style={styles.balanceCheckLabel}>
                      Remaining Balance: 
                      <Text style={[
                        styles.balanceCheckAmount,
                        { color: Number(pointAmount) > vendorBalance ? '#f44336' : '#4caf50' }
                      ]}>
                        {' '}{Math.max(0, vendorBalance - Number(pointAmount))} points
                      </Text>
                    </Text>
                    {Number(pointAmount) > vendorBalance && (
                      <Text style={styles.insufficientWarning}>
                        ⚠️ Insufficient balance
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton, 
                  (submittingPoints || !pointAmount || isNaN(Number(pointAmount)) || Number(pointAmount) <= 0 || Number(pointAmount) > vendorBalance) && styles.submitButtonDisabled
                ]}
                onPress={handlePointSubmission}
                disabled={submittingPoints || !pointAmount || isNaN(Number(pointAmount)) || Number(pointAmount) <= 0 || Number(pointAmount) > vendorBalance}
              >
                {submittingPoints ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit & Complete Lead</Text>
                )}
              </TouchableOpacity>
              
              {/* Helper Text */}
              {(!pointAmount || isNaN(Number(pointAmount)) || Number(pointAmount) <= 0) && (
                <Text style={styles.helperText}>Please enter a valid point amount</Text>
              )}
              {pointAmount && !isNaN(Number(pointAmount)) && Number(pointAmount) > 0 && Number(pointAmount) > vendorBalance && (
                <Text style={styles.helperText}>Insufficient balance to award {pointAmount} points</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Updating status...</Text>
        </View>
      )}
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
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
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
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 80, // Add padding to prevent content from being hidden behind input row
  },
  leadCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leadTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 15,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  leadInfo: {
    gap: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
    flex: 1,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginLeft: 30,
    marginTop: 5,
  },
  statusSection: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 120,
    justifyContent: 'center',
  },
  statusOptionActive: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 3,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusOptionTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  actionSection: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
  },
  statusDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: 'space-between',
  },
  statusDropdownText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  dropdownOptionActive: {
    backgroundColor: colors.surfaceVariant,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  dropdownOptionTextActive: {
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
  },
  
  // Message section styles
  messagesSection: {
    //backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 3.84,
    // elevation: 5,
  },
  messagesContainer: {
    maxHeight: 300,
    paddingRight: 16,
    paddingLeft: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: colors.surfaceVariant,
    alignSelf: 'flex-start',
  },
  messageText: { 
    fontSize: 16, 
    color: colors.text
  },
  messageMeta: { 
    fontSize: 12, 
    color: colors.textTertiary, 
    marginTop: 4 
  },
  inputRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: colors.surfaceVariant,
    marginRight: 8,
    maxHeight: 100,
    minHeight: 40,
    color: colors.text,
    // Android-specific fixes
    underlineColorAndroid: 'transparent',
    textAlignVertical: 'center',
    // Remove default Android styling
    ...Platform.select({
      android: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 24,
        backgroundColor: colors.surfaceVariant,
        paddingHorizontal: 16,
        paddingVertical: 10,
        // Override Android default styles
        elevation: 0,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      ios: {
        // iOS specific styles if needed
      }
    }),
  },
  sendButton: {
    height: 40,
    width: 40,
    backgroundColor: '#25D366',
    borderRadius: 24,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textDisabled,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  dateSeparatorText: {
    color: colors.textSecondary,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  noMessagesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noMessagesText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
    fontWeight: '600',
  },
  noMessagesSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 5,
    textAlign: 'center',
  },
  
  // Point Entry Modal Styles
  pointEntryContainer: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pointEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  pointEntryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  pointEntryContent: {
    gap: 20,
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 10,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success,
  },
  pointInputSection: {
    gap: 10,
  },
  pointInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  pointInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.surfaceVariant,
    textAlign: 'center',
    color: colors.text,
    ...Platform.select({
      android: {
        elevation: 0,
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      }
    }),
  },
  balanceCheckSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
  },
  balanceCheckLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  balanceCheckAmount: {
    fontWeight: 'bold',
  },
  insufficientWarning: {
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.success,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textDisabled,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default VendorLeadDetailsScreen;
