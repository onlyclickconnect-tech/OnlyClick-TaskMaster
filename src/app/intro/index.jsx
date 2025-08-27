import { Redirect } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import OnboardingContainer from '../../components/Onboarding/OnboardingContainer';

export default function IntroPage() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const handleComplete = () => {
    setOnboardingComplete(true);
  };

  if (onboardingComplete) {
    return <Redirect href="/auth/sign-in" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <OnboardingContainer onComplete={handleComplete} />
    </View>
  );
}