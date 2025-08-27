import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    Linking,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ServiceDetail({ visible, onClose, service, mode = 'Pending', onAccept, onComplete }) {
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dx) < 20,
    onPanResponderMove: (evt, gestureState) => {
      // only allow downward drag
      if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const shouldClose = gestureState.dy > 120 || gestureState.vy > 1.2;
      if (shouldClose) {
        // animate down then close
        Animated.timing(translateY, { toValue: 500, duration: 200, useNativeDriver: true }).start(() => {
          close();
          translateY.setValue(0);
        });
      } else {
        Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }).start();
      }
    },
  })).current;

  // wrapper to ensure receipt is cleared when modal closes; animate sheet down first
  const close = () => {
    setShowReceipt(false);
    Animated.timing(translateY, { toValue: 500, duration: 200, useNativeDriver: true }).start(() => {
      onClose && onClose();
      translateY.setValue(0);
    });
  };

  // hide receipt whenever modal visibility or mode changes (only allowed for Completed)
  useEffect(() => {
    if (!visible || mode !== 'Completed') setShowReceipt(false);
    if (visible) {
      // slide sheet up when opened
      translateY.setValue(500);
      Animated.timing(translateY, { toValue: 0, duration: 230, useNativeDriver: true }).start();
    } else {
      translateY.setValue(0);
    }
  }, [visible, mode]);

  if (!service) return null;

  const callCustomer = () => {
    const phone = service.phone || service.customerPhone || service.phoneNumber || '';
    if (!phone) return Alert.alert('No phone', 'Customer phone number is not available');
    Linking.openURL(`tel:${phone}`);
  };

  const acceptJob = () => {
  if (onAccept) onAccept(service);
  else Alert.alert('Accepted', 'Job accepted.');
  close();
  };

  const verifyOtp = () => {
    if (!otp) return Alert.alert('OTP required', 'Please enter the OTP');
    const valid = otp === '1234' || otp.length === 4; // demo rule
    if (!valid) return Alert.alert('Invalid OTP', 'The entered OTP is incorrect');
  if (onComplete) onComplete(service);
  Alert.alert('Success', 'OTP verified. Job has started.');
  setOtp('');
  close();
  };

  const submitOtp = () => {
    if (!otp) return Alert.alert('OTP required', 'Please enter the OTP');
    const valid = otp === '1234' || otp.length === 4; // demo rule
    if (!valid) return Alert.alert('Invalid OTP', 'The entered OTP is incorrect');
    setSubmitting(true);
    setTimeout(() => {
  setSubmitting(false);
  Alert.alert('Success', 'Job is successfully accepted');
  if (onComplete) onComplete(service);
  setOtp('');
  close();
    }, 700);
  };

  return (
    <Modal visible={visible} animationType="none" transparent presentationStyle="overFullScreen">
      <View style={styles.backdrop}>
        <Animated.View style={[styles.container, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
          {/* drag handle - attach pan responder here so inner buttons don't block drags */}
          <View style={styles.dragHandle} {...panResponder.panHandlers}>
            <View style={styles.dragBar} />
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{service.serviceName}</Text>
          </View>

          <View style={styles.topRow}>
            <Image source={{ uri: service.image || 'https://picsum.photos/200' }} style={styles.image} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{service.customerName}</Text>
              <Text style={styles.address}>{service.address}</Text>
              <Text style={styles.info}>Booking ID: {service._id || '—'}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={callCustomer}>
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.callText}>Call Customer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={styles.sectionText}>Service: {service.serviceName}</Text>
            <Text style={styles.sectionText}>Address: {service.address}</Text>
            <Text style={styles.sectionText}>Payment: {service.payment || service.price || '—'}</Text>
            <Text style={styles.sectionText}>Distance: {service.distance || '—'}</Text>
            <Text style={styles.sectionText}>Estimated Time: {service.estimatedTime || '—'}</Text>
            <Text style={styles.sectionText}>Urgency: {service.urgency || '—'}</Text>
            <Text style={styles.sectionText}>Customer Rating: {service.customerRating ? `${service.customerRating} ⭐` : '—'}</Text>
            {service.description && (
              <Text style={styles.sectionText}>Description: {service.description}</Text>
            )}
          </View>

          {mode === 'Completed' && (
            <View style={styles.completedSection}>
              <Text style={styles.completedTitle}>Job Completed</Text>
              <Text style={styles.sectionText}>Amount received: {service.amountReceived || service.payment || '—'}</Text>
              <Text style={styles.sectionText}>Payment method: {service.paymentMethod || 'Cash'}</Text>
              {service.completedTime && (
                <Text style={styles.sectionText}>Completed at: {service.completedTime}</Text>
              )}
              {service.actualDuration && (
                <Text style={styles.sectionText}>Duration: {service.actualDuration}</Text>
              )}
              {service.customerFeedback && (
                <Text style={styles.sectionText}>Feedback: {service.customerFeedback}</Text>
              )}
              {service.tipReceived && (
                <Text style={styles.sectionText}>Tip received: {service.tipReceived}</Text>
              )}
            </View>
          )}

          {showReceipt && mode === 'Completed' && (
            <View style={styles.receiptBox}>
              <Text style={styles.receiptTitle}>Receipt</Text>
              <View style={{ marginTop: 8 }}>
                <Text style={styles.receiptRow}>Transaction ID: {service.txnId ?? 'TXN' + (service._id || '000')}</Text>
                <Text style={styles.receiptRow}>Date: {service.completedAt ?? new Date().toLocaleDateString()}</Text>
                <Text style={styles.receiptRow}>Amount: {service.amountReceived ?? service.price ?? '—'}</Text>
                <Text style={styles.receiptRow}>Payment method: {service.paymentMethod ?? 'Cash'}</Text>
              </View>
              <TouchableOpacity style={[styles.submitBtn, { marginTop: 12 }]} onPress={() => setShowReceipt(false)}>
                <Text style={styles.submitText}>Close Receipt</Text>
              </TouchableOpacity>
            </View>
          )}

          {mode === 'Pending' && (
            <View style={styles.otpSectionBig}>
              <Text style={styles.otpTitle}>Enter OTP to accept job</Text>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 4-digit OTP"
                keyboardType="number-pad"
                style={styles.otpInputLarge}
                maxLength={6}
              />
              <TouchableOpacity style={styles.submitBtn} onPress={submitOtp} disabled={submitting}>
                <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.actions, { marginTop: 18 }]}> 
            
            {mode === 'Available' ? (
              <TouchableOpacity style={styles.acceptBtn} onPress={acceptJob}>
                <Text style={styles.acceptText}>Accept Job</Text>
              </TouchableOpacity>
            ) : (
              mode === 'Completed' ? (
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowReceipt(true)}>
                    <Text style={styles.primaryText}>View Receipt</Text>
                  </TouchableOpacity>
              ) : (
                mode !== 'Pending' ? (
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert('Info', 'Mark as started')}>
                    <Text style={styles.primaryText}>Mark as Started</Text>
                  </TouchableOpacity>
                ) : null
              )
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  container: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', padding: 18, borderTopLeftRadius: 18, borderTopRightRadius: 18, minHeight: 320, marginBottom: 8, 
    // elevation/shadow so the sheet stands out without a dimmed backdrop
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8 },
  dragHandle: { height: 24, alignItems: 'center', justifyContent: 'center' },
  dragBar: { width: 48, height: 5, borderRadius: 3, backgroundColor: '#ccc' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  topRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  image: { width: 84, height: 84, borderRadius: 12, backgroundColor: '#eee' },
  name: { fontWeight: '800', fontSize: 16 },
  address: { color: '#666', marginTop: 4 },
  info: { color: '#999', marginTop: 6 },
  section: { marginTop: 14 },
  sectionTitle: { fontWeight: '700', marginBottom: 6 },
  sectionText: { color: '#555', marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  callBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2aa6bb', paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10 },
  callText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  primaryBtn: { backgroundColor: '#eee', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10 },
  primaryText: { fontWeight: '700' },
  acceptText: { fontWeight: '700', color: '#f3efefff' },
  acceptBtn: { backgroundColor: '#4fc449ff', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderColor: '#000000ff', borderWidth: 1, color: '#fff' },
  otpSectionBig: { marginTop: 12, padding: 12, backgroundColor: '#f7fbfc', borderRadius: 12 },
  otpTitle: { fontWeight: '800', fontSize: 16, marginBottom: 8 },
  otpInputLarge: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e6e6e6', fontSize: 18, textAlign: 'center' },
  submitBtn: { marginTop: 12, backgroundColor: '#2aa6bb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '800' },
  completedSection: { marginTop: 12, padding: 12, backgroundColor: '#eef8f7', borderRadius: 10 },
  completedTitle: { fontWeight: '800', marginBottom: 6 },
  receiptBox: { marginTop: 12, padding: 12, backgroundColor: '#fffaf0', borderRadius: 10, borderWidth: 1, borderColor: '#fde8c0' },
  receiptTitle: { fontWeight: '900', marginBottom: 6 },
  receiptRow: { color: '#333', marginTop: 6 },
});
