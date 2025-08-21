import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import globalStyles from '../theme/globalStyles';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import ApiService from '../services/ApiService';

// Define the tab navigator types
type VendorTabParamList = {
  Home: undefined;
  Leads: undefined;
  Wallet: undefined;
  Profile: undefined;
};

type VendorLeadsScreenNavigationProp = BottomTabNavigationProp<VendorTabParamList, 'Leads'>;

export default function VendorLeadsScreen() {
  const navigation = useNavigation<VendorLeadsScreenNavigationProp>();
  const { logout } = useContext(AuthContext);
  const { colors, isDark } = useTheme();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, processing, pending

  const styles = getStyles(colors);

  const handleStackNavigation = (screenName: string, params?: any) => {
    // For stack navigation, we need to access the parent navigator
    (navigation as any).navigate(screenName, params);
  };

  useEffect(() => {
    fetchVendorLeads();
  }, []);

  const fetchVendorLeads = async () => {
    setLoading(true);
    try {
      const response = await ApiService('vendor/getleads', 'GET', null, logout);
      
      if (response && response.result && response.result.status === 1) {
        // Transform API data to match your UI structure
        const transformedLeads = response.result.data.map((lead: any) => ({
          id: lead.id,
          name: lead.lead_name,
          email: lead.member_email,
          phone: 'N/A', // API doesn't provide phone
          status: getStatusFromLeadStatus(lead.lead_status),
          created_at: formatDate(lead.created_at),
          amount: 'N/A', // API doesn't provide amount
          description: lead.lead_description,
          member_name: lead.member_name,
          member_image: lead.member_image,
          lead_status: lead.lead_status,
          user_id: lead.user_id,
          vendor_id: lead.vendor_id,
          lead_file: lead.lead_file
        }));
        
        setLeads(transformedLeads);
      } else {
        console.error('API response error:', response);
        setLeads([]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      Alert.alert('Error', 'Failed to fetch leads. Please try again.');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map lead_status to UI status
  const getStatusFromLeadStatus = (leadStatus: number) => {
    switch (leadStatus) {
      case 0:
        return 'pending';
      case 1:
        return 'active';
      case 2:
        return 'processing';
      case 3:
        return 'active';
      default:
        return 'pending';
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'processing':
        return '#2196f3';
      case 'pending':
        return '#ff9800';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Done';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filter);

  const renderLeadItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.leadCard}
      onPress={() => handleStackNavigation('VendorLeadDetails', { lead: item })}
      activeOpacity={0.7}
    >
      <View style={styles.leadHeader}>
        <Text style={styles.leadName}>{item.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.leadInfo}>
        <View style={styles.infoRow}>
          <Icon name="person-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{item.member_name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="mail-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{item.email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{item.created_at}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="document-text-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
      
      <View style={styles.leadActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="call" size={16} color={colors.success} />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleStackNavigation('VendorLeadDetails', { lead: item })}
        >
          <Icon name="eye" size={16} color={colors.primary} />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        
        {item.lead_file && (
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="document" size={16} color={colors.success} />
            <Text style={styles.actionText}>File</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filterValue: string, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterValue && styles.filterButtonActive]}
      onPress={() => setFilter(filterValue)}
    >
      <Text style={[styles.filterText, filter === filterValue && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Leads</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('active', 'Done')}
        {renderFilterButton('pending', 'Pending')}
        {renderFilterButton('processing', 'Processing')}
      </View>

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={64} color={colors.textDisabled} />
            <Text style={styles.emptyText}>No leads found</Text>
            <Text style={styles.emptySubtext}>Create your first lead to get started</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  addButton: {
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 30,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 10,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.84,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.white,
  },
  listContainer: {
    padding: 20,
  },
  leadCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  leadName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  leadInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 10,
    color: colors.textSecondary,
    fontSize: 14,
  },
  leadActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    marginLeft: 5,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
