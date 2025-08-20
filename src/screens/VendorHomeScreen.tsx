import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { createGlobalStyles } from '../theme/globalStyles';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the tab navigator types
type VendorTabParamList = {
  Home: undefined;
  Leads: undefined;
  Wallet: undefined;
  Profile: undefined;
};

type VendorHomeScreenNavigationProp = BottomTabNavigationProp<VendorTabParamList, 'Home'>;

// Define wallet data types
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

// Define lead data types
interface LeadData {
  id: number;
  user_id: number;
  lead_name: string;
  lead_description: string;
  vendor_id: number;
  lead_file: string;
  created_at: string;
  lead_status: number;
  member_name: string;
  member_email: string;
  member_image: string;
}

// Define vendor profile types
interface VendorProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: number;
}

export default function VendorHomeScreen() {
  const { colors, isDark } = useTheme();
  const globalStyles = createGlobalStyles(colors);
  const navigation = useNavigation<VendorHomeScreenNavigationProp>();
  
  // State for wallet, leads, and vendor profile data
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [leadsData, setLeadsData] = useState<LeadData[]>([]);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch vendor profile data
  const fetchVendorProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        console.warn('No authentication token found');
        return;
      }

      // You can replace this with your actual vendor profile API endpoint
      const response = await fetch('https://crmgcc.net/api/vendor/get_profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.result && data.result.status === 1) {
        setVendorProfile(data.result.data);
      } else {
        console.warn('Vendor profile API warning:', data.result?.message);
        // Fallback to user type from login if profile API fails
        const userType = await AsyncStorage.getItem('user_type');
        if (userType === '3') {
          setVendorProfile({
            id: 0,
            name: 'Vendor',
            email: 'vendor@example.com',
            status: 1
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching vendor profile:', err);
      // Fallback to generic vendor name
      setVendorProfile({
        id: 0,
        name: 'Vendor',
        email: 'vendor@example.com',
        status: 1
      });
    }
  };

  // Fetch wallet data
  const fetchWalletData = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('https://crmgcc.net/api/vendor/get_wallet', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.result && data.result.status === 1) {
        setWalletData(data.result.data);
      } else {
        console.warn('Wallet API warning:', data.result?.message);
      }
    } catch (err: any) {
      console.error('Error fetching wallet data:', err);
    }
  };

  // Fetch leads data
  const fetchLeadsData = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('https://crmgcc.net/api/vendor/getleads', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.result && data.result.status === 1) {
        setLeadsData(data.result.data);
      } else {
        setError(data.result?.message || 'Failed to fetch leads data');
      }
    } catch (err: any) {
      console.error('Error fetching leads data:', err);
      setError(err.message || 'Network error occurred');
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchVendorProfile(), fetchWalletData(), fetchLeadsData()]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const handleTabNavigation = (tabName: keyof VendorTabParamList) => {
    navigation.navigate(tabName);
  };

  const handleStackNavigation = (screenName: string) => {
    // For stack navigation, we need to access the parent navigator
    (navigation as any).navigate(screenName);
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  // Format card number for display (show only last 4 digits)
  const formatCardNumber = (cardNo: string) => {
    if (cardNo && cardNo.length >= 4) {
      return `**** **** **** ${cardNo.slice(-4)}`;
    }
    return '**** **** **** ****';
  };

  // Get card status text
  const getCardStatusText = (status: number) => {
    return status === 1 ? 'Active' : 'Inactive';
  };

  // Get card status color
  const getCardStatusColor = (status: number) => {
    return status === 1 ? colors.success : colors.error;
  };

  // Get lead status text
  const getLeadStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'In Progress';
      case 2: return 'Completed';
      case 3: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  // Get lead status color
  const getLeadStatusColor = (status: number) => {
    switch (status) {
      case 0: return colors.warning;
      case 1: return colors.info;
      case 2: return colors.success;
      case 3: return colors.error;
      default: return colors.textTertiary;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Truncate long text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading dashboard information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {vendorProfile?.name || 'Vendor'} Dashboard
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Welcome back, {vendorProfile?.name || 'Vendor'}!
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Icon name="people-outline" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {leadsData.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Leads</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Icon name="wallet-outline" size={24} color={colors.success} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {walletData?.balance_point || '0'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Balance Points</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Icon name="trending-up-outline" size={24} color={colors.info} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {leadsData.filter(lead => lead.lead_status === 1).length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>In Progress</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.surface }]}
            onPress={() => handleTabNavigation('Leads')}
          >
            <Icon name="people-outline" size={24} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.text }]}>View All Leads</Text>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.surface }]}
            onPress={() => handleTabNavigation('Wallet')}
          >
            <Icon name="wallet-outline" size={24} color={colors.info} />
            <Text style={[styles.actionText, { color: colors.text }]}>Check Wallet</Text>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.surface }]}
            onPress={handleRefresh}
          >
            <Icon name="refresh-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Refresh Data</Text>
            <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          
          {/* Show recent leads as activity items */}
          {leadsData.slice(0, 3).map((lead, index) => (
            <View key={`activity-${lead.id}`} style={[styles.activityItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.activityIcon, { backgroundColor: colors.surfaceVariant }]}>
                <Icon 
                  name={lead.lead_status === 1 ? "time-outline" : lead.lead_status === 2 ? "checkmark-circle" : lead.lead_status === 3 ? "close-circle" : "ellipse-outline"} 
                  size={20} 
                  color={getLeadStatusColor(lead.lead_status)} 
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  {lead.lead_status === 1 ? "Lead in progress" : 
                   lead.lead_status === 2 ? "Lead completed" : 
                   lead.lead_status === 3 ? "Lead cancelled" : 
                   "New lead received"}
                </Text>
                <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>
                  {truncateText(lead.lead_name, 50)}
                </Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                  {formatDate(lead.created_at)}
                </Text>
              </View>
              <View style={[styles.activityStatus, { backgroundColor: getLeadStatusColor(lead.lead_status) + '20' }]}>
                <Text style={[styles.activityStatusText, { color: getLeadStatusColor(lead.lead_status) }]}>
                  {getLeadStatusText(lead.lead_status)}
                </Text>
              </View>
            </View>
          ))}

          {/* Show wallet activity if available */}
          {walletData && (
            <View style={[styles.activityItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.activityIcon, { backgroundColor: colors.surfaceVariant }]}>
                <Icon name="wallet" size={20} color={colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>Wallet Updated</Text>
                <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>
                  Current balance: {walletData.balance_point} points
                </Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>Just now</Text>
              </View>
              <View style={[styles.activityStatus, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.activityStatusText, { color: colors.primary }]}>
                  Active
                </Text>
              </View>
            </View>
          )}

          {/* Show member activity summary */}
          {leadsData.length > 0 && (
            <View style={[styles.activityItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.activityIcon, { backgroundColor: colors.surfaceVariant }]}>
                <Icon name="people" size={20} color={colors.info} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>Member Activity</Text>
                <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>
                  {leadsData.filter(lead => lead.member_name).length} members engaged
                </Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                  {leadsData.length > 1 ? `${leadsData.length} leads this period` : '1 lead this period'}
                </Text>
              </View>
              <View style={[styles.activityStatus, { backgroundColor: colors.info + '20' }]}>
                <Text style={[styles.activityStatusText, { color: colors.info }]}>
                  {leadsData.length}
                </Text>
              </View>
            </View>
          )}

          {/* Show no activity message if no data */}
          {leadsData.length === 0 && !walletData && (
            <View style={[styles.activityItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.activityIcon, { backgroundColor: colors.surfaceVariant }]}>
                <Icon name="information-circle-outline" size={20} color={colors.textTertiary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>No Recent Activity</Text>
                <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>
                  Start by creating leads or check back later
                </Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>No data available</Text>
              </View>
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
  },
  header: {
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
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
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
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
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
  actionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.84,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
  },
  activityStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  activityStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  walletCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  walletLabel: {
    fontSize: 14,
  },
  walletValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.84,
    elevation: 3,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  retryText: {
    fontSize: 14,
  },
  leadCard: {
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.84,
    elevation: 3,
  },
  leadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leadInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  leadStatus: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  leadStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  leadDate: {
    fontSize: 12,
  },
  leadDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  leadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 12,
    marginLeft: 5,
  },
  leadId: {
    fontSize: 12,
  },
});
