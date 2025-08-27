import { StyleSheet, View } from 'react-native';

const SuccessIndicator = () => {
  return (
    <View style={styles.bottomIndicator} />
  );
};

const styles = StyleSheet.create({
  bottomIndicator: {
    width: 160,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default SuccessIndicator;