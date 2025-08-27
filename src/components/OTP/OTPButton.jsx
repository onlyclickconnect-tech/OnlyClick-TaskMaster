import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

const OTPButton = ({ otpLength, onSubmit, isLoading }) => {
  return (
    <TouchableOpacity
      style={[
        styles.proceedButton,
        (otpLength < 4 || isLoading) && styles.disabledButton,
      ]}
      onPress={onSubmit}
      disabled={otpLength < 4 || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <Text style={styles.proceedButtonText}>PROCEED</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  proceedButton: {
    backgroundColor: '#3898B3',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  proceedButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default OTPButton;