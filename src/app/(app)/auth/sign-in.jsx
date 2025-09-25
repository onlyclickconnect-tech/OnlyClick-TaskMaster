import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import SignInFooter from '../../../components/SignIn/SignInFooter';
import SignInForm from '../../../components/SignIn/SignInForm';
import SignInFormPassword from '../../../components/SignIn/SignInFormPassword';
import SignInHeader from '../../../components/SignIn/SignInHeader';
import SignInIllustration from '../../../components/SignIn/SignInIllustration';
import { useAuth } from '../../../context/AuthProvider';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [authMode, setAuthMode] = useState('password'); // 'password' or 'magiclink'
    const { requestLinkOTP, loginWithPassword, isLoggedIn, isLoading: authLoading } = useAuth();
    
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

    const handlePasswordChange = (text) => {
        setPassword(text);
        if (error) setError('');
    };

    const handleToggleAuthMode = () => {
        setAuthMode(authMode === 'password' ? 'magiclink' : 'password');
        setError('');
        setEmailSent(false);
    };

    const handleRegister = () => {
        router.push('/(app)/auth/register');
    };

    const handlePasswordSignIn = async () => {
        if (isLoading) return; // prevent double taps

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

        if (!acceptTerms) {
            setError('Please accept the Terms of Service and Privacy Policy');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await loginWithPassword(email, password);
            
            if (result.success) {
                // Auth provider will handle the redirect based on user state
                console.log('Password sign in successful');
            } else {
                setError(result.error || 'Failed to sign in. Please check your credentials.');
            }
        } catch (error) {
            console.error('Password sign in error:', error.message);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMagicLinkSignIn = async () => {
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
            console.error('Magic link error:', error.message);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignIn = authMode === 'password' ? handlePasswordSignIn : handleMagicLinkSignIn;

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
            {authMode === 'password' ? (
                <SignInFormPassword 
                    email={email}
                    password={password}
                    error={error}
                    onEmailChange={handleEmailChange}
                    onPasswordChange={handlePasswordChange}
                    onSignIn={handleSignIn}
                    isLoading={isLoading}
                    acceptTerms={acceptTerms}
                    setAcceptTerms={setAcceptTerms}
                    onToggleAuthMode={handleToggleAuthMode}
                    onRegister={handleRegister}
                />
            ) : (
                <SignInForm 
                    email={email}
                    error={error}
                    onEmailChange={handleEmailChange}
                    onSignIn={handleSignIn}
                    isLoading={isLoading}
                    acceptTerms={acceptTerms}
                    setAcceptTerms={setAcceptTerms}
                    emailSent={emailSent}
                    onToggleAuthMode={handleToggleAuthMode}
                />
            )}
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