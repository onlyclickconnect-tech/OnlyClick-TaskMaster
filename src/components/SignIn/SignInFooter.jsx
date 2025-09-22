import { Link } from 'expo-router';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

const SignInFooter = () => {
    return (
        <Text style={styles.footerText}>An app for the Service Providers</Text>
    );
};

const styles = StyleSheet.create({
    skipContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    footerText: {
        color: '#797777ff',
        fontSize: 12,
        textAlign: 'center',
        paddingBottom: 10,
    },
});

export default SignInFooter;