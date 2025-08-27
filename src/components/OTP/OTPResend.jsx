import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';

const OTPResend = ({ countdown, onResend, isLoading }) => {
  return (
    <TouchableOpacity 
      onPress={onResend} 
      style={styles.resendContainer}
      disabled={countdown > 0 || isLoading}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3898B3" />
          <Text style={styles.loadingText}>Sending OTP...</Text>
        </View>
      ) : (
        <Text style={[
          styles.resendText,
          countdown === 0 && styles.resendActiveText
        ]}>
          {countdown > 0 ? `Resend OTP after: ${countdown} sec` : 'Resend OTP now'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  resendContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resendText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 15,
    fontWeight: '500',
  },
  resendActiveText: {
    color: '#3898B3',
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#3898B3',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default OTPResend;