import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import colors from '../theme/colors';

export default function ProfileEditScreen() {
  const navigation = useNavigation();
  // Mock state for all fields
  const [profileImg, setProfileImg] = React.useState(require('../../assets/dummy.jpg'));
  const [dob, setDob] = React.useState('1994-09-04');
  const [gender, setGender] = React.useState('Male');
  const [job, setJob] = React.useState('IT Specialist');
  const [address, setAddress] = React.useState('thalil house');
  const [name, setName] = React.useState('Santhosh Thaliyil');
  const [phone, setPhone] = React.useState('9678560115');
  const [password, setPassword] = React.useState('123456');
  const [showPassword, setShowPassword] = React.useState(false);
  const [acNo, setAcNo] = React.useState('1234564444444');
  const [iban, setIban] = React.useState('12341234');
  const [bankName, setBankName] = React.useState('ICIC');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => {/* TODO: Save action */}}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Profile Image */}
        <Text style={styles.sectionTitle}>Profile Image</Text>
        <View style={styles.profileImgRow}>
          <Image source={profileImg} style={styles.profileImg} />
          <TouchableOpacity style={styles.updateImgBtn} onPress={() => {/* TODO: Update image */}}>
            <Text style={styles.updateImgText}>Update Image</Text>
          </TouchableOpacity>
        </View>
        {/* 2. Personal Details */}
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <TextInput style={styles.input} placeholder="Date of Birth" value={dob} onChangeText={setDob} />
        <TextInput style={styles.input} placeholder="Gender" value={gender} onChangeText={setGender} />
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
    marginBottom: 20,
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
}); 