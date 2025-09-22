import { Image, StyleSheet, View } from 'react-native';

const SignInIllustration = () => {
    return (
        <View style={styles.illustrationContainer}>
            <Image
                source={require('../../../assets/images/signin.png')}
                style={styles.illustration}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    illustrationContainer: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: -200,
        marginBottom: -200,
    },
    illustration: {
        width: '100%',
        height: '50%',
    },
});

export default SignInIllustration;