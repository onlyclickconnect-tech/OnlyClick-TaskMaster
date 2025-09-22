import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import SignInFooter from '../../../components/SignIn/SignInFooter';
import SignInForm from '../../../components/SignIn/SignInForm';
import SignInHeader from '../../../components/SignIn/SignInHeader';
import SignInIllustration from '../../../components/SignIn/SignInIllustration';
import { useAuth } from '../../../context/AuthProvider';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { requestLinkOTP, isLoggedIn, isLoading: authLoading } = useAuth();
    
    // If user is already logged in, redirect to home
    useEffect(() => {
        if (isLoggedIn) {
            console.log('User already logged in, redirecting to home');
            router.replace('/(app)/protected/(tabs)/Home');
        }
    }, [isLoggedIn]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (text) => {
        setEmail(text);
        if (error) setError('');
    };

    const handleSignIn = async () => {
        if (isLoading) return; // prevent double taps

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (!acceptTerms) {
            setError('Please accept the Terms of Service and Privacy Policy');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await requestLinkOTP(email);
            
            if (result.success) {
                setEmailSent(true);
            } else {
                setError(result.error || 'Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error('Sign in error:', error.message);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading while auth is initializing to prevent flash
    if (authLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <ActivityIndicator size="large" color="#3898b3" />
                <Text style={{ marginTop: 20, color: '#666', fontSize: 16 }}>Checking authentication...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SignInHeader />
            <SignInIllustration />
            <SignInForm 
                email={email}
                error={error}
                onEmailChange={handleEmailChange}
                onSignIn={handleSignIn}
                isLoading={isLoading}
                acceptTerms={acceptTerms}
                setAcceptTerms={setAcceptTerms}
                emailSent={emailSent}
            />
            <SignInFooter />
        </View>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
};