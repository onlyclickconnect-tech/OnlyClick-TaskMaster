import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, View } from 'react-native';
import OTPButton from '../../../components/OTP/OTPButton';
import OTPDisplay from '../../../components/OTP/OTPDisplay';
import OTPHeader from '../../../components/OTP/OTPHeader';
import OTPResend from '../../../components/OTP/OTPResend';
import { useAuth } from '../../../context/AuthProvider';

export default function OTP() {
  const { phoneNumber, type = 'login' } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(39);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const otpInputRef = useRef(null);
  const { loginWithOTP, verifyRegistrationOTP, requestOTP } = useAuth();

  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      otpInputRef.current?.focus();
    }, 100);
    
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(focusTimeout);
    };
  }, []);

  const handleSubmit = async () => {
    // In dummy mode, always proceed if at least 4 digits are entered
    if (otp.length < 3) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let result;
      
      if (type === 'registration') {
        result = await verifyRegistrationOTP(phoneNumber, otp);
      } else {
        result = await loginWithOTP(phoneNumber, otp);
      }
      
      if (result.success) {
        // After successful OTP verification, redirect to Aadhaar details entry
        if (type === 'registration') {
          router.replace(`/auth/aadharVerify?phoneNumber=${encodeURIComponent(phoneNumber)}`);
        } else {
          // For login, check if user has completed Aadhaar verification; send to aadhar verify first
          router.replace(`/auth/aadharVerify?phoneNumber=${encodeURIComponent(phoneNumber)}`);
        }
      } else {
        setError(result.error || 'Invalid OTP. Please try again.');
        setOtp('');
        setActiveIndex(0);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setOtp('');
      setActiveIndex(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text) => {
    const cleanedText = text.replace(/[^0-9]/g, '').slice(0, 4);
    setOtp(cleanedText);
    setActiveIndex(cleanedText.length < 4 ? cleanedText.length : 3);
    
    if (error) setError('');
    
    if (cleanedText.length === 4) {
      setTimeout(() => {
        handleSubmit();
      }, 100);
    }
  };

  const handleResend = async () => {
    if (countdown === 0) {
      setIsLoading(true);
      
      try {
        const result = await requestOTP(phoneNumber);
        
        if (result.success) {
          setCountdown(39);
          Alert.alert('Success', 'OTP has been resent to your phone number');
        } else {
          Alert.alert('Error', result.error || 'Failed to resend OTP. Please try again.');
        }
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <OTPHeader />

          <View style={styles.content}>
            <OTPDisplay 
              otp={otp}
              activeIndex={activeIndex}
              inputRef={otpInputRef}
              onOtpChange={handleOtpChange}
              error={error}
            />

            <OTPResend 
              countdown={countdown}
              onResend={handleResend}
              isLoading={isLoading}
            />

            <OTPButton 
              otpLength={otp.length}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
  },
};