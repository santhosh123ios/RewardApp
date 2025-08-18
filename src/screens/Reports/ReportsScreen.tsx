import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import globalStyles from '../../theme/globalStyles';
import ApiService from '../../services/ApiService';
import { AuthContext } from '../../context/AuthContext';

const windowWidth = Dimensions.get('window').width;
const tabs = ['Lead', 'Transaction', 'Redeem'];

const ReportsScreen = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('Lead');
  const [leads, setLeads] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [redeems, setRedeems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'Lead') {
      fetchLeads();
    } else if (activeTab === 'Transaction') {
      fetchTransactions();
    } else if (activeTab === 'Redeem') {
      fetchRedeems();
    }
  }, [activeTab]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const json = await ApiService('member/getleads', 'GET', null, logout);
      if (json?.result?.status === 1) {
        setLeads(json.result.data);
      } else {
        setLeads([]);
      }
    } catch (e) {
      setLeads([]);
    }
    setLoading(false);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const json = await ApiService('member/get_transaction', 'GET', null, logout);
      if (json?.result?.status === 1) {
        setTransactions(json.result.data);
      } else {
        setTransactions([]);
      }
    } catch (e) {
      setTransactions([]);
    }
    setLoading(false);
  };

  const fetchRedeems = async () => {
    setLoading(true);
    try {
      const json = await ApiService('member/get_redeem', 'GET', null, logout);
      if (json?.result?.status === 1) {
        setRedeems(json.result.data);
      } else {
        setRedeems([]);
      }
    } catch (e) {
      setRedeems([]);
    }
    setLoading(false);
  };

  function formatDate(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  }

  const renderLead = ({ item }: { item: any }) => (
    <View style={styles.listItem}>
      <View>
        <Text style={styles.itemLabel}>{item.lead_name}</Text>
        <Text style={styles.itemDate}>{formatDate(item.created_at)}</Text>
        <Text style={styles.itemVendor}>{item.vendor_name}</Text>
      </View>
      <Text style={styles.itemAmount}>{item.lead_status}</Text>
    </View>
  );

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.listItem}>
      <View>
        <Text style={styles.itemLabel}>{item.transaction_title}</Text>
        <Text style={styles.itemDate}>{formatDate(item.transaction_created_at)}</Text>
        <Text style={styles.itemVendor}>{item.vendor_name}</Text>
      </View>
      <Text style={[styles.itemAmount, { color: item.transaction_cr > 0 ? '#4caf50' : '#d0021b' }]}> 
        {item.transaction_cr > 0 ? '+' : '-'}{(item.transaction_cr > 0 ? item.transaction_cr : item.transaction_dr)?.toFixed(2) ?? '0'}
      </Text>
    </View>
  );

  const redeemStatusMap: { [key: number]: { color: string; text: string } } = {
    0: { color: 'orange', text: 'PENDING' },
    1: { color: 'green', text: 'APPROVED' },
    2: { color: 'red', text: 'REJECTED' },
  };

  const renderRedeem = ({ item }: { item: any }) => (
    <View style={styles.listItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemLabel}>Redeem #{item.redeem_id}</Text>
        <Text style={styles.itemDate}>{formatDate(item.redeem_created_at)}</Text>
        <Text style={styles.itemVendor}>{item.notes}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.itemAmount, { color: '#d0021b' }]}>-{item.point}</Text>
        <Text style={[styles.redeemStatus, { color: redeemStatusMap[item.redeem_status]?.color || 'gray' }]}> 
          {redeemStatusMap[item.redeem_status]?.text || 'UNKNOWN'}
        </Text>
      </View>
    </View>
  );

  // --- Summary calculations ---
  let summary = null;
  if (activeTab === 'Lead') {
    summary = (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Total Leads: {leads.length}</Text>
      </View>
    );
  } else if (activeTab === 'Transaction') {
    const totalCredit = transactions.reduce((sum, t) => sum + (t.transaction_cr || 0), 0);
    const totalDebit = transactions.reduce((sum, t) => sum + (t.transaction_dr || 0), 0);
    summary = (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Total Transactions: {transactions.length}</Text>
        <Text style={styles.summaryText}>Total Credit: {totalCredit.toFixed(2)}</Text>
        <Text style={styles.summaryText}>Total Debit: {totalDebit.toFixed(2)}</Text>
      </View>
    );
  } else if (activeTab === 'Redeem') {
    const totalPoints = redeems.reduce((sum, r) => sum + (r.point || 0), 0);
    summary = (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Total Redeems: {redeems.length}</Text>
        <Text style={styles.summaryText}>Total Points Redeemed: {totalPoints}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}
          style={{ zIndex: 2 }}
          >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>Reports</Text>
      </View>
      {summary}
      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={activeTab === tab ? styles.activeTabText : styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#f8d307" style={{ marginTop: 32 }} />
        ) : activeTab === 'Lead' ? (
          <FlatList
            data={leads}
            renderItem={renderLead}
            keyExtractor={item => item.id?.toString() || item.lead_id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.placeholder}>No leads found.</Text>}
            key={'lead'}
          />
        ) : activeTab === 'Transaction' ? (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={item => item.transaction_id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.placeholder}>No transactions found.</Text>}
            key={'transaction'}
          />
        ) : (
          <FlatList
            data={redeems}
            renderItem={renderRedeem}
            keyExtractor={item => item.redeem_id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.placeholder}>No redeems found.</Text>}
            key={'redeem'}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabBar: {
    width: windowWidth - 32,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    alignSelf: 'center',
    marginVertical: 12,
  },
  tabItem: {
    flex: 1,
    height: 40,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabItem: {
    backgroundColor: '#f8d307',
  },
  tabText: {
    color: '#222',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  itemDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  itemVendor: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  redeemStatus: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  placeholder: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
  },
  summaryCard: {
    backgroundColor: '#f8d307',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  summaryText: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 2,
  },
});

export default ReportsScreen;
