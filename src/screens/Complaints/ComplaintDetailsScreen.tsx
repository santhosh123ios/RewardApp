import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import ApiService from '../../services/ApiService';
import globalStyles from '../../theme/globalStyles';
import colors from '../../theme/colors';

// Complaint type
export type Complaint = {
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

type RootStackParamList = {
  ComplaintDetails: { complaint: Complaint };
};

type ComplaintDetailsRouteProp = RouteProp<RootStackParamList, 'ComplaintDetails'>;

function formatFriendlyDateTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  let dayPart = '';
  if (isToday) {
    dayPart = 'Today';
  } else if (isYesterday) {
    dayPart = 'Yesterday';
  } else {
    dayPart = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;

  return `${dayPart}, ${hours}:${minutes} ${ampm}`;
}

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

const statusMap: { [key: number]: { color: string; text: string } } = {
  0: { text: 'Open', color: 'orange' },
  1: { text: 'Closed', color: 'green' },
  2: { text: 'In Progress', color: 'blue' },
};

const ComplaintDetailsScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<ComplaintDetailsRouteProp>();
  const { complaint } = route.params;

  // Chat state
  const [messages, setMessages] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchMessages(complaint.id);
  }, [complaint.id]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (!loading && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [loading, messages]);

  const fetchMessages = async (complaintId: number) => {
    setLoading(true);
    try {
      const json = await ApiService('member/get_complaint_message', 'POST', { complaint_id: complaintId });
      if (json?.result?.status === 1) {
        setMessages(json.result.data);
      } else {
        setMessages([]);
      }
    } catch (e) {
      setMessages([]);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const newMessage = {
        text: input,
        complaint_id: complaint.id,
      };
      const json = await ApiService('member/create_complaint_message', 'POST', newMessage);
      if (json?.result?.status === 1) {
        setInput('');
        fetchMessages(complaint.id); // Refresh messages from server
      } else {
        // Optionally show an error
        Alert.alert('Error', json?.result?.message || 'Failed to send message');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Helper to determine if the message is from 'me' or 'other'
  const getSenderType = (msg: any) => {
    // Replace 40 with the current user id if available
    return msg.sender === 40 ? 'me' : 'other';
  };

  let lastDate = '';

  return (
    <SafeAreaView style={globalStyles.safeContainer}>
      <View style={globalStyles.header}><TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ zIndex: 2 }}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>Complaint Details</Text>
      </View>
      {/* Complaint details at the top */}
      <View style={styles.complaintItem}>
        <Image
          source={
            complaint.vendor_image
              ? { uri: 'https://crmgcc.net/uploads/' + complaint.vendor_image }
              : require('../../../assets/dummy.jpg')
          }
          style={styles.vendorImage}
        />
        <View style={styles.complaintInfo}>
          <Text style={styles.subject}>{complaint.subject}</Text>
          <Text style={styles.message}>{complaint.message}</Text>
          <Text style={styles.meta}>ID: {complaint.id}</Text>
          <Text style={styles.metas}>{formatDate(complaint.created_at)}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text style={[styles.statusText, { color: statusMap[complaint.status]?.color || 'gray' }]}> 
            {statusMap[complaint.status]?.text || 'UNKNOWN'}
          </Text>
          <View style={[styles.statusDot, { backgroundColor: statusMap[complaint.status]?.color || 'gray' }]} />
        </View>
      </View>
      {/* Chat section */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.chatContainer}>
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, idx) => {
              const msgDate = new Date(msg.create_at);
              const dateKey = msgDate.toDateString();
              let showDate = false;
              if (dateKey !== lastDate) {
                showDate = true;
                lastDate = dateKey;
              }
              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <View style={styles.dateSeparator}>
                      <Text style={styles.dateSeparatorText}>
                        {formatFriendlyDateTime(msg.create_at).split(',')[0]}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      getSenderType(msg) === 'me' ? styles.myMessage : styles.otherMessage,
                    ]}
                  >
                    <Text style={styles.messageText}>{msg.text}</Text>
                    <Text style={styles.messageMeta}>
                      {formatFriendlyDateTime(msg.create_at).split(',')[1]?.trim()}
                    </Text>
                  </View>
                </React.Fragment>
              );
            })}
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending}>
              <Icon name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  complaintItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 10,
    margin: 16,

  },
  vendorImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 20,
  },
  complaintInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  subject: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  metas: {
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
  messageMeta: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  dateSeparatorText: {
    color: '#555',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default ComplaintDetailsScreen; 