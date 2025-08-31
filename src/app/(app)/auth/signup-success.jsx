import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import SuccessHeader from '../../../components/SignUpSuccess/SuccessHeader';
import SuccessIllustration from '../../../components/SignUpSuccess/SuccessIllustration';
import SuccessMessage from '../../../components/SignUpSuccess/SuccessMessage';
import SuccessWelcome from '../../../components/SignUpSuccess/SuccessWelcome';
import { useAppStates } from '../../../context/AppStates';

export default function SignupSuccess() {
  const { isProfileCompleted } = useAppStates();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if profile is completed to decide where to navigate
      if (isProfileCompleted) {
        router.replace('/protected/');
      } else {
        // Navigate to profile setup form
        router.replace('/auth/profile-setup');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isProfileCompleted]);

  return (
    <View style={styles.container}>
      <SuccessHeader />
      <SuccessMessage />
      <SuccessIllustration />
      <SuccessWelcome />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});