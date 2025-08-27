import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';

const SignInForm = ({ phone, error, onPhoneChange, onSignIn, isLoading }) => {
    return (
        <View style={styles.content}>
            <Text style={styles.title}>Login to your account</Text>
            
            <View style={styles.inputContainer}>
                <View style={[styles.phoneInputWrapper, error ? styles.phoneInputError : null]}>
                    <View style={styles.countryCodeContainer}>
                        <Text style={styles.flagEmoji}>🇮🇳 </Text>
                        <Text style={styles.countryCode}>+91</Text>
                    </View>
                    <TextInput
                        style={styles.phoneInput}
                        placeholder="Phone number"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={onPhoneChange}
                    />
                </View>
                {error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}
            </View>

            <TouchableOpacity 
                style={[styles.signInButton, isLoading && styles.signInButtonDisabled]} 
                onPress={onSignIn}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.signInButtonText}>Sign In</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 0.4,
        paddingHorizontal: 30,
        paddingTop: 0,
        marginTop: 0,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 25,
        color: '#333',
        textAlign: 'left',
    },
    inputContainer: {
        marginBottom: 20,
    },
    phoneInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    phoneInputError: {
        borderColor: '#FF6B6B',
        backgroundColor: '#FFF5F5',
    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12,
        borderRightWidth: 1,
        borderRightColor: '#dee2e6',
        marginRight: 12,
    },
    flagEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    countryCode: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    phoneInput: {
        flex: 1,
        fontSize: 18,
        paddingVertical: 16,
        color: '#333',
        fontWeight: '500',
        letterSpacing: 1,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        marginLeft: 6,
        fontWeight: '500',
    },
    signInButton: {
        backgroundColor: '#2082AA',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#2082AA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    signInButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    signInButtonDisabled: {
        backgroundColor: '#a0c4cf',
    },
});

export default SignInForm;