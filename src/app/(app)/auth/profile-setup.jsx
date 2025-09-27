import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppStates } from '../../../context/AppStates';
import { useAuth } from '../../../context/AuthProvider';
import supabaseAuthService from '../../../services/supabaseAuthService';
import Text from '../../../components/ui/Text';
export default function ProfileSetup() {
  const { user, setUser, authToken, setNeedsProfileSetup, userData, setUserData} = useAuth();
  const { markProfileCompleted } = useAppStates();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  console.log(authToken);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      // Save profile data to Supabase  attention
      const saveResponse = await supabaseAuthService.saveUserProfile({
        tm_id: user.id, // Add the user ID
        name: formData.name,
        ph_no: formData.phone
        // Add other fields as needed
      });
      
      if (!saveResponse.success) {
        throw new Error(saveResponse.message || 'Failed to save profile');
      }

      console.log("Profile saved successfully, updating auth state");
      
      // Update the userData in auth context
      const updatedUserData = {
        ...userData,
        name: formData.name,
        ph_no: formData.phone
      };
      setUserData(updatedUserData);
      
      // Mark profile setup as complete
      setNeedsProfileSetup(false);
      
      // Mark profile as completed in app states
      await markProfileCompleted();
      
      console.log("Navigating to home page");
      setIsLoading(false);
      
      // Navigate to main app immediately
      router.replace('/(app)/protected/(tabs)/Home');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Failed to save profile. Please try again.');
    }
  };


  // profile skip not needed as of now
  // const handleSkip = () => {
  //   Alert.alert(
  //     "Skip Profile Setup",
  //     "You can complete your profile later from the Profile tab. Continue?",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       { 
  //         text: "Skip", 
  //         onPress: async () => {
  //           await markProfileCompleted();
  //           router.replace('/(app)/protected/(tabs)/Home');
  //         }
  //       }
  //     ]
  //   );
  // };

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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              autoCapitalize="words"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <TextInput
              style={[styles.input, errors.category && styles.inputError]}
              placeholder="e.g. Plumber, Electrician"
              value={formData.category}
              onChangeText={(value) => handleInputChange('category', value)}
              autoCapitalize="words"
            />
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.textArea, errors.address && styles.inputError]}
              placeholder="Enter your complete address"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.continueButton, isLoading && styles.continueButtonDisabled]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={[styles.continueButtonText, isLoading && styles.continueButtonTextDisabled]}>
            {isLoading ? 'Saving...' : 'Save & Continue'}
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
    paddingHorizontal: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#1a1a1a',
  },
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#1a1a1a',
    minHeight: 80,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
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
