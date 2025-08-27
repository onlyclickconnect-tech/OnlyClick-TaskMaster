import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useAppStates } from '../../../context/AppStates';
import { useAuth } from '../../../context/AuthProvider';

export default function LoadingScreen() {
  const { user } = useAuth();
  const { isProfileCompleted } = useAppStates();
  const [loadingText, setLoadingText] = useState('Please wait while we verify your account...');
  const [progress, setProgress] = useState('25%');
  const [currentAnimation, setCurrentAnimation] = useState(1);

  // Array of animation images
  const animationImages = [
    require('../../../../assets/images/bufferAnimation1.png'),
    require('../../../../assets/images/bufferAnimation2.png'),
    require('../../../../assets/images/bufferAnimation3.png'),
    require('../../../../assets/images/bufferAnimation4.png'),
  ];

  useEffect(() => {
    // Animation cycling
    const animationInterval = setInterval(() => {
      setCurrentAnimation(prev => prev === 4 ? 1 : prev + 1);
    }, 300); 

    // Simulate authentication process
    const authProcess = async () => {
      // First phase - Verification
      setTimeout(() => {
        setLoadingText('Setting up your profile...');
        setProgress('50%');
      }, 1500);

      // Second phase - Setup
      setTimeout(() => {
        setLoadingText('Almost ready...');
        setProgress('75%');
      }, 3000);

      // Complete process and navigate to success screen
      setTimeout(() => {
        setProgress('100%');
        router.replace('/auth/success');
      }, 4500);
    };

    authProcess();

    return () => {
      clearInterval(animationInterval);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <Image 
          source={require('../../../../assets/images/logo.png')} 
          style={{ height: 60, width: 400, marginBottom: 20 }}
          resizeMode="contain"
        />
        <Image 
          source={animationImages[currentAnimation - 1]} 
          style={{ width: 400, height: 405 }}
          resizeMode="contain"
        />
      </View>
      <LoadingSpinner
        subtitle={loadingText}
        showProgress={true}
        progressWidth={progress}
        showSpinner={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: '#0097b3',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
});
