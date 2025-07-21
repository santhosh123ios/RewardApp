import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import colors from '../theme/colors';
import ApiService from '../services/ApiService';
import { Picker } from '@react-native-picker/picker';
import { Dropdown } from 'react-native-element-dropdown';
import ImageCropPicker from 'react-native-image-crop-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthContext } from '../context/AuthContext';

export default function ProfileEditScreen() {
  const navigation = useNavigation();
  const { logout } = React.useContext(AuthContext);
  // State for all fields
  const [profileImg, setProfileImg] = React.useState(require('../../assets/dummy.jpg'));
  const [dob, setDob] = React.useState('');
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [dobDate, setDobDate] = React.useState<Date>(new Date());
  const [gender, setGender] = React.useState('');
  const [job, setJob] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [acNo, setAcNo] = React.useState('');
  const [iban, setIban] = React.useState('');
  const [bankName, setBankName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'success' | 'failed' | null>(null);
  const [imgUploading, setImgUploading] = React.useState(false);

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const json = await ApiService('member/get_profile', 'GET', null, logout);
      if (json?.result?.status === 1) {
        const data = json.result.data;
        setName(data.name || '');
        setPhone(data.phone || '');
        setProfileImg(data.profile_img ? { uri: 'https://crmgcc.net/uploads/' + data.profile_img } : require('../../assets/dummy.jpg'));
        setPassword(data.password || '');
        setDob(data.dob || '');
        setDobDate(data.dob ? new Date(data.dob) : new Date());
        setGender(data.gender === 0 ? 'Male' : data.gender === 1 ? 'Female' : '');
        setAddress(data.address || '');
        setJob(data.job || '');
        setAcNo(data.ac_no || '');
        setIban(data.iban_no || '');
        setBankName(data.bank_name || '');
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const payload = {
        name,
        phone,
        profile_img: typeof profileImg === 'string' ? profileImg : undefined, // handle image upload separately if needed
        password,
        dob,
        gender: gender === 'Male' ? 0 : gender === 'Female' ? 1 : '',
        address,
        job,
        ac_no: acNo,
        iban_no: iban,
        bank_name: bankName,
      };
      const json = await ApiService('member/update_profile', 'POST', payload, logout);
      if (json?.result?.status === 1) {
        setSaveStatus('success');
        setTimeout(() => {
          setSaveStatus(null);
          navigation.goBack();
        }, 1500);
      } else {
        setSaveStatus('failed');
      }
    } catch (e) {
      setSaveStatus('failed');
    }
    setSaving(false);
  };

  const handleImagePick = async () => {
    try {
      setImgUploading(true);
      // Pick and crop image
      const image = await ImageCropPicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: false,
        compressImageQuality: 0.8,
        mediaType: 'photo',
        cropperToolbarTitle: 'Crop Image',
        forceJpg: true,
      });
      // Upload image
      const formData = new FormData();
      formData.append('file', {
        uri: image.path,
        type: image.mime,
        name: image.filename || 'profile.jpg',
      });
      const uploadRes = await ApiService('member/upload', 'POST', formData, logout);
      const filename = uploadRes?.filename || uploadRes?.result?.data?.filename;
      if (filename) {
        // Update profile image with filename
        const updateRes = await ApiService('member/update_profile_image', 'POST', { profile_img: filename }, logout);
        if (updateRes?.result?.status === 1) {
          setProfileImg({ uri: 'https://crmgcc.net/uploads/' + filename });
        } else {
          Alert.alert('Error', 'Failed to update profile image.');
        }
      } else {
        Alert.alert('Error', 'Failed to upload image.');
      }
    } catch (e: any) {
      if (e?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Image selection failed.');
      }
    }
    setImgUploading(false);
  };

  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* 1. Profile Image */}
            <Text style={styles.sectionTitle}>Profile Image</Text>
            <View style={styles.profileImgRow}>
              <Image source={profileImg} style={styles.profileImg} />
              <TouchableOpacity style={styles.updateImgBtn} onPress={handleImagePick}>
                <Text style={styles.updateImgText}>{imgUploading ? 'Uploading...' : 'Update Image'}</Text>
              </TouchableOpacity>
            </View>
            {/* 2. Personal Details */}
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.dobRow}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TouchableOpacity
                  style={styles.dobButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dobButtonText}>{dob ? dob : 'Select Date'}</Text>
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <DateTimePicker
                  value={dobDate}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === 'set' && selectedDate) {
                      setDobDate(selectedDate);
                      const yyyy = selectedDate.getFullYear();
                      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                      const dd = String(selectedDate.getDate()).padStart(2, '0');
                      setDob(`${yyyy}-${mm}-${dd}`);
                    }
                  }}
                />
              )}
            </View>
            <Dropdown
              style={styles.dropdown}
              data={genderOptions}
              labelField="label"
              valueField="value"
              placeholder="Select Gender"
              value={gender}
              onChange={item => setGender(item.value)}
              containerStyle={styles.dropdownContainer}
            />
            <TextInput style={styles.input} placeholder="Job" value={job} onChangeText={setJob} />
            <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
            {/* 3. Basic Details */}
            <Text style={styles.sectionTitle}>Basic Details</Text>
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {/* 4. Bank Details */}
            <Text style={styles.sectionTitle}>Bank Details</Text>
            <TextInput style={styles.input} placeholder="Account Number" value={acNo} onChangeText={setAcNo} />
            <TextInput style={styles.input} placeholder="IBAN Number" value={iban} onChangeText={setIban} />
            <TextInput style={styles.input} placeholder="Bank Name" value={bankName} onChangeText={setBankName} />
            {saving && (
              <View style={{ alignItems: 'center', marginTop: 20 }}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
            {saveStatus === 'success' && (
              <Text style={{ color: 'green', textAlign: 'center', marginTop: 16, fontWeight: 'bold' }}>Profile updated successfully!</Text>
            )}
            {saveStatus === 'failed' && (
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 16, fontWeight: 'bold' }}>Failed to update profile. Please try again.</Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  saveText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 24,
    marginBottom: 12,
  },
  profileImgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  updateImgBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  updateImgText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
    paddingRight: 40, // space for eye icon
    marginBottom: 20,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    bottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    width: '100%',
    height: 48,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingHorizontal: 12,
    height: 48,
  },
  dropdownContainer: {
    borderRadius: 8,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
    overflow: 'hidden',
  },
  dropdownPicker: {
    width: '100%',
    height: 48,
    backgroundColor: 'transparent',
    color: '#222',
  },
  inputLabel: { 
    fontSize: 15, 
    color: '#222', 
    marginLeft: 12, 
    fontWeight: '500' 
  },
  inputFullWidth: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    backgroundColor: '#fff', 
    marginBottom: 20 },

  dobRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    backgroundColor: '#fff', 
    marginBottom: 20, 
    paddingHorizontal: 0, 
    justifyContent: 'space-between' 
  },
  dobButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    backgroundColor: colors.primary, 
    borderRadius: 6 
  },
  dobButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 15 
  },
}); 