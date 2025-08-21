import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import colors from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import ApiService from '../services/ApiService';

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

export default function AllTransactionsScreen() {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await ApiService('vendor/get_transaction', 'GET', null, logout);
      if (response?.result?.status === 1) {
        setTransactions(response.result.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const getTransactionIcon = (transaction: Transaction) => {
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
    return transaction.transaction_type === 1 ? 'Credit' : 'Debit';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <Text style={styles.transactionId}>ID: {item.transaction_id}</Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText, 
            { color: getTransactionColor(item) }
          ]}>
            {getTransactionType(item) === 'Credit' ? '+' : '-'}{getTransactionAmount(item)} pts
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getTransactionColor(item) }]}>
            <Text style={styles.statusText}>{getTransactionType(item)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Transactions</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="trending-up" size={24} color="#4caf50" />
          <Text style={styles.statNumber}>
            {transactions.filter(t => t.transaction_type === 1).reduce((sum, t) => sum + t.transaction_cr, 0)} pts
          </Text>
          <Text style={styles.statLabel}>Total Credits</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="trending-down" size={24} color="#f44336" />
          <Text style={styles.statNumber}>
            {transactions.filter(t => t.transaction_type === 2).reduce((sum, t) => sum + t.transaction_dr, 0)} pts
          </Text>
          <Text style={styles.statLabel}>Total Debits</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="time-outline" size={24} color="#ff9800" />
          <Text style={styles.statNumber}>{transactions.length}</Text>
          <Text style={styles.statLabel}>Total Transactions</Text>
        </View>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.transaction_id.toString()}
        style={styles.transactionsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.noTransactions}>
            <Icon name="document-outline" size={48} color="#ccc" />
            <Text style={styles.noTransactionsText}>No transactions found</Text>
          </View>
        }
      />
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
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
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
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
    marginBottom: 3,
  },
  transactionId: {
    fontSize: 11,
    color: '#ccc',
    fontFamily: 'monospace',
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
});
