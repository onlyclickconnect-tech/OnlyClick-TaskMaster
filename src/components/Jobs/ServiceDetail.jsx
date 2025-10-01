import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import api from '../../app/api/api';
import CustomAlert from '../common/CustomAlert';
import Text from '../ui/Text';

export default function ServiceDetail({ visible, onClose, service, mode = 'Pending', onAccept, onComplete }) {
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);
  const otpInputRef = useRef(null);

  // Check if this is a grouped job
  const isGroupedJob = service && service.jobs && Array.isArray(service.jobs);
  const jobsToDisplay = isGroupedJob ? service.jobs : [service].filter(Boolean);

  // Format time slot for user-friendly display
  const formatTimeSlot = (timeSlot) => {
    if (!timeSlot || timeSlot === 'any-time') return null;
    
    // If it's a full timestamp like "2025-10-12 16:00:00", extract just the time part
    if (timeSlot.includes('-') && timeSlot.includes(' ')) {
      try {
        // Extract the time part from "2025-10-12 16:00:00"
        const timePart = timeSlot.split(' ')[1]; // Gets "16:00:00"
        const timeOnly = timePart.split(':'); // Gets ["16", "00", "00"]
        const hour = parseInt(timeOnly[0]);
        const minutes = timeOnly[1] || '00';
        
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        
        // Also extract date for display
        const datePart = timeSlot.split(' ')[0]; // Gets "2025-10-12"
        const [year, month, day] = datePart.split('-');
        const date = new Date(year, month - 1, day); // Create date without timezone issues
        const dateStr = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        
        return `${displayHour}:${minutes} ${ampm} • ${dateStr}`;
      } catch (e) {
        return timeSlot;
      }
    }
    
    // If it's a timestamp with T, format it properly
    if (timeSlot.includes('T')) {
      try {
        const date = new Date(timeSlot);
        const timeStr = date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });
        const dateStr = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        return `${timeStr} • ${dateStr}`;
      } catch (e) {
        return timeSlot;
      }
    }
    
    // If it's time format like "09:00", "14:30", etc. (24-hour format from backend)
    if (timeSlot.includes(':') && !timeSlot.includes('AM') && !timeSlot.includes('PM')) {
      try {
        const [hours, minutes] = timeSlot.split(':');
        const hour = parseInt(hours);
        const min = minutes || '00'; // Handle cases where minutes might be missing
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${min} ${ampm}`;
      } catch (e) {
        return timeSlot;
      }
    }
    
    // If it's already formatted with AM/PM
    if (timeSlot.includes('AM') || timeSlot.includes('PM')) {
      return timeSlot;
    }
    
    return timeSlot;
  };

  // Format amount to 2 decimal places
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

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


  // Helper function to show custom alert
  const showCustomAlert = (config) => {
    setAlertConfig(config);
    setAlertVisible(true);
  };

  const hideCustomAlert = () => {
    setAlertVisible(false);
  };

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to gestures that start in the drag handle area
      const isInDragArea = evt.nativeEvent.locationY < 50; // Only top 50px (drag handle area)
      return isInDragArea;
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to significant downward movements from the drag handle
      const isDownwardDrag = gestureState.dy > 15 && Math.abs(gestureState.dx) < 50;
      const isInDragArea = evt.nativeEvent.locationY < 50;
      return isDownwardDrag && isInDragArea;
    },
    onPanResponderGrant: (evt, gestureState) => {
      // Start tracking the gesture
      translateY.setOffset(translateY._value);
      translateY.setValue(0);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Only allow downward drag and limit the movement
      const dragValue = Math.max(0, Math.min(gestureState.dy, 300));
      translateY.setValue(dragValue);
    },
    onPanResponderRelease: (evt, gestureState) => {
      // Reset offset
      translateY.flattenOffset();
      
      // Determine if should close based on drag distance and velocity
      const dragDistance = gestureState.dy;
      const dragVelocity = gestureState.vy;
      
      // More strict conditions for closing
      const shouldClose = 
        (dragDistance > 120 && dragVelocity > 0.5) || // Dragged far enough with some velocity
        (dragDistance > 80 && dragVelocity > 2) ||    // Quick drag
        dragDistance > 200;                           // Very far drag regardless of velocity
      
      if (shouldClose) {
        // Animate down and close
        Animated.timing(translateY, { 
          toValue: 400, 
          duration: 250, 
          useNativeDriver: true 
        }).start(() => {
          close();
          translateY.setValue(0);
        });
      } else {
        // Snap back to original position with smooth animation
        Animated.spring(translateY, { 
          toValue: 0, 
          useNativeDriver: true,
          tension: 100,
          friction: 8
        }).start();
      }
    },
    onPanResponderTerminate: (evt, gestureState) => {
      // If gesture is interrupted, snap back
      translateY.flattenOffset();
      Animated.spring(translateY, { 
        toValue: 0, 
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }).start();
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
      
      // Auto-focus OTP input for pending jobs
      if (mode === 'Pending') {
        setTimeout(() => {
          // This will help ensure the keyboard opens and OTP is visible
          setOtp(''); // Clear any existing value to ensure focus works
          otpInputRef.current?.focus();
        }, 300);
      }
    } else {
      translateY.setValue(0);
    }
  }, [visible, mode]);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
        
        // Scroll to OTP input when keyboard opens (for pending jobs)
        if (mode === 'Pending' && scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }, 100);
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [mode]);

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
    
    if (onAccept) {
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
    
    
    // Show processing alert
    const jobCount = isGroupedJob ? service.jobs.length : 1;
    showCustomAlert({
      title: 'Verifying OTP',
      message: `Please wait while we verify your OTP for ${jobCount} job${jobCount > 1 ? 's' : ''}...`,
      type: 'info',
      processing: true,
      showCancel: false,
      buttons: []
    });
    
    setSubmitting(true);
    
    try {
      let results = [];
      let successCount = 0;
      let failCount = 0;
      
      if (isGroupedJob && service.jobs) {
        // Handle grouped jobs - submit OTP for each job sequentially
        console.log('Processing grouped jobs sequentially for OTP verification');
        
        for (let i = 0; i < service.jobs.length; i++) {
          const job = service.jobs[i];
          try {
            const requestPayload = {
              _id: job._id || job.id,
              otp: otp
            };
            
            console.log(`Verifying OTP for job ${i + 1}/${service.jobs.length}:`, requestPayload);
            
            // Update processing message to show progress
            showCustomAlert({
              title: 'Verifying OTP',
              message: `Processing job ${i + 1} of ${service.jobs.length}...\nPlease wait while we verify your OTP.`,
              type: 'info',
              processing: true,
              showCancel: false,
              buttons: []
            });
            
            const response = await api.post('api/v1/verifyJobComplete', requestPayload);
            
            if (response?.data?.success) {
              successCount++;
              results.push({ status: 'fulfilled', value: response, reason: null });
              console.log(`Job ${i + 1} OTP verified successfully`);
            } else {
              failCount++;
              results.push({ status: 'rejected', value: null, reason: 'Verification failed' });
              console.log(`Job ${i + 1} OTP verification failed`);
            }
            
            // Add delay between requests to prevent race conditions (except for last item)
            if (i < service.jobs.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
          } catch (error) {
            failCount++;
            results.push({ status: 'rejected', value: null, reason: error });
            console.error(`Failed to verify OTP for job ${i + 1}:`, error);
            
            // Continue with next job even if one fails
            if (i < service.jobs.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        }
        
        console.log(`Grouped OTP verification complete: ${successCount} successful, ${failCount} failed`);
        
      } else {
        // Handle single job
        const requestPayload = {
          _id: service.id || service._id,  // Booking ID
          otp: otp  // OTP entered by user
        };
        
        console.log('=== MAKING API CALL ===');
        console.log('API URL: api/v1/verifyJobComplete');
        console.log('Request payload:', requestPayload);
        
        const response = await api.post('api/v1/verifyJobComplete', requestPayload);
        
        if (response?.data?.success) {
          successCount = 1;
          failCount = 0;
          results = [{ status: 'fulfilled', value: response, reason: null }];
        } else {
          successCount = 0;
          failCount = 1;
          results = [{ status: 'rejected', value: null, reason: 'Verification failed' }];
        }
      }
      
      setSubmitting(false);
      hideCustomAlert();
      
      // Process results using the counts we calculated
      const successful = successCount;
      const failed = failCount;
      const jobCount = isGroupedJob ? service.jobs.length : 1;
      
      console.log(`OTP verification completed: ${successful} successful, ${failed} failed`);
      
      if (successful > 0) {
        setOtp(''); // Clear OTP input
        
        let message = isGroupedJob 
          ? `Successfully verified OTP for ${successful} job${successful > 1 ? 's' : ''}!`
          : 'OTP verified successfully. The job has been marked as completed and payment will be processed.';
          
        if (failed > 0) {
          message += ` ${failed} job${failed > 1 ? 's' : ''} failed verification.`;
        }
        
        showCustomAlert({
          title: 'OTP Verified!',
          message: message,
          type: successful === jobCount ? 'success' : 'warning',
          buttons: [
            {
              text: 'Great!',
              onPress: () => {
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
        // All verifications failed
        showCustomAlert({
          title: 'Verification Failed',
          message: isGroupedJob 
            ? 'All OTP verifications failed. Please check the OTP and try again.'
            : 'OTP verification failed. Please check the OTP and try again.',
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
      console.error('API Error:', err);
      setSubmitting(false);
      hideCustomAlert();
      
      // Handle specific backend error responses
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        
        
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
      <KeyboardAvoidingView 
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Animated.View 
          style={[
            styles.container, 
            { 
              transform: [{ translateY }],
              maxHeight: keyboardVisible ? Dimensions.get('window').height - keyboardHeight - 50 : '85%'
            }
          ]}
        >
          {/* Enhanced drag handle - only attach pan responder here */}
          <View style={styles.dragHandle} {...panResponder.panHandlers}>
            <View style={styles.dragBar} />
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {isGroupedJob ? `${service.customerName} - ${service.jobs.length} Jobs` : service.serviceName}
            </Text>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={keyboardVisible ? { paddingBottom: keyboardHeight + 20 } : null}
          >
            {/* Move OTP section to top for pending jobs */}
            {mode === 'Pending' && (
              <View style={styles.otpSectionBig}>
                <Text style={styles.otpTitle}>
                  {isGroupedJob 
                    ? `Enter OTP to complete all ${service.jobs.length} jobs`
                    : 'Enter OTP to complete job'
                  }
                </Text>
                <TextInput
                  ref={otpInputRef}
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
            
            <View style={styles.topRow}>
              <Image source={service.image ? { uri: service.image } : require('../../../assets/images/avatarPlaceholder.png')} style={styles.image} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{service.customerName}</Text>
                <Text style={styles.address}>{service.address}</Text>
                {isGroupedJob && service.timeSlot && service.timeSlot !== 'any-time' && (
                  <Text style={styles.info}>Time Slot: {formatTimeSlot(service.timeSlot)}</Text>
                )}
                
              </View>
              <TouchableOpacity style={styles.callBtn} onPress={callCustomer}>
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={styles.callText}>Call Customer</Text>
              </TouchableOpacity>
            </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isGroupedJob ? 'All Services' : 'Details'}
            </Text>
            
            {isGroupedJob ? (
              // Display all jobs in the group
              jobsToDisplay.map((job, index) => (
                <View key={job._id || index} style={styles.jobItem}>
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobTitle}>{job.serviceName}</Text>
                    <Text style={styles.jobPayment}>{job.payment}</Text>
                  </View>
                  {job.description && (
                    <Text style={styles.jobDescription}>{job.description}</Text>
                  )}
                  <View style={styles.jobDetailsRow}>
                    <Text style={styles.jobInfo}>Booking ID: {job._id || '—'}</Text>
                    {job.timeSlot && job.timeSlot !== 'any-time' && (
                      <Text style={styles.jobInfo}>Time: {formatTimeSlot(job.timeSlot)}</Text>
                    )}
                    {job.paymentMethod && (
                      <Text style={styles.jobInfo}>Payment: {job.paymentMethod}</Text>
                    )}
                    {job.estimatedTime && (
                      <Text style={styles.jobInfo}>Duration: {job.estimatedTime}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              // Display single job details
              <>
                <Text style={styles.sectionText}>Service: {service.serviceName}</Text>
                <Text style={styles.sectionText}>Address: {service.address}</Text>
                {service.timeSlot && service.timeSlot !== 'any-time' && (
                  <Text style={styles.sectionText}>Time Slot: {formatTimeSlot(service.timeSlot)}</Text>
                )}
                <Text style={styles.sectionText}>Estimated Time: {service.estimatedTime || '—'}</Text>
                {service.description && (
                  <Text style={styles.sectionText}>Description: {service.description}</Text>
                )}
              </>
            )}

            {/* Prominent Payment Mode Section */}
            {service.paymentMethod && (
              <View style={styles.paymentModeHighlight}>
                <View style={[styles.paymentModeBadge, { backgroundColor: service.paymentMethod === 'Pay on Service' ? '#f39c12' : '#27ae60' }]}>
                  <Ionicons
                    name={service.paymentMethod === 'Pay on Service' ? 'cash' : 'card'}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.paymentModeBadgeText}>{service.paymentMethod}</Text>
                </View>
                <Text style={styles.paymentInstructionText}>
                  {service.paymentMethod === 'Pay on Service'
                    ? 'Collect payment from customer when service is completed'
                    : 'Payment has been received online - no collection needed'
                  }
                </Text>
              </View>
            )}

            {isGroupedJob && (
              <View style={styles.totalSection}>
                <Text style={styles.totalText}>
                  Total Amount: {formatAmount(service.totalPayment || 0)}
                </Text>
              </View>
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
          </ScrollView>

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
      </KeyboardAvoidingView>

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
  dragHandle: { 
    height: 40, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  dragBar: { 
    width: 48, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: '#ddd',
    marginBottom: 4,
  },
  dragText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scrollContent: { 
    flex: 1,
    maxHeight: 600, // Increased height for better UX
  },
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
  jobItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4ab9cf',
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  jobPayment: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  jobDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  jobInfo: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 2,
  },
  jobDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e8f4f8',
  },
  jobDetail: {
    fontSize: 12,
    color: '#4ab9cf',
    fontWeight: '500',
  },
  totalSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    textAlign: 'center',
  },
  paymentModeHighlight: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  paymentModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 8,
  },
  paymentModeBadgeText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  paymentInstructionText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
});
