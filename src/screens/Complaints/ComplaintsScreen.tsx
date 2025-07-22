import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import globalStyles from '../../theme/globalStyles';
import ApiService from '../../services/ApiService';
import colors from '../../theme/colors';

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

const statusMap: { [key: number]: { text: string; color: string } } = {
  0: { text: 'Open', color: 'orange' },
  1: { text: 'Closed', color: 'green' },
  2: { text: 'In Progress', color: 'blue' },
};

type Complaint = {
  id: number;
  vendor_id: number;
  user_id: number;
  subject: string;
  message: string;
  attachment: string | null;
  status: number;
  created_at: string;
  vendor_name: string;
  vendor_email: string;
  vendor_image: string;
};

const ComplaintsScreen = () => {
  const navigation = useNavigation();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchComplaints();
    }, [])
  );

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await ApiService('member/get_complaints', 'GET');
      if (json?.result?.status === 1) {
        setComplaints(json.result.data);
      } else {
        setComplaints([]);
        setError('Failed to fetch complaints');
      }
    } catch (e) {
      setComplaints([]);
      setError('Failed to fetch complaints');
    }
    setLoading(false);
  };

  const renderItem = ({ item }: { item: Complaint }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ComplaintDetails', { complaint: item })}>
      <View style={styles.complaintItem}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={styles.subject}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.subject}
          </Text>
          <Text style={[styles.status, { color: statusMap[item.status]?.color || 'gray' }]}>{statusMap[item.status]?.text || 'Unknown'}</Text>
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>ID: {item.id}</Text>
          <Text style={styles.meta}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>Complaints</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#f8d307" style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 0, paddingBottom: 10 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No complaints found.</Text>}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ComplaintCreate')}
        activeOpacity={0.8}
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,
    },

  complaintItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginRight: 16,
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    },
    subject: {
        fontSize: 17,
        fontWeight: '700',
        color: '#222',
        marginBottom: 4,
        flex: 1,
        flexShrink: 1,
        marginRight: 8,
        minWidth: 0,
      },
  message: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 13,
    color: '#999',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
});

export default ComplaintsScreen; 