import { Image, StyleSheet, View } from 'react-native';

const OnboardingHeader = () => {
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
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 60,
  },
});

export default OnboardingHeader;