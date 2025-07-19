import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, TextInput, Button, Platform, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyles from '../../theme/globalStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../services/ApiService';
import { Picker } from '@react-native-picker/picker';
import DocumentPicker from 'react-native-document-picker';
import type { DocumentPickerResponse } from 'react-native-document-picker';

function getTruncatedFileName(name: string, maxLength = 24) {
  if (name.length <= maxLength) return name;
  const extIndex = name.lastIndexOf('.');
  if (extIndex === -1) return '...' + name.slice(-maxLength + 3);
  const ext = name.slice(extIndex);
  const base = name.slice(0, extIndex);
  const keep = maxLength - ext.length - 3; // 3 for '...'
  return '...' + base.slice(-keep) + ext;
}

const CreateLeadScreen = () => {
    const navigation = useNavigation();
    const [vendors, setVendors] = useState<Array<{ id: string; name?: string; vendor_name?: string }>>([]);
    const [selectedVendor, setSelectedVendor] = useState('');
    const [leadName, setLeadName] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<DocumentPickerResponse | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState('');

    useEffect(() => {
        // TODO: Replace with real endpoint if available
        const fetchVendors = async () => {
            try {
                // Example endpoint, update as needed
                const json = await ApiService('member/vendorlist');
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
        try {
            const res = await DocumentPicker.pickSingle({
                type: DocumentPicker.types.allFiles,
            });
            setFile(res);
            setUploading(true);
            setUploadSuccess(false);
            // Simulate upload
            uploadFiles({
                uri: res.uri,
                type: res.type || 'application/octet-stream',
                name: res.name || 'upload',
            });
            // setTimeout(() => {
            //     setUploading(false);
            //     setUploadSuccess(true);
            // }, 1500);
        } catch (err: any) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
            } else {
                Alert.alert('File picker error', err.message || 'Unknown error');
            }
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        // TODO: Implement submit logic

        setTimeout(() => {
            setSubmitting(false);
            Alert.alert('Lead submitted (mock)');
            navigation.goBack();
        }, 1000);
    };

    const uploadFiles = async (file) => {
        setUploading(true);
        setUploadSuccess(false);

        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.type || 'application/octet-stream',
            name: file.name || 'upload',
        });

        try {
            const json = await ApiService('member/upload', 'POST', formData);
            console.log('Upload response:', json);
            setUploading(false);
            if (json?.success) {
                setUploadedFileName(json?.filename);
                setUploadSuccess(true);
                
                //Alert.alert('Success', 'File uploaded successfully!');
            } else {
                setUploadSuccess(false);
                //Alert.alert('Upload failed', json?.message || 'Unknown error');
            }
        } catch (err) {
            setUploading(false);
            setUploadSuccess(false);
            Alert.alert('Upload error', err.message || 'Unknown error');
        }
    };

    return (
        <SafeAreaView style={globalStyles.safeContainer}>
            <View style={globalStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={globalStyles.headerTitle}>Create Lead</Text>
            </View>

            <ScrollView style={styles.container}>
                {/* Vendor Dropdown */}
                <Text style={styles.label}>Select Vendor</Text>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={selectedVendor}
                        onValueChange={(itemValue) => setSelectedVendor(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select a vendor" value="" />
                        {vendors.map((vendor) => (
                            <Picker.Item key={vendor.id} label={vendor.name || vendor.vendor_name} value={vendor.id} />
                        ))}
                    </Picker>
                </View>
                {/* Lead Name */}
                <Text style={styles.label}>Lead Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter lead name"
                    value={leadName}
                    onChangeText={setLeadName}
                />
                {/* Description */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, { height: 80 }]}
                    placeholder="Enter description"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />
                {/* File Attach */}
                <Text style={styles.label}>Attach File</Text>
                <TouchableOpacity style={styles.attachButton} onPress={handleFileAttach} disabled={uploading}>
                    <Icon name="attach" size={20} color="#555" />
                    <Text style={styles.attachButtonText} numberOfLines={1}>
                        {file ? getTruncatedFileName(file.name) : 'Attach File'}
                    </Text>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        {uploading && <ActivityIndicator size="small" color="#f8d307" style={{ marginLeft: 8 }} />}
                        {uploadSuccess && !uploading && (
                            <Icon name="checkmark-circle" size={22} color="green" style={{ marginLeft: 8 }} />
                        )}
                    </View>
                </TouchableOpacity>
                {/* Submit Button */}
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
                </TouchableOpacity>
            </ScrollView>
            
            
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
       
      },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
        color: '#222',
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
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    picker: {
        height: Platform.OS === 'ios' ? 180 : 48,
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
        width: 300,
        marginLeft: 8,
        color: '#555',
        fontSize: 15,
    },
    submitButton: {
        marginTop: 32,
        backgroundColor: '#f8d307',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CreateLeadScreen;
