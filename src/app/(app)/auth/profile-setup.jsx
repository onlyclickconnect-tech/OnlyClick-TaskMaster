import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProfileForm from '../../../components/Profile/ProfileForm';
import { useAppStates } from '../../../context/AppStates';
import { useAuth } from '../../../context/AuthProvider';

export default function ProfileSetup() {
  const { user, setUser } = useAuth();
  const { markProfileCompleted } = useAppStates();
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const handleValidationChange = (isValid) => {
    setIsFormValid(isValid);
  };

  const handleContinue = async () => {
    setIsLoading(true);
    
    try {
      // Mark profile as completed
      await markProfileCompleted();
      
      // Navigate to main app
      setTimeout(() => {
        setIsLoading(false);
        router.replace('/(app)/auth/verification-pending');
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Please fill in your details to get started with TaskMaster
          </Text>
        </View>

        <View style={styles.formContainer}>
          <ProfileForm onValidationChange={handleValidationChange} />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.continueButton, (!isFormValid || isLoading) && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={!isFormValid || isLoading}
        >
          <Text style={[styles.continueButtonText, (!isFormValid || isLoading) && styles.continueButtonTextDisabled]}>
            {isLoading ? 'Setting up...' : (!isFormValid ? 'Fill Required Fields' : 'Continue to App')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120, // Extra padding for button
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  continueButtonDisabled: {
    backgroundColor: '#9fc7c4',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  continueButtonTextDisabled: {
    color: '#ffffff',
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
