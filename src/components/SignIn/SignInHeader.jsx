import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

const SignInHeader = () => {
    const handleBack = () => router.back();

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
        marginBottom: -40,
    },
    backButton: {
        padding: 8,
    },
    logo: {
        width: 150,
        height: 50,
        marginLeft: 100,
    },
    infoButton: {
        padding: 8,
    },
});

export default SignInHeader;