import { Text, View, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import colors from "../theme/colors";
import { useEffect, useState } from "react";
import ApiService from "../services/ApiService";
import { SafeAreaView } from "react-native-safe-area-context";


interface Lead {
  id: string;
  vendor_image: string;
  lead_name: string;
  lead_description: string;
  created_at: string;
  lead_status: string;
}

export default function LeadsScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);

  // Helper to format date
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

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const json = await ApiService('member/getleads');
    console.log(json);
    if (json?.result?.status === 1) {
      setLeads(json.result.data);
    }
  };

  const statusMap: { [key: string]: { color: string; text: string } } = {
    '0': { color: 'orange', text: 'PENDING' },
    '1': { color: 'yellow', text: 'REVIEW' },
    '2': { color: 'paleturquoise', text: 'Processing' },
    '3': { color: 'green', text: 'DONE' },
    '4': { color: 'red', text: 'REJECTED' },
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.leadItem}>
      <Image
        source={
          item.vendor_image
            ? { uri: "https://crmgcc.net/uploads/" + item.vendor_image }
            : require('../../assets/dummy.jpg')
        }
        style={styles.leadImage}
      />
      <View style={styles.leadInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.leadTitle}>{item.lead_name}</Text>
          
        </View>
        <Text style={styles.leadDescription}>{item.lead_description}</Text>
        <Text style={styles.leadDatetime}>{formatDate(item.created_at)}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          
          <Text style={[styles.statusText, { color: statusMap[item.lead_status]?.color || 'gray' }]}>
            {statusMap[item.lead_status]?.text || 'UNKNOWN'}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: statusMap[item.lead_status]?.color || 'gray' }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
          <Text style={styles.headerTitle}>Leads</Text>
      </View>

      <View style={{  backgroundColor: '#fff' }}>
        
        <FlatList
          data={leads}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      </View>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // TODO: Navigate to lead create screen or open modal
          console.log('Create Lead');
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  leadItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  leadImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  leadInfo: {
    flex: 1,
  },
  leadTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    color: '#222',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green',
    marginLeft: 6,
  },
  statusText: {
    fontSize: 13,
    color: 'green',
    fontWeight: '500',
  },
  leadDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  leadDatetime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
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
});