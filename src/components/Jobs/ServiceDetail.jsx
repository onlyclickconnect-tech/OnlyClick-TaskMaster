import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
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
import api from '../../app/api/api';
import CustomAlert from '../common/CustomAlert';

export default function ServiceDetail({ visible, onClose, service, mode = 'Pending', onAccept, onComplete }) {
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    buttons: [],
    showCancel: true,
    processing: false
  });

  console.log('=== ServiceDetail rendered ===');
  console.log('visible:', visible);
  console.log('mode:', mode);
  console.log('service:', service);
  console.log('onComplete exists:', !!onComplete);

  // Helper function to show custom alert
  const showCustomAlert = (config) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const hideCustomAlert = () => {
    setAlertVisible(false);
  };

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
    if (!phone) {
      return showCustomAlert({
        title: 'No Phone Number',
        message: 'Customer phone number is not available. Please contact support or check the job details.',
        type: 'warning',
        buttons: [
          {
            text: 'OK',
            onPress: hideCustomAlert
          }
        ],
        showCancel: false
      });
    }
    Linking.openURL(`tel:${phone}`);
  };

  const acceptJob = () => {
    console.log("=== ServiceDetail acceptJob called ===");
    console.log("onAccept exists?", !!onAccept);
    console.log("service:", service);
    
    if (onAccept) {
      console.log("Calling onAccept with service...");
      onAccept(service);
      // Don't call close() here - let the parent component handle modal closing
    } else {
      showCustomAlert({
        title: 'Job Accepted',
        message: 'Great! You have accepted this job. You can now start working on it.',
        type: 'success',
        buttons: [
          {
            text: 'Continue',
            onPress: () => {
              hideCustomAlert();
              close();
            }
          }
        ],
        showCancel: false
      });
    }
  };

  const submitOtp = async () => {
    if (!otp) {
      return showCustomAlert({
        title: 'OTP Required',
        message: 'Please enter the OTP to complete the job.',
        type: 'warning',
        buttons: [
          {
            text: 'OK',
            onPress: hideCustomAlert
          }
        ],
        showCancel: false
      });
    }
    
    console.log('=== SUBMIT OTP CALLED ===');
    console.log('OTP entered:', otp);
    console.log('Service data before API call:', service);
    
    // Show processing alert
    showCustomAlert({
      title: 'Verifying OTP',
      message: 'Please wait while we verify your OTP...',
      type: 'info',
      processing: true,
      showCancel: false,
      buttons: []
    });
    
    setSubmitting(true);
    
    try {
      // Prepare request payload matching backend expectations
      const requestPayload = {
        _id: service._id || service.id,  // Booking ID
        otp: otp  // OTP entered by user
      };
      
      console.log('=== MAKING API CALL ===');
      console.log('API URL: api/v1/verifyJobComplete');
      console.log('Request payload:', requestPayload);
      
      // Make API call to verify job completion
      const response = await api.post('api/v1/verifyJobComplete', requestPayload);
      
      console.log('=== API RESPONSE SUCCESS ===');
      console.log('Response data:', response.data);
      
      setSubmitting(false);
      hideCustomAlert();
      
      // Backend returns { success: true } on successful OTP verification
      if (response.data && response.data.success) {
        setOtp(''); // Clear OTP input
        
        showCustomAlert({
          title: 'OTP Verified!',
          message: 'OTP verified successfully. The job has been marked as completed and payment will be processed.',
          type: 'success',
          buttons: [
            {
              text: 'Great!',
              onPress: () => {
                console.log('Job completed successfully, calling onComplete and closing modal');
                hideCustomAlert();
                if (onComplete) onComplete(service);
                close();
              }
            }
          ],
          showCancel: false,
          jobDetails: service
        });
      } else {
        // Unexpected response format
        showCustomAlert({
          title: 'Verification Failed',
          message: 'Unexpected response from server. Please try again.',
          type: 'error',
          buttons: [
            {
              text: 'Try Again',
              onPress: hideCustomAlert
            }
          ],
          showCancel: false
        });
      }
      
    } catch (err) {
      console.log('=== API ERROR CAUGHT ===');
      console.error('API Error:', err);
      setSubmitting(false);
      hideCustomAlert();
      
      // Handle specific backend error responses
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        
        console.log('Error status:', status);
        console.log('Error data:', errorData);
        
        switch (status) {
          case 400:
            // Invalid OTP or job completion failure
            showCustomAlert({
              title: 'Invalid OTP',
              message: 'The OTP you entered is incorrect. Please check and try again.',
              type: 'error',
              buttons: [
                {
                  text: 'Try Again',
                  onPress: hideCustomAlert
                }
              ],
              showCancel: false
            });
            break;
            
          case 404:
            // Booking not found
            showCustomAlert({
              title: 'Booking Not Found',
              message: 'This booking could not be found. Please contact support.',
              type: 'error',
              buttons: [
                {
                  text: 'Contact Support',
                  onPress: hideCustomAlert
                }
              ],
              showCancel: false
            });
            break;
            
          case 500:
            // Server error
            showCustomAlert({
              title: 'Server Error',
              message: 'A server error occurred. Please try again later.',
              type: 'error',
              buttons: [
                {
                  text: 'Try Again',
                  onPress: hideCustomAlert
                }
              ],
              showCancel: false
            });
            break;
            
          default:
            // Other HTTP errors
            showCustomAlert({
              title: 'Verification Failed',
              message: errorData?.message || 'Failed to verify OTP. Please try again.',
              type: 'error',
              buttons: [
                {
                  text: 'Try Again',
                  onPress: hideCustomAlert
                }
              ],
              showCancel: false
            });
        }
      } else if (err.request) {
        // Network error - request made but no response
        showCustomAlert({
          title: 'Network Error',
          message: 'Could not connect to server. Please check your internet connection and try again.',
          type: 'error',
          buttons: [
            {
              text: 'Try Again',
              onPress: hideCustomAlert
            }
          ],
          showCancel: false
        });
      } else {
        // Other error
        showCustomAlert({
          title: 'Error',
          message: 'An unexpected error occurred. Please try again.',
          type: 'error',
          buttons: [
            {
              text: 'Try Again',
              onPress: hideCustomAlert
            }
          ],
          showCancel: false
        });
      }
    }
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
              <Text style={styles.otpTitle}>Enter OTP to complete job</Text>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 4-digit OTP"
                keyboardType="number-pad"
                style={[
                  styles.otpInputLarge,
                  (submitting || alertConfig.processing) && styles.disabledInput
                ]}
                maxLength={6}
                editable={!submitting && !alertConfig.processing}
              />
              <TouchableOpacity 
                style={[
                  styles.submitBtn,
                  (submitting || alertConfig.processing) && styles.disabledButton
                ]} 
                onPress={submitOtp} 
                disabled={submitting || alertConfig.processing}
                activeOpacity={0.8}
              >
                <Text style={styles.submitText}>
                  {(submitting || alertConfig.processing) ? 'Verifying...' : 'Submit OTP'}
                </Text>
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
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => 
                    showCustomAlert({
                      title: 'Job Status',
                      message: 'This job is ready to be started. Please coordinate with the customer and begin the work.',
                      type: 'info',
                      buttons: [
                        {
                          text: 'Got it!',
                          onPress: hideCustomAlert
                        }
                      ],
                      showCancel: false,
                      jobDetails: service
                    })
                  }>
                    <Text style={styles.primaryText}>Mark as Started</Text>
                  </TouchableOpacity>
                ) : null
              )
            )}
          </View>
        </Animated.View>
      </View>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        onClose={hideCustomAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        showCancel={alertConfig.showCancel}
        jobDetails={alertConfig.jobDetails}
        processing={alertConfig.processing}
      />
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
  disabledInput: { backgroundColor: '#f5f5f5', color: '#999', borderColor: '#ddd' },
  submitBtn: { marginTop: 12, backgroundColor: '#2aa6bb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  disabledButton: { backgroundColor: '#bdc3c7', opacity: 0.7 },
  submitText: { color: '#fff', fontWeight: '800' },
  completedSection: { marginTop: 12, padding: 12, backgroundColor: '#eef8f7', borderRadius: 10 },
  completedTitle: { fontWeight: '800', marginBottom: 6 },
  receiptBox: { marginTop: 12, padding: 12, backgroundColor: '#fffaf0', borderRadius: 10, borderWidth: 1, borderColor: '#fde8c0' },
  receiptTitle: { fontWeight: '900', marginBottom: 6 },
  receiptRow: { color: '#333', marginTop: 6 },
});
