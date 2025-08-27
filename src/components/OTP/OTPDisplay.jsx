import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OTPDisplay = ({ otp, activeIndex, inputRef, onOtpChange, error }) => {
  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <Text style={styles.title}>Enter OTP</Text>
      
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={otp}
        onChangeText={onOtpChange}
        keyboardType="number-pad"
        maxLength={4}
        autoFocus
      />
      
      <TouchableOpacity onPress={focusInput} activeOpacity={1}>
        <View style={styles.otpContainer}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.otpDigit,
                activeIndex === i && styles.activeOtpDigit,
                otp[i] && styles.filledOtpDigit,
              ]}
            >
              <Text style={[
                styles.otpText,
                otp[i] && styles.filledOtpText
              ]}>
                {otp[i] || ''}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  otpDigit: {
    width: 60,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  activeOtpDigit: {
    borderColor: '#3898B3',
    backgroundColor: '#f0fffe',
  },
  filledOtpDigit: {
    borderColor: '#20b2aa',
    backgroundColor: '#ffffff',
  },
  otpText: {
    fontSize: 24,
    color: '#d0d0d0',
    fontWeight: '400',
  },
  filledOtpText: {
    color: '#1a1a1a',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default OTPDisplay;