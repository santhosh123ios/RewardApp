import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import colors from '../theme/colors';
import { RootStackParamList } from '../types/navigation';

type SupportScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Support'>;

export default function SupportScreen() {
  const navigation = useNavigation<SupportScreenNavigationProp>();

  const handleBackPress = () => {
    // Since this screen is accessed from tab navigator, always navigate back to VendorDashboard
    navigation.navigate('VendorDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerBtn}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerBtn} />
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        
        <TouchableOpacity style={styles.supportItem}>
          <Icon name="call" size={20} color={colors.primary} />
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>Call Support</Text>
            <Text style={styles.supportSubtitle}>+1 (555) 123-4567</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.supportItem}>
          <Icon name="mail" size={20} color={colors.primary} />
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>Email Support</Text>
            <Text style={styles.supportSubtitle}>support@rewardapp.com</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.supportItem}>
          <Icon name="chatbubble" size={20} color={colors.primary} />
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>Live Chat</Text>
            <Text style={styles.supportSubtitle}>Available 24/7</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <Text style={styles.sectionTitle}>FAQ</Text>
        
        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I create a lead?</Text>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I update my profile?</Text>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>How do I withdraw earnings?</Text>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.faqItem}>
          <Text style={styles.faqQuestion}>What are the commission rates?</Text>
          <Icon name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 25,
  },
  headerBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 20,
    marginBottom: 15,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  supportContent: {
    flex: 1,
    marginLeft: 12,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  supportSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 16,
    color: '#222',
    flex: 1,
  },
});
