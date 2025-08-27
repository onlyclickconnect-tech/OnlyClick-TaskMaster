import { Link } from 'expo-router';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

const SignInFooter = () => {
    return (
        <Link href="/protected/" asChild>
            <TouchableOpacity style={styles.skipContainer}>
                <Text style={styles.skipText}>Continue without login (For development purposes only)</Text>
            </TouchableOpacity>
        </Link>
    );
};

const styles = StyleSheet.create({
    skipContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    skipText: {
        color: '#ef1212ff',
        fontSize: 12,
        textAlign: 'center',
        paddingBottom: 10,
    },
});

export default SignInFooter;