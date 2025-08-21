import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  scanningFor?: 'card' | 'offer';
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, scanningFor }) => {
  const { colors } = useTheme();
  const [manualInput, setManualInput] = useState('');

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    } else {
      Alert.alert('Error', 'Please enter a value to scan');
    }
  };

  const handleDemoScan = () => {
    const demoData = scanningFor === 'card' ? '5523955395591429' : 'MTo0NQ==.462f5554';
    console.log('QR Scanner: Simulating scan for', scanningFor, 'with data:', demoData);
    onScan(demoData);
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>QR Code Scanner</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Scanning Frame */}
        <View style={styles.scanFrame}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Position the QR code within the frame
          </Text>
        </View>

        {/* Manual Input Section */}
        <View style={styles.manualSection}>
          <Text style={styles.manualLabel}>Or enter manually:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder={`Enter ${scanningFor === 'card' ? 'card number' : 'offer code'}`}
              placeholderTextColor={colors.placeholder}
              value={manualInput}
              onChangeText={setManualInput}
              keyboardType={scanningFor === 'card' ? 'numeric' : 'default'}
              autoCapitalize={scanningFor === 'card' ? 'none' : 'characters'}
            />
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleManualSubmit}
            >
              <Icon name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Scan Button */}
        <View style={styles.demoSection}>
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={handleDemoScan}
          >
            <Icon name="scan" size={24} color="#00ff00" />
            <Text style={styles.demoButtonText}>Demo Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  scanFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 250,
    height: 250,
    marginLeft: -125,
    marginTop: -125,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00ff00',
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTopRight: {
    right: 0,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructions: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  manualSection: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
  },
  manualLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  submitButton: {
    padding: 12,
    backgroundColor: '#00ff00',
    borderRadius: 8,
  },
  demoSection: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    gap: 10,
  },
  demoButtonText: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRScanner;
