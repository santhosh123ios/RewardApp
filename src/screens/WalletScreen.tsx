import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, SafeAreaView, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import colors from '../theme/colors';
import ApiService from '../services/ApiService';
import Icon from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';

const windowWidth = Dimensions.get('window').width;
const tabs = ['Transaction', 'Redeem'];

export default function WalletScreen() {
  const [activeTab, setActiveTab] = useState('Transaction');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [redeems, setRedeems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState('');
  const [redeemNote, setRedeemNote] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemStatus, setRedeemStatus] = useState<'success' | 'failed' | null>(null);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (redeemStatus === 'success') {
      const timer = setTimeout(() => {
        setRedeemModalVisible(false);
        setRedeemPoints('');
        setRedeemNote('');
        setRedeemStatus(null);
        fetchData(); // Refresh the redeem list
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [redeemStatus]);

  const fetchWalletDetails = async () => {
    setWalletLoading(true);
    try {
      const json = await ApiService('member/get_walletDetails', 'GET', null, logout);
      if (json?.result?.status === 1) {
        setWallet(json.result);
      } else {
        setWallet(null);
      }
    } catch (e) {
      setWallet(null);
    }
    setWalletLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Transaction') {
        const json = await ApiService('member/get_transaction', 'GET', null, logout);
        if (json?.result?.status === 1) {
          setTransactions(json.result.data);
        } else {
          setTransactions([]);
        }
      } else {
        const json = await ApiService('member/get_redeem', 'GET', null, logout);
        if (json?.result?.status === 1) {
          setRedeems(json.result.data);
        } else {
          setRedeems([]);
        }
      }
    } catch (e) {
      setTransactions([]);
      setRedeems([]);
    }
    setLoading(false);
  };

  const renderCard = () => {
    if (walletLoading) {
      return <ActivityIndicator size="large" color={colors.primary} style={{ margin: 32 }} />;
    }
    if (!wallet) {
      return <Text style={{ textAlign: 'center', color: '#888', margin: 32 }}>No wallet data found.</Text>;
    }
    const card = wallet.card;
    const user = wallet.user;
    const balance = wallet.available_point?.user_balance || '0';
    return (
      <View style={styles.cardContainer}>
        <Text style={styles.cardNumber}>{card.card_no}</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Balance</Text>
          <Text style={styles.cardBalance}>{balance}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.cardName}>{user.name?.toUpperCase()}</Text>
          <Text style={styles.cardType}>{card.card_type_name}</Text>
        </View>
      </View>
    );
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.listItem}>
      <View>
        <Text style={styles.itemLabel}>{item.transaction_title}</Text>
        <Text style={styles.itemDate}>{formatDate(item.transaction_created_at)}</Text>
        <Text style={styles.itemVendor}>{item.vendor_name}</Text>
      </View>
      <Text style={[styles.itemAmount, { color: item.transaction_cr > 0 ? colors.green : '#d0021b' }]}> 
        {item.transaction_cr > 0 ? '+' : '-'}{(item.transaction_cr > 0 ? item.transaction_cr : item.transaction_dr).toFixed(2)}
      </Text>
    </View>
  );

  // Add statusMap for redeem status
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

  const availablePoints = wallet?.available_point?.user_balance || '0';

  const handleRedeemSubmit = async () => {
    setRedeemLoading(true);
    setRedeemStatus(null);
    try {
      const payload = {
        redeem_point: redeemPoints,
        redeem_notes: redeemNote,
      };
      const json = await ApiService('member/add_redeem', 'POST', payload, logout);
      if (json?.result?.status === 1) {
        setRedeemStatus('success');
        // Optionally refresh redeems list here
      } else {
        setRedeemStatus('failed');
      }
    } catch (e) {
      setRedeemStatus('failed');
    }
    setRedeemLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {renderCard()}
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
      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={activeTab === 'Transaction' ? transactions : redeems}
          renderItem={activeTab === 'Transaction' ? renderTransaction : renderRedeem}
          keyExtractor={item => (activeTab === 'Transaction' ? String(item.transaction_id) : String(item.redeem_id))}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No data found.</Text>}
        />
      )}
      {/* Floating Action Button for Redeem tab */}
      {activeTab === 'Redeem' && (
        <TouchableOpacity style={styles.fab} onPress={() => setRedeemModalVisible(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
      {/* Redeem Modal */}
      <Modal
        visible={redeemModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRedeemModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Redeem Request</Text>
            {redeemLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 32 }} />
            ) : redeemStatus === 'success' ? (
              <View style={{ alignItems: 'center', marginVertical: 32 }}>
                <Icon name="checkmark-circle" size={64} color="green" style={{ marginBottom: 12 }} />
                <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 18 }}>Success!</Text>
                <Text style={{ color: '#888', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
                  Your redeem request was submitted successfully and will be processed soon.
                </Text>
                
              </View>
            ) : redeemStatus === 'failed' ? (
              <View style={{ alignItems: 'center', marginVertical: 32 }}>
                <Icon name="close-circle" size={64} color="red" style={{ marginBottom: 12 }} />
                <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 18 }}>Failed!</Text>
                <Text style={{ color: '#888', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
                  Your redeem request could not be processed. Please check your input or try again later.
                </Text>
                <TouchableOpacity style={styles.modalTryAgainBtn} onPress={() => {
                  setRedeemStatus(null);
                }}>
                  <Text style={styles.modalTryAgainText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.modalLabel}>Available Points: <Text style={{ fontWeight: 'bold' }}>{availablePoints}</Text></Text>
                <Text style={styles.modalLabel}>Points</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter points"
                  keyboardType="numeric"
                  value={redeemPoints}
                  onChangeText={setRedeemPoints}
                />
                <Text style={styles.modalLabel}>Note</Text>
                <TextInput
                  style={[styles.modalInput, { height: 60 }]}
                  placeholder="Enter note"
                  value={redeemNote}
                  onChangeText={setRedeemNote}
                  multiline
                />
                <View style={styles.modalBtnRow}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setRedeemModalVisible(false)}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleRedeemSubmit}>
                    <Text style={styles.modalSubmitText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 16,
  },
  cardContainer: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    margin: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardNumber: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cardBalance: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  cardName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardType: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  tabBar: {
    width: windowWidth - 32,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    alignSelf: 'center',
    marginBottom: 8,
  },
  tabItem: {
    width: (windowWidth - 32) / 2,
    height: 40,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabItem: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.label,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.slelectedLabel,
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
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 10,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'stretch',
    elevation: 8,
    // Add shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    // Add a little scale and fade effect
    transform: [{ scale: 1 }],
    opacity: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 15,
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  modalCancelText: {
    color: '#222', // black for contrast on ash
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalSubmitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalTryAgainBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#fff',
  },
  modalTryAgainText: {
    color: colors.label,
    fontWeight: 'bold',
    fontSize: 16,
  },
});