import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, SafeAreaView } from 'react-native';
import colors from '../theme/colors';

const windowWidth = Dimensions.get('window').width;
const tabs = ['Transaction', 'Redeem'];

const mockCard = {
  cardNumber: '1234 5678 9012 3456',
  balance: 2500.75,
  name: 'John Doe',
  type: 'Platinum',
};

const mockTransactions = [
  { id: '1', label: 'Starbucks', amount: -5.99, date: '2024-06-01 10:30 am' },
  { id: '2', label: 'Amazon', amount: -49.99, date: '2024-05-30 2:15 pm' },
  { id: '3', label: 'Salary', amount: 2000, date: '2024-05-28 9:00 am' },
];

const mockRedeems = [
  { id: '1', label: 'Gift Card', amount: -50, date: '2024-05-25 4:00 pm' },
  { id: '2', label: 'Movie Ticket', amount: -12, date: '2024-05-20 7:30 pm' },
];

export default function WalletScreen() {
  const [activeTab, setActiveTab] = useState('Transaction');

  const renderCard = () => (
    <View style={styles.cardContainer}>
      <Text style={styles.cardNumber}>{mockCard.cardNumber}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Balance</Text>
        <Text style={styles.cardBalance}>${mockCard.balance.toFixed(2)}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.cardName}>{mockCard.name}</Text>
        <Text style={styles.cardType}>{mockCard.type}</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.listItem}>
      <View>
        <Text style={styles.itemLabel}>{item.label}</Text>
        <Text style={styles.itemDate}>{item.date}</Text>
      </View>
      <Text style={[styles.itemAmount, { color: item.amount < 0 ? '#d0021b' : colors.green }]}>${item.amount.toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.safeContainer}>
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
        <FlatList
          data={activeTab === 'Transaction' ? mockTransactions : mockRedeems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});