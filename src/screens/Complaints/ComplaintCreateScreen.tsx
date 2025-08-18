import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import globalStyles from '../../theme/globalStyles';
import ApiService from '../../services/ApiService';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary, Asset, ImageLibraryOptions } from 'react-native-image-picker';
import { AuthContext } from '../../context/AuthContext';

function getTruncatedFileName(name: string, maxLength = 24) {
  if (name.length <= maxLength) return name;
  const extIndex = name.lastIndexOf('.');
  if (extIndex === -1) return '...' + name.slice(-maxLength + 3);
  const ext = name.slice(extIndex);
  const base = name.slice(0, extIndex);
  const keep = maxLength - ext.length - 3;
  return '...' + base.slice(-keep) + ext;
}

const ComplaintCreateScreen = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const [vendors, setVendors] = useState<Array<{ id: string; name?: string; vendor_name?: string }>>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<Asset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const json = await ApiService('member/vendorlist', 'GET', null, logout);
        if (json?.result?.status === 1) {
          setVendors(json.result.data);
        } else {
          setVendors([]);
        }
      } catch (e) {
        setVendors([]);
      }
    };
    fetchVendors();
  }, []);

  const handleFileAttach = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'mixed', // images and videos
      selectionLimit: 1,
    };
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        // User cancelled
        return;
      }
      if (response.errorCode) {
        Alert.alert('Picker Error', response.errorMessage || 'Unknown error');
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setFile(asset);
        setUploading(true);
        setUploadSuccess(false);
        await uploadFiles({
          uri: asset.uri || '',
          type: asset.type || 'application/octet-stream',
          name: asset.fileName || 'upload',
        });
      }
    });
  };

  const uploadFiles = async (file: { uri: string; type: string; name: string }) => {
    setUploading(true);
    setUploadSuccess(false);
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'application/octet-stream',
      name: file.name || 'upload',
    } as any);
    try {
      const json = await ApiService('member/upload', 'POST', formData, logout);
      setUploading(false);
      if (json?.success) {
        setUploadedFileName(json?.filename);
        setUploadSuccess(true);
        Alert.alert('Success', 'File uploaded successfully!');
      } else {
        setUploadSuccess(false);
        Alert.alert('Upload failed', json?.message || 'Unknown error');
      }
    } catch (err: any) {
      setUploading(false);
      setUploadSuccess(false);
      Alert.alert('Upload error', err.message || 'Unknown error');
    }
  };

  const handleSubmit = async () => {
    if (!selectedVendor || !subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        vendor_id: selectedVendor,
        subject,
        message,
        attachment: uploadedFileName || '',
      };
      const json = await ApiService('member/create_complaint', 'POST', payload, logout);
      if (json?.result?.status) {
        Alert.alert('Success', 'Complaint submitted!');
        navigation.goBack();
      } else {
        Alert.alert('Error', json?.result?.message || 'Failed to submit complaint.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to submit complaint.');
    }
    setSubmitting(false);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={globalStyles.safeContainer}>
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}
          style={{ zIndex: 2 }}
          >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>Create Complaint</Text>
      </View>
      <ScrollView style={styles.container}>
        {/* Vendor Dropdown */}
        <Text style={styles.label}>Select Vendor</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedVendor}
            onValueChange={(itemValue: string) => setSelectedVendor(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a vendor" value="" />
            {vendors.map((vendor) => (
              <Picker.Item key={vendor.id} label={vendor.name || vendor.vendor_name} value={vendor.id} />
            ))}
          </Picker>
        </View>
        {/* Subject */}
        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter subject"
          value={subject}
          onChangeText={setSubject}
        />
        {/* Message */}
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter message"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />
        {/* File Attach */}
        <Text style={styles.label}>Attach File (Image/Video)</Text>
        <TouchableOpacity style={styles.attachButton} onPress={handleFileAttach} disabled={uploading}>
          <Icon name="attach" size={20} color="#555" />
          <Text style={[styles.attachButtonText, { flex: 1 }]} numberOfLines={1}>
            {file ? getTruncatedFileName(file.fileName || file.uri || '') : 'Attach File'}
          </Text>
          <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 0}}>
              {uploading && <ActivityIndicator size="small" color="#f8d307" style={{ marginLeft: 8 }} />}
              {uploadSuccess && !uploading && (
                  <Icon name="checkmark-circle" size={22} color="green" style={{ marginLeft: 8 }} />
              )}
          </View>
        </TouchableOpacity>
        {/* Submit Button Only */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit} disabled={submitting}>
            <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: Platform.OS === 'ios' ? 180 : 49,
    width: '100%',
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#f5f5f5',
  },
  attachButtonText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 15,
    minWidth: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 0,
  },
  submitButton: {
    backgroundColor: '#f8d307',
    margin:0,
  },
  submitButtonText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#eee',
  },
  cancelButtonText: {
    color: '#d0021b',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ComplaintCreateScreen; 