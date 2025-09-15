import { router } from 'expo-router';
import { useState } from 'react';
import { StatusBar, View } from 'react-native';
import SignInFooter from '../../../components/SignIn/SignInFooter';
import SignInForm from '../../../components/SignIn/SignInForm';
import SignInHeader from '../../../components/SignIn/SignInHeader';
import SignInIllustration from '../../../components/SignIn/SignInIllustration';
import { useAuth } from '../../../context/AuthProvider';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const { requestOTP } = useAuth();

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
            const result = await requestOTP(email);
            
            if (result.success) {
                // Prevent double navigation and mark navigating state
                setIsNavigating(true);
                // Directly navigate to Aadhaar verify
                router.push(`/auth/aadharVerify`);
            } else {
                setError(result.error || 'Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error('Sign in error:', error);
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