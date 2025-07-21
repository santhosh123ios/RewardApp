import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import globalStyles from '../../theme/globalStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useState, useRef } from 'react';

// Define the Lead type (should match LeadsScreen)
type Lead = {
  id: string;
  vendor_image: string;
  lead_name: string;
  lead_description: string;
  created_at: string;
  lead_status: string;
};

type RootStackParamList = {
  LeadDetails: { lead: Lead };
};

type LeadDetailsRouteProp = RouteProp<RootStackParamList, 'LeadDetails'>;

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

// Add statusMap for status color and text
const statusMap: { [key: string]: { color: string; text: string } } = {
  '0': { color: 'orange', text: 'PENDING' },
  '1': { color: 'yellow', text: 'REVIEW' },
  '2': { color: 'paleturquoise', text: 'Processing' },
  '3': { color: 'green', text: 'DONE' },
  '4': { color: 'red', text: 'REJECTED' },
};

const LeadDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<LeadDetailsRouteProp>();
  const { lead } = route.params;

  // Chat state
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'me' | 'other' }>>([
    // Example initial message
     { id: '1', text: 'Welcome to the chat!', sender: 'other' },
  ]);
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (input.trim()) {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), text: input, sender: 'me' },
      ]);
      setInput('');
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeContainer}>
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>Lead Details</Text>
      </View>
      <View style={styles.leadItem}>
        <Image
          source={
            lead.vendor_image
              ? { uri: 'https://crmgcc.net/uploads/' + lead.vendor_image }
              : require('../../../assets/dummy.jpg')
          }
          style={styles.leadImage}
        />
        <View style={styles.leadInfo}>
          <Text style={styles.leadTitle}>{lead.lead_name}</Text>
          <Text style={styles.leadDescription}>{lead.lead_description}</Text>
          <Text style={styles.leadDatetime}>{formatDate(lead.created_at)}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text style={[styles.statusText, { color: statusMap[lead.lead_status]?.color || 'gray' }]}> 
            {statusMap[lead.lead_status]?.text || 'UNKNOWN'}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: statusMap[lead.lead_status]?.color || 'gray' }]} />
        </View>
      </View>
      {/* Chat section */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0} // Try 0, or adjust as needed
      >
        <View style={styles.chatContainer}>
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.sender === 'me' ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Icon name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
  },
  messagesContainer: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: colors.white,
    justifyContent: 'center',
    
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    height: 40,
    width: 40,
    backgroundColor: '#25D366',
    borderRadius: 24,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#222',
  },
  leadItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 10,
    margin: 16,
  },
  leadImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 20,
  },
  leadInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  leadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  leadDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  leadDatetime: {
    fontSize: 14,
    color: '#999',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'green',
  },
});

export default LeadDetailsScreen;