import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native';

const SignInHeader = () => {
    const handleBack = () => router.back();
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: keyboardVisible ? 0 : 1,
            duration: 180,
            useNativeDriver: true,
        }).start();
    }, [keyboardVisible]);

    return (
        <View style={styles.header}>
            

            <Animated.View style={{ opacity: fadeAnim }}>
                {!keyboardVisible && (
                    <Image
                        source={require('../../../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                )}
            </Animated.View>

            
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
    },
    backButton: {
        padding: 8,
    },
    logo: {
        width: 150,
        height: 50,
    },
    infoButton: {
        padding: 8,
    },
});

export default SignInHeader;