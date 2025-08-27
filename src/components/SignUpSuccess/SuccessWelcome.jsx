import { StyleSheet, Text, View } from 'react-native';

const SuccessWelcome = () => {
  return (
    <View style={styles.welcomeContainer}>
      <Text style={styles.welcomeText}>Great to have you!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3898B3',
    textAlign: 'center',
  },
});

export default SuccessWelcome;