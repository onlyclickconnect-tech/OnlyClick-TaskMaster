import { Image, StyleSheet, View } from 'react-native';

const OTPHeader = () => {
  return (
    <View style={styles.header}>
      <Image
        source={require('../../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    width: 180,
    height: 60,
  },
});

export default OTPHeader;