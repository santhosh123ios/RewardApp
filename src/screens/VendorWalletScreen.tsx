import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import globalStyles from '../theme/globalStyles';
import colors from '../theme/colors';
import { AuthContext } from '../context/AuthContext';

export default function VendorWalletScreen() {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const [balance, setBalance] = useState(1250.00);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      // TODO: Replace with actual API call to fetch vendor's wallet data
      // const response = await ApiService('vendor/wallet', 'GET', null, logout);
      
      // Mock data for now
      const mockTransactions = [
        {
          id: 1,
          type: 'credit',
          amount: 500.00,
          description: 'Lead commission - John Doe',
          date: '2024-01-15',
          status: 'completed',
        },
        {
          id: 2,
          type: 'credit',
          amount: 750.00,
          description: 'Lead commission - Jane Smith',
          date: '2024-01-10',
          status: 'completed',
        },
        {
          id: 3,
          type: 'debit',
          amount: 200.00,
          description: 'Withdrawal to bank account',
          date: '2024-01-08',
          status: 'completed',
        },
        {
          id: 4,
          type: 'credit',
          amount: 300.00,
          description: 'Lead commission - Mike Johnson',
          date: '2024-01-05',
          status: 'pending',
        },
        {
          id: 5,
          type: 'credit',
          amount: 450.00,
          description: 'Lead commission - Sarah Wilson',
          date: '2024-01-03',
          status: 'completed',
        },
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setTransactions([]);
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle';
  };

  const getTransactionColor = (type: string) => {
    return type === 'credit' ? '#4caf50' : '#f44336';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'failed':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const renderTransactionItem = ({ item }: { item: any }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIcon}>
          <Icon 
            name={getTransactionIcon(item.type)} 
            size={24} 
            color={getTransactionColor(item.type)} 
          />
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText, 
            { color: getTransactionColor(item.type) }
          ]}>
            {item.type === 'credit' ? '+' : '-'}${item.amount.toFixed(2)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity style={styles.withdrawButton}>
          <Icon name="card-outline" size={20} color="#fff" />
          <Text style={styles.withdrawText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Icon name="wallet-outline" size={32} color="#f8d307" />
          </View>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          <Text style={styles.balanceSubtext}>USD</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={24} color="#4caf50" />
            <Text style={styles.statNumber}>$2,450</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="trending-down" size={24} color="#f44336" />
            <Text style={styles.statNumber}>$1,200</Text>
            <Text style={styles.statLabel}>Total Withdrawn</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="time-outline" size={24} color="#ff9800" />
            <Text style={styles.statNumber}>$300</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="card-outline" size={24} color="#f8d307" />
              <Text style={styles.actionText}>Withdraw</Text>
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
          
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
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
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#999',
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
  },
  viewAllText: {
    color: '#f8d307',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});
