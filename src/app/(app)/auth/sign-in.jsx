import { router } from 'expo-router';
import { useState } from 'react';
import { StatusBar, View } from 'react-native';
import SignInFooter from '../../../components/SignIn/SignInFooter';
import SignInForm from '../../../components/SignIn/SignInForm';
import SignInHeader from '../../../components/SignIn/SignInHeader';
import SignInIllustration from '../../../components/SignIn/SignInIllustration';
import { useAuth } from '../../../context/AuthProvider';

export default function SignIn() {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { requestOTP } = useAuth();

    const formatPhoneNumber = (text) => {
        const digits = text.replace(/\D/g, '');
        const limitedDigits = digits.slice(0, 10);
        if (limitedDigits.length > 5) {
            return limitedDigits.slice(0, 5) + ' ' + limitedDigits.slice(5);
        }
        return limitedDigits;
    };

    const handlePhoneChange = (text) => {
        const formatted = formatPhoneNumber(text);
        setPhone(formatted);
        if (error) setError('');
    };

    const handleSignIn = async () => {
        const rawPhone = phone.replace(/\s/g, '');
        if (rawPhone.length < 10) {
            setError('Please enter a complete 10-digit mobile number');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const fullPhoneNumber = `+91${rawPhone}`;
            const result = await requestOTP(fullPhoneNumber);
            
            if (result.success) {
                // Directly navigate to OTP (no loading). Loading should only appear after Aadhaar verification.
                const phoneQ = encodeURIComponent(fullPhoneNumber);
                router.push(`/auth/otp?phoneNumber=${phoneQ}&type=login`);
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
                phone={phone}
                error={error}
                onPhoneChange={handlePhoneChange}
                onSignIn={handleSignIn}
                isLoading={isLoading}
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