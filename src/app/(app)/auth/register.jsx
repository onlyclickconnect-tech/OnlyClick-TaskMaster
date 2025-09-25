import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SignInFooter from '../../../components/SignIn/SignInFooter';
import SignInHeader from '../../../components/SignIn/SignInHeader';
import SignInIllustration from '../../../components/SignIn/SignInIllustration';
import { useAuth } from '../../../context/AuthProvider';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { registerWithPassword } = useAuth();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleInputChange = (field, value) => {
        if (field === 'email') setEmail(value);
        if (field === 'password') setPassword(value);
        if (field === 'confirmPassword') setConfirmPassword(value);
        if (error) setError('');
    };

    const handleRegister = async () => {
        if (isLoading) return;

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (!password.trim()) {
            setError('Please enter your password');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!acceptTerms) {
            setError('Please accept the Terms of Service and Privacy Policy');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await registerWithPassword(email, password);
            
            if (result.success) {
                Alert.alert(
                    'Registration Successful',
                    'Your account has been created successfully. Please complete your profile setup.',
                    [
                        {
                            text: 'Continue',
                            onPress: () => router.replace('/(app)/auth/profile-setup')
                        }
                    ]
                );
            } else {
                setError(result.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error.message);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToSignIn = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SignInHeader />
            <SignInIllustration />
            
            <View style={styles.content}>
                <Text style={styles.title}>Create your account</Text>
                
                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={email}
                            onChangeText={(text) => handleInputChange('email', text)}
                            editable={!isLoading}
                        />
                    </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your password"
                            placeholderTextColor="#999"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={password}
                            onChangeText={(text) => handleInputChange('password', text)}
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color="#666"
                            style={styles.inputIcon}
                        />
                        <TextInput
                            style={styles.textInput}
                            placeholder="Confirm your password"
                            placeholderTextColor="#999"
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={confirmPassword}
                            onChangeText={(text) => handleInputChange('confirmPassword', text)}
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.eyeIcon}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                    
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Terms and Conditions */}
                <View style={styles.termsContainer}>
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setAcceptTerms(!acceptTerms)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                            {acceptTerms && (
                                <Ionicons name="checkmark" size={14} color="#fff" />
                            )}
                        </View>
                        <Text style={styles.termsText}>
                            I agree to the{" "}
                            <Text style={styles.termsLink}>Terms of Service</Text>{" "}
                            and{" "}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Register Button */}
                <TouchableOpacity 
                    style={[styles.registerButton, (isLoading || !acceptTerms) && styles.registerButtonDisabled]} 
                    onPress={handleRegister}
                    disabled={isLoading || !acceptTerms}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.registerButtonText}>Create Account</Text>
                    )}
                </TouchableOpacity>

                {/* Back to Sign In */}
                <TouchableOpacity 
                    style={styles.backToSignInButton}
                    onPress={handleBackToSignIn}
                    activeOpacity={0.7}
                >
                    <Text style={styles.backToSignInText}>
                        Already have an account? <Text style={styles.backToSignInLink}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </View>
            
            <SignInFooter />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
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
        marginBottom: 15,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    inputError: {
        borderColor: '#FF6B6B',
        backgroundColor: '#FFF5F5',
    },
    inputIcon: {
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 14,
        color: '#333',
        fontWeight: '500',
    },
    eyeIcon: {
        padding: 4,
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
    termsContainer: {
        marginBottom: 20,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 0,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#2082AA",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: "#2082AA",
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    termsLink: {
        color: "#2082AA",
        fontWeight: "600",
    },
    registerButton: {
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
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    registerButtonDisabled: {
        backgroundColor: '#a0c4cf',
    },
    backToSignInButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    backToSignInText: {
        color: '#666',
        fontSize: 14,
    },
    backToSignInLink: {
        color: '#2082AA',
        fontWeight: '600',
    },
});