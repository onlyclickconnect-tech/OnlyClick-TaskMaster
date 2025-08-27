import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../../../../components/common/AppHeader';
const STATUSBAR_PADDING = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12;

export default function HelpSupport() {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('General');
  const subjects = ['General', 'Account', 'Payment', 'Booking', 'Technical'];

  const send = () => {
    if (!message) { Alert.alert('Please enter a message'); return; }
    const subj = `${subject} - Support request`;
    const body = `${message}\n\n--\nApp: TaskMaster`;
    const url = `mailto:support@taskmaster.example?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open mail client'));
  };

  const callSupport = () => Linking.openURL('tel:+911234567890').catch(() => Alert.alert('Call', 'Unable to start call'));
  const openEmail = () => Linking.openURL('mailto:support@taskmaster.example').catch(() => Alert.alert('Email', 'Unable to open email'));

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Help & Support" showBack onBack={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.topCard}>
          <Text style={styles.h1}>How can we help?</Text>
          <Text style={styles.hint}>Choose a topic and describe the issue — we'll reply by email within one business day.</Text>

          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={openEmail}><Ionicons name="mail" size={20} color="#177a81" /><Text style={styles.actionText}>Email</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={callSupport}><Ionicons name="call" size={20} color="#177a81" /><Text style={styles.actionText}>Call</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Live chat', 'Live chat is coming soon')}><Ionicons name="chatbubble-ellipses" size={20} color="#177a81" /><Text style={styles.actionText}>Chat</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Subject</Text>
          <View style={styles.subjectRow}>
            {subjects.map(s => (
              <TouchableOpacity key={s} onPress={() => setSubject(s)} style={[styles.subjectPill, subject === s && styles.subjectActive]}><Text style={[styles.subjectText, subject === s && styles.subjectTextActive]}>{s}</Text></TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Message</Text>
          <TextInput value={message} onChangeText={setMessage} style={styles.textArea} multiline placeholder="Please describe your issue in detail..." />

          <View style={styles.formActions}>
            <TouchableOpacity style={styles.sendBtn} onPress={send}><Text style={styles.sendText}>Send to support</Text></TouchableOpacity>
            <TouchableOpacity style={styles.linkBtn} onPress={() => { setMessage(''); setSubject('General'); }}><Text style={styles.linkText}>Clear</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.faqCard}>
          <Text style={styles.h2}>Popular help topics</Text>
          <TouchableOpacity style={styles.faqItem} onPress={() => Alert.alert('FAQ', 'How to reset password: Go to settings → Account → Reset password')}><Text style={styles.faqTitle}>How to reset my password?</Text></TouchableOpacity>
          <TouchableOpacity style={styles.faqItem} onPress={() => Alert.alert('FAQ', 'Payments: We support cards and bank transfers via the Payments section')}><Text style={styles.faqTitle}>Payment methods and refunds</Text></TouchableOpacity>
          <TouchableOpacity style={styles.faqItem} onPress={() => Alert.alert('FAQ', 'Bookings: Open the Jobs tab to see booking history')}><Text style={styles.faqTitle}>View booking history</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerWrap: { backgroundColor: '#4ab9cf', paddingTop: STATUSBAR_PADDING, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { padding: 20 },
  topCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, elevation: 2 },
  h1: { fontSize: 18, fontWeight: '800' },
  hint: { color: '#666', marginTop: 6 },
  quickRow: { flexDirection: 'row', marginTop: 12, justifyContent: 'space-between' },
  actionBtn: { flex: 1, backgroundColor: '#f2fbfb', padding: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 6 },
  actionText: { marginTop: 6, color: '#177a81', fontWeight: '700' },
  formCard: { backgroundColor: '#fff', marginTop: 14, padding: 14, borderRadius: 12, elevation: 2 },
  label: { fontWeight: '700', marginBottom: 8 },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap' },
  subjectPill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#f6fbfb', marginRight: 8, marginBottom: 8 },
  subjectActive: { backgroundColor: '#4ab9cf' },
  subjectText: { color: '#177a81', fontWeight: '700' },
  subjectTextActive: { color: '#fff' },
  textArea: { backgroundColor: '#f6fbfb', minHeight: 120, borderRadius: 8, padding: 12, textAlignVertical: 'top' },
  formActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  sendBtn: { backgroundColor: '#177a81', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, marginRight: 12 },
  sendText: { color: '#fff', fontWeight: '800' },
  linkBtn: { padding: 8 },
  linkText: { color: '#666', fontWeight: '700' },
  faqCard: { marginTop: 14 },
  h2: { fontWeight: '800', marginBottom: 8 },
  faqItem: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, elevation: 1 },
  faqTitle: { fontWeight: '700' }
});
