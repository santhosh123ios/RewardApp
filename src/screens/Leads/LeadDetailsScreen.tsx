import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, SafeAreaView, FlatList } from 'react-native';
import ApiService from '../../services/ApiService';
import Icon from 'react-native-vector-icons/Ionicons';
import globalStyles from '../../theme/globalStyles';
import { useNavigation } from '@react-navigation/native';

function formatFriendlyDateTime(dateString) {
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

const LeadDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { lead } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false); // Re-add sending state for disabling button
  const scrollViewRef = useRef(null);

  useEffect(() => {
    fetchMessages(lead.id);
  }, [lead.id]);

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
      }, 100); // 100ms is usually enough
    }
  }, [loading, messages]);

  const fetchMessages = async (leadId) => {
    setLoading(true);
    try {
      const json = await ApiService('member/get_lead_message', 'POST', { lead_id: leadId });
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

  // Dummy send handler (does not send to API)
  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const newMessage = {
        text: input,
        lead_id: lead.id,
      };
      const json = await ApiService('member/create_lead_message', 'POST', newMessage);
      if (json?.result?.status === 1) {
        setInput('');
        fetchMessages(lead.id); // Refresh messages from server
      } else {
        // Optionally show an error
        alert(json?.result?.message || 'Failed to send message');
      }
    } catch (e) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Helper to determine if the message is from 'me' or 'other'
  const getSenderType = (msg) => {
    // Replace 40 with the current user id if available
    return msg.sender === 40 ? 'me' : 'other';
  };

  const statusMap = {
    '0': { color: 'orange', text: 'PENDING' },
    '1': { color: 'yellow', text: 'REVIEW' },
    '2': { color: 'paleturquoise', text: 'Processing' },
    '3': { color: 'green', text: 'DONE' },
    '4': { color: 'red', text: 'REJECTED' },
  };

  let lastDate = '';
  return (
    <SafeAreaView style={globalStyles.safeContainer}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1 , paddingTop: 25}}>
          {/* Header */}
          <View style={globalStyles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ zIndex: 2 }}
            >
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={globalStyles.headerTitle}>Lead Details</Text>
          </View>
          {/* Lead Details Card */}
          <View style={styles.leadItem}>
            <View>
              <Image
                source={lead.vendor_image ? { uri: 'https://crmgcc.net/uploads/' + lead.vendor_image } : require('../../../assets/dummy.jpg')}
                style={styles.leadImage}
              />
            </View>
            <View style={styles.leadInfo}>
              <Text style={styles.leadTitle}>{lead.lead_name}</Text>
              <Text style={styles.leadDescription}>{lead.lead_description}</Text>
              <Text style={styles.leadDatetime}>{new Date(lead.created_at).toLocaleString()}</Text>
              <View style={styles.statusRow}>
                <Text style={[styles.statusText, { color: statusMap[lead.lead_status]?.color || 'gray' }]}> 
                  {statusMap[lead.lead_status]?.text || 'UNKNOWN'}
                </Text>
                <View style={[styles.statusDot, { backgroundColor: statusMap[lead.lead_status]?.color || 'gray' }]} />
              </View>
            </View>
          </View>
          {/* Chat Section */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
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
              })
            }
          </ScrollView>
          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              value={input}
              onChangeText={setInput}
              multiline
              underlineColorAndroid="transparent" // Remove Android underline
              textAlignVertical="center" // Ensures proper text alignment on Android
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
  container: { flex: 1, backgroundColor: '#fff' },
  messagesContainer: { flex: 1, paddingRight: 16, paddingLeft: 16},
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
  messageText: { fontSize: 16, color: '#222' },
  messageMeta: { fontSize: 12, color: '#888', marginTop: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
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
  leadItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
    marginLeft: 4,
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

export default LeadDetailsScreen;