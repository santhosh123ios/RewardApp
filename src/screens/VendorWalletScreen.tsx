import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import globalStyles from '../theme/globalStyles';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import ApiService from '../services/ApiService';

interface WalletData {
  card: {
    card_id: number;
    card_no: string;
    card_status: number;
    user_id: number;
    card_type: string;
  };
  balance_point: string;
}

interface Transaction {
  transaction_id: number;
  transaction_type: number;
  transaction_cr: number;
  transaction_dr: number;
  transaction_title: string;
  transaction_created_at: string;
  user_id: number;
  from_id: number;
  to_id: number;
  card_id: number;
  card_no: string;
  from_name: string;
  from_image: string;
  from_type: number;
  to_name: string;
  to_email: string;
  to_image: string;
  to_type: number;
}

export default function VendorWalletScreen() {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const { colors, isDark } = useTheme();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupPoints, setTopupPoints] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [topupStatus, setTopupStatus] = useState<string | null>(null);

  const styles = getStyles(colors);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet data
      const walletResponse = await ApiService('vendor/get_wallet', 'GET', null, logout);
      if (walletResponse?.result?.status === 1) {
        setWalletData(walletResponse.result.data);
      }
      
      // Fetch transactions
      const transactionsResponse = await ApiService('vendor/get_transaction', 'GET', null, logout);
      if (transactionsResponse?.result?.status === 1) {
        setTransactions(transactionsResponse.result.data);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (transaction: Transaction) => {
    // transaction_type: 1 = credit (topup), 2 = debit (transfer)
    return transaction.transaction_type === 1 ? 'arrow-down-circle' : 'arrow-up-circle';
  };

  const getTransactionColor = (transaction: Transaction) => {
    return transaction.transaction_type === 1 ? '#4caf50' : '#f44336';
  };

  const getTransactionAmount = (transaction: Transaction) => {
    if (transaction.transaction_type === 1) {
      return transaction.transaction_cr;
    } else {
      return transaction.transaction_dr;
    }
  };

  const getTransactionType = (transaction: Transaction) => {
    return transaction.transaction_type === 1 ? 'credit' : 'debit';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateTotalEarned = () => {
    return transactions
      .filter(t => t.transaction_type === 1)
      .reduce((sum, t) => sum + t.transaction_cr, 0);
  };

  const calculateTotalWithdrawn = () => {
    return transactions
      .filter(t => t.transaction_type === 2)
      .reduce((sum, t) => sum + t.transaction_dr, 0);
  };

  const toggleCardNumber = () => {
    setShowCardNumber(!showCardNumber);
  };

  const handleTopup = async () => {
    if (!topupPoints || parseInt(topupPoints) <= 0) {
      Alert.alert('Error', 'Please enter a valid number of points');
      return;
    }

    try {
      setTopupLoading(true);
      setTopupStatus(null);
      
      const response = await ApiService('vendor/add_vendor_topup', 'POST', {
        transaction_point: parseInt(topupPoints)
      }, logout);
      
      if (response?.result?.status === 1) {
        setTopupStatus('success');
        // Refresh wallet data after successful topup
        setTimeout(() => {
          fetchWalletData();
          setShowTopupModal(false);
          setTopupPoints('');
          setTopupStatus(null);
        }, 2000);
      } else {
        setTopupStatus('error');
      }
    } catch (error) {
      console.error('Topup error:', error);
      setTopupStatus('error');
    } finally {
      setTopupLoading(false);
    }
  };

  const openTopupModal = () => {
    setShowTopupModal(true);
    setTopupPoints('');
    setTopupStatus(null);
  };

  const closeTopupModal = () => {
    setShowTopupModal(false);
    setTopupPoints('');
    setTopupStatus(null);
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIcon}>
          <Icon 
            name={getTransactionIcon(item)} 
            size={24} 
            color={getTransactionColor(item)} 
          />
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.transaction_title}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.transaction_created_at)}</Text>
          <Text style={styles.transactionFrom}>
            {item.transaction_type === 1 ? `From: ${item.from_name}` : `To: ${item.to_name}`}
          </Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText, 
            { color: getTransactionColor(item) }
          ]}>
            {getTransactionType(item) === 'credit' ? '+' : '-'}{getTransactionAmount(item)} pts
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: '#4caf50' }]}>
            <Text style={styles.statusText}>completed</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading wallet data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity style={styles.withdrawButton} onPress={() => navigation.navigate('Redeem' as never)}>
          <Icon name="gift-outline" size={20} color="#fff" />
          <Text style={styles.withdrawText}>Redeem</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <TouchableOpacity style={styles.withdrawButton} onPress={openTopupModal}>
              <Icon name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.withdrawText}>Topup</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>{walletData?.balance_point || 0} pts</Text>
          
          
          {/* Credit Card Design */}
          {walletData?.card && (
            <View style={styles.creditCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardLogo}>
                  <Icon name="card" size={24} color="#fff" />
                </View>
                <Text style={styles.statusValue}>
                    {walletData.card.card_status === 1 ? 'Active' : 'Inactive'}
                </Text>
              </View>
              
              <View style={styles.cardNumberContainer}>
                <View style={styles.cardNumberHeader}>
                  <Text style={styles.cardNumber}>
                    {showCardNumber 
                      ? walletData.card.card_no.replace(/(\d{4})(?=\d)/g, '$1 ')
                      : `**** **** **** ${walletData.card.card_no.slice(-4)}`
                    }
                  </Text>
                  <TouchableOpacity onPress={toggleCardNumber} style={styles.eyeButton}>
                    <Icon 
                      name={showCardNumber ? "eye-off" : "eye"} 
                      size={20} 
                      color="rgba(255, 255, 255, 0.8)" 
                    />
                  </TouchableOpacity>
                </View>
                
              </View>
              
              <View style={styles.cardFooter}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardInfoLabel}>CARD TYPE</Text>
                  <Text style={styles.cardInfoValue}>Silver</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardInfoLabel}>EXPIRES</Text>
                  <Text style={styles.cardInfoValue}>12/25</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={24} color="#4caf50" />
            <Text style={styles.statNumber}>{calculateTotalEarned()} pts</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="trending-down" size={24} color="#f44336" />
            <Text style={styles.statNumber}>{calculateTotalWithdrawn()} pts</Text>
            <Text style={styles.statLabel}>Total Transferred</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="time-outline" size={24} color="#ff9800" />
            <Text style={styles.statNumber}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={openTopupModal}>
              <Icon name="add-circle-outline" size={24} color="#f8d307" />
              <Text style={styles.actionText}>Topup</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AllTransactions' as never)}>
              <Icon name="swap-horizontal-outline" size={24} color="#4caf50" />
              <Text style={styles.actionText}>Transfer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="document-text-outline" size={24} color="#2196f3" />
              <Text style={styles.actionText}>Statement</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllTransactions' as never)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length > 0 ? (
            <FlatList
              data={transactions.slice(0, 5)}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.transaction_id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noTransactions}>
              <Icon name="document-outline" size={48} color="#ccc" />
              <Text style={styles.noTransactionsText}>No transactions yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Topup Modal */}
      <Modal
        visible={showTopupModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeTopupModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Topup Wallet</Text>
              <TouchableOpacity onPress={closeTopupModal} style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {!topupStatus ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Enter Points</Text>
                  <TextInput
                    style={styles.pointsInput}
                    value={topupPoints}
                    onChangeText={setTopupPoints}
                    placeholder="Enter number of points"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    editable={!topupLoading}
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]} 
                    onPress={closeTopupModal}
                    disabled={topupLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.topupButton]} 
                    onPress={handleTopup}
                    disabled={topupLoading || !topupPoints}
                  >
                    {topupLoading ? (
                      <Text style={styles.topupButtonText}>Processing...</Text>
                    ) : (
                      <Text style={styles.topupButtonText}>Topup</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.statusContainer}>
                {topupStatus === 'success' ? (
                  <>
                    <Icon name="checkmark-circle" size={64} color="#4caf50" />
                    <Text style={styles.statusTitle}>Topup Successful!</Text>
                    <Text style={styles.statusMessage}>
                      {topupPoints} points have been added to your wallet.
                    </Text>
                  </>
                ) : (
                  <>
                    <Icon name="close-circle" size={64} color="#f44336" />
                    <Text style={styles.statusTitle}>Topup Failed</Text>
                    <Text style={styles.statusMessage}>
                      Please try again later.
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  header: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  withdrawButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  withdrawText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'flex-start',
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 0,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  balanceSubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 15,
  },
  cardInfo: {
    alignItems: 'flex-start',
    paddingTop: 5,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 5,
  },
  cardNumber: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'monospace',
    fontWeight: '600',
    letterSpacing: 2,
  },
  // New Credit Card Styles
  creditCard: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    width: '100%',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  cardLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNumberContainer: {
    marginBottom: 5,
  },
  cardNumberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  eyeButton: {
    padding: 5,
  },
  cardNumberLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 0,
  },
  cardInfoLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardInfoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 0,
  },
  viewAllText: {
    color: colors.primary,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  transactionCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: colors.shadow,
    marginLeft: 5,
    marginRight: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  transactionFrom: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  noTransactions: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.surface,
    borderRadius: 15,
  },
  noTransactionsText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.textTertiary,
  },
  statusValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 20,
    overflow: 'hidden',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxWidth: 400,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  pointsInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    color: colors.text,
    backgroundColor: colors.surfaceVariant,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 2,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  topupButton: {
    backgroundColor: colors.primary,
  },
  topupButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 15,
    marginBottom: 10,
  },
  statusMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
