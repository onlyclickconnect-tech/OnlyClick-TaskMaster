import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Linking, Platform, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../../../../components/common/AppHeader';
import Text from '../../../../../components/ui/Text';
const STATUSBAR_PADDING = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12;

export default function HelpSupport() {
  const openWhatsApp = () => {
    const phoneNumber = '+919121377419'; // Replace with your support WhatsApp number
    const message = 'Hi, I need help with TaskMaster app';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      // Fallback to web WhatsApp if app is not installed
      const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      Linking.openURL(webUrl).catch(() => Alert.alert('Error', 'Unable to open WhatsApp'));
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Help & Support" showBack onBack={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.topCard}>
          <Text style={styles.h1}>Need Help?</Text>
          <Text style={styles.hint}>Contact our support team via WhatsApp for quick assistance.</Text>

          <View style={styles.whatsappContainer}>
            <TouchableOpacity style={styles.whatsappBtn} onPress={openWhatsApp}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
              <Text style={styles.whatsappText}>Chat on WhatsApp</Text>
            </TouchableOpacity>
          </View>
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
  whatsappContainer: { alignItems: 'center', marginTop: 20 },
  whatsappBtn: { backgroundColor: '#1d1e1eff', flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  whatsappText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 10 },
  faqCard: { marginTop: 14 },
  h2: { fontWeight: '800', marginBottom: 8 },
  faqItem: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, elevation: 1 },
  faqTitle: { fontWeight: '700' }
});
