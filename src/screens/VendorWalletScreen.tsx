import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import globalStyles from '../theme/globalStyles';
import colors from '../theme/colors';
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
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCardNumber, setShowCardNumber] = useState(false);

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
        <TouchableOpacity style={styles.withdrawButton}>
          <Icon name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.withdrawText}>Topup</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Icon name="wallet-outline" size={32} color="#f8d307" />
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
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="add-circle-outline" size={24} color="#f8d307" />
              <Text style={styles.actionText}>Topup</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
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
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length > 0 ? (
            <FlatList
              data={transactions}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
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
    color: '#333',
  },
  withdrawButton: {
    backgroundColor: '#f8d307',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  withdrawText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'flex-start',
    marginBottom: 20,
    shadowColor: '#000',
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
    color: '#666',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
  },
  cardInfo: {
    alignItems: 'flex-start',
    paddingTop: 5,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8d307',
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
    shadowColor: '#000',
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
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
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
    color: '#333',
    marginBottom: 0,
  },
  viewAllText: {
    color: '#f8d307',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
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
    color: '#333',
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
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
    backgroundColor: '#f8f9fa',
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
    color: '#333',
    marginBottom: 5,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  transactionFrom: {
    fontSize: 12,
    color: '#999',
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
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  noTransactionsText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
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
});
