import { StyleSheet, Text, View } from 'react-native';

const SuccessMessage = () => {
  return (
    <View style={styles.messageContainer}>
      <Text style={styles.successMessage}>Welcome to TaskMaster!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  successMessage: {
    fontSize: 20,
    color: '#3898B3',
    fontWeight: '500',
  },
});

export default SuccessMessage;