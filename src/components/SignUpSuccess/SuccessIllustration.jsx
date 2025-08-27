import { Image, StyleSheet, View } from 'react-native';

const SuccessIllustration = () => {
  return (
    <View style={styles.illustrationContainer}>
      <Image 
        source={require('../../../assets/images/signinpass.png')}
        style={styles.illustration}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: -40,
  },
  illustration: {
    width: '85%',
    height: 300,
  },
});

export default SuccessIllustration;