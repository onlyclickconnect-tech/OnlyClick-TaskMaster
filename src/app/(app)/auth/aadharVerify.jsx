import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AadhaarVerify() {
  const params = useLocalSearchParams();
  const phoneNumber = params?.phoneNumber || '';

  const [displayValue, setDisplayValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const rawDigits = useMemo(() => displayValue.replace(/\s+/g, ''), [displayValue]);

  const formatDisplay = (digits) => digits.replace(/(.{4})/g, '$1 ').trim();

  const handleChange = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 12);
    setDisplayValue(formatDisplay(cleaned));
  };

  const handleVerify = async () => {
    if (rawDigits.length !== 12) {
      Alert.alert('Invalid Aadhaar', 'Aadhaar number must be 12 digits');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const next = encodeURIComponent('/(app)/protected/(tabs)/Home');
      router.replace(`/auth/loading?next=${next}&phoneNumber=${encodeURIComponent(phoneNumber)}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to verify Aadhaar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6fbfb" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Aadhaar verification</Text>
          <Text style={styles.subtitle}>Confirm your identity to continue using TaskMaster</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Aadhaar number</Text>
          <TextInput
            value={displayValue}
            onChangeText={handleChange}
            keyboardType="number-pad"
            placeholder="XXXX XXXX XXXX"
            placeholderTextColor="#9aa7a7"
            style={styles.input}
            maxLength={14}
          />

          <Text style={styles.helper}>We only store a masked version of your Aadhaar for verification.</Text>

          <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleVerify} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Continue</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Your data is encrypted and stored securely.</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6fbfb' },
  container: { flex: 1, padding: 20, marginTop: 30 },
  header: { alignItems: 'center', marginTop: 6, marginBottom: 12 },
  back: { position: 'absolute', left: 0, top: 8, padding: 8 },
  backText: { color: '#0b7a78', fontWeight: '700' },
  logo: { width: 140, height: 50, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#072a2a' },
  subtitle: { marginTop: 6, color: '#637d7d', textAlign: 'center', paddingHorizontal: 12 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginTop: 10, elevation: 2 },
  label: { fontSize: 13, color: '#415a5a', fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e6f0ef', padding: 14, borderRadius: 10, fontSize: 18, letterSpacing: 2, backgroundColor: '#fbffff', color: '#052525' },
  helper: { marginTop: 10, color: '#7e9b9b', fontSize: 13 },

  button: { marginTop: 16, backgroundColor: '#0b7a78', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  buttonDisabled: { backgroundColor: '#9fc7c4' },

  footer: { textAlign: 'center', color: '#8a9b9b', marginTop: 18, fontSize: 12 }
});