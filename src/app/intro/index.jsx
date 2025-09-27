import { ActivityIndicator, View } from 'react-native';
import Text from '@/src/components/ui/Text';
import OnboardingContainer from '../../components/Onboarding/OnboardingContainer';
import { useAuth } from '../../context/AuthProvider';

export default function IntroPage() {
  const { isLoading: authLoading } = useAuth();

  // Show loading while auth is initializing to prevent flash
  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3898b3" />
        <Text style={{ marginTop: 20, color: '#666', fontSize: 16 }}>Loading TaskMaster...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <OnboardingContainer />
    </View>
  );
}