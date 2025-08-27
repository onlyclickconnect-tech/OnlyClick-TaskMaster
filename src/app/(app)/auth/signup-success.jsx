import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppStates } from '../../../context/AppStates';
import SuccessHeader from '../../../components/SignUpSuccess/SuccessHeader';
import SuccessIllustration from '../../../components/SignUpSuccess/SuccessIllustration';
import SuccessMessage from '../../../components/SignUpSuccess/SuccessMessage';
import SuccessWelcome from '../../../components/SignUpSuccess/SuccessWelcome';

export default function SignupSuccess() {
  const { isProfileCompleted } = useAppStates();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if profile is completed to decide where to navigate
      if (isProfileCompleted) {
        router.replace('/protected/');
      } else {
        // Navigate to profile setup (using the Profile tab for now)
        router.replace('/(app)/protected/(tabs)/Profile');
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