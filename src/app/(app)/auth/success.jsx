import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useAppStates } from '../../../context/AppStates';
import { useAuth } from '../../../context/AuthProvider';
import Text from '../../../components/ui/Text';

export default function SuccessScreen() {
  const { user } = useAuth();
  const { isProfileCompleted } = useAppStates();
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Array of success animation images
  const successImages = [
    require('../../../../assets/images/success3.png'),
    require('../../../../assets/images/success0.png'),
  ];

  useEffect(() => {
    // Animation cycling - stops when it reaches success0
    const animationInterval = setInterval(() => {
      setCurrentAnimation(prev => {
        if (prev === 1) {
          // Reached success0 (index 1), stop the animation
          setAnimationComplete(true);
          clearInterval(animationInterval);
          return 1; // Stay at success0
        }
        return prev + 1;
      });
    }, 800); // Show each frame for 800ms

    const timer = setTimeout(() => {
      // Check if profile is completed to decide where to navigate
      if (isProfileCompleted) {
        // User already has profile set up, go to main app
        router.replace('/(app)/protected/(tabs)/Home');
      } else {
        // User needs to set up profile
        router.replace('/auth/profile-setup');
      }
    }, 2000); // Reduced from 3000ms to 2000ms (2 seconds)

    return () => {
      clearTimeout(timer);
      clearInterval(animationInterval);
    };
  }, [isProfileCompleted]);

  return (
    <View style={styles.container}>
      <Image 
          source={require('../../../../assets/images/logo.png')} 
          style={{ height: 60, width: 400, marginBottom: 20 }}
          resizeMode="contain"
      />
      <View style={styles.animationContainer}>
        <Image 
          source={successImages[currentAnimation]} 
          style={styles.successAnimation}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          Your account has been successfully verified
        </Text>
        
        <Text style={styles.message}>
          {isProfileCompleted 
            ? "Taking you to your dashboard..." 
            : "Let's set up your profile..."
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  successAnimation: {
    width: 400,
    height: 400,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0097b3',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#0097b3',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  message: {
    fontSize: 14,
    color: '#0097b3',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
