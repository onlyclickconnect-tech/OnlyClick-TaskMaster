import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../context/AuthProvider';
import { useAppStates } from '../../../context/AppStates';
import ProfileForm from '../../../components/Profile/ProfileForm';

export default function ProfileSetup() {
  const { user, setUser } = useAuth();
  const { markProfileCompleted } = useAppStates();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    
    try {
      // Mark profile as completed
      await markProfileCompleted();
      
      // Navigate to main app
      setTimeout(() => {
        setIsLoading(false);
        router.replace('/(app)/protected/(tabs)/Home');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Profile Setup",
      "You can complete your profile later from the Profile tab. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Skip", 
          onPress: async () => {
            await markProfileCompleted();
            router.replace('/(app)/protected/(tabs)/Home');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>
          Please fill in your details to get started with TaskMaster
        </Text>
      </View>

      <View style={styles.formContainer}>
        <ProfileForm />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleContinue}
          disabled={isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Setting up...' : 'Continue to App'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    padding: 30,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#3898B3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#3898B3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#3898B3',
    fontSize: 16,
    fontWeight: '500',
  },
});
