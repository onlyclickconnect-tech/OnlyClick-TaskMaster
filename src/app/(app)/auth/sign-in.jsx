import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { StatusBar, View, Alert } from 'react-native';
import SignInFooter from '../../../components/SignIn/SignInFooter';
import SignInForm from '../../../components/SignIn/SignInForm';
import SignInHeader from '../../../components/SignIn/SignInHeader';
import SignInIllustration from '../../../components/SignIn/SignInIllustration';
import { useAuth } from '../../../context/AuthProvider';
import * as Linking from 'expo-linking';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { requestLinkOTP, isLoggedIn } = useAuth();
    
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
        if (isLoading || isNavigating) return; // prevent double taps

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await requestLinkOTP(email);
            
            if (result.success) {
                Alert.alert(`Email Send Successfully to ${email}`)
                // Directly navigate to OTP (no loading). Loading should only appear after Aadhaar verification.
                // const emailQ = encodeURIComponent(email);
                // For now aadhar is not verified automatically instead manual verification will be done.
                // router.push(`/auth/aadharVerify`); 
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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <SignInHeader />
            <SignInIllustration />
            <SignInForm 
                setIsLoading={setIsLoading}
                email={email}
                error={error}
                onEmailChange={handleEmailChange}
                onSignIn={handleSignIn}
                isLoading={isLoading || isNavigating}
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