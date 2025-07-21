import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, TextInput, Button, Platform, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyles from '../../theme/globalStyles';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ApiService from '../../services/ApiService';
import { Picker } from '@react-native-picker/picker';
import DocumentPicker from 'react-native-document-picker';
import type { DocumentPickerResponse } from 'react-native-document-picker';
import { AuthContext } from '../../context/AuthContext';

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
    const route = useRoute<RouteProp<{ params: { vendor?: { id?: string; name?: string; vendor_name?: string } } }, 'params'>>();
    const vendorParam = route.params?.vendor;
    const { logout } = React.useContext(AuthContext);
    const [vendors, setVendors] = useState<Array<{ id: string; name?: string; vendor_name?: string }>>([]);
    const [selectedVendor, setSelectedVendor] = useState<string>('');
    const [leadName, setLeadName] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<DocumentPickerResponse | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState('');

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const json = await ApiService('member/vendorlist', 'GET', null, logout);
                if (json?.result?.status === 1) {
                    setVendors(json.result.data);
                    // If vendorParam is provided, pre-select it
                    if (vendorParam) {
                        // Try to find the vendor by id or name
                        const found = json.result.data.find((v: { id: string; name?: string; vendor_name?: string }) => v.id === vendorParam.id || v.name === vendorParam.name || v.vendor_name === vendorParam.vendor_name);
                        if (found) setSelectedVendor(found.id);
                    }
                } else {
                    setVendors([]);
                }
            } catch (e: unknown) {
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
        } catch (err: any) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker
            } else {
                Alert.alert('File picker error', err.message || 'Unknown error');
            }
        }
    };

    const handleSubmit = async () => {
        if (!selectedVendor || !leadName || !description || !uploadedFileName) {
            Alert.alert('Error', 'Please fill all fields and upload a file.');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                vendor_id: selectedVendor,
                lead_name: leadName,
                lead_description: description,
                lead_file: uploadedFileName,
            };

            const json = await ApiService('member/create-leads', 'POST', payload, logout);
            setSubmitting(false);
            if (json?.result?.status) {
                Alert.alert('Success', 'Lead created successfully!');
                navigation.goBack();
            } else {
                Alert.alert('Error', json?.message || 'Failed to create lead');
            }
        } catch (err) {
            setSubmitting(false);
            Alert.alert('Error', err.message || 'Unknown error');
        }
    };

    const uploadFiles = async (file: { uri: string; type: string; name: string }) => {
        setUploading(true);
        setUploadSuccess(false);

        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.type || 'application/octet-stream',
            name: file.name || 'upload',
        });

        try {
            const json = await ApiService('member/upload', 'POST', formData, logout);
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
        } catch (err: unknown) {
            setUploading(false);
            setUploadSuccess(false);
            Alert.alert('Upload error', (err as Error).message || 'Unknown error');
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
                        onValueChange={(itemValue: string) => setSelectedVendor(itemValue)}
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
        padding: 16,
       
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
