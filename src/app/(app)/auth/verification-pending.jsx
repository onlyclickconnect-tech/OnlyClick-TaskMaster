import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthProvider';
import Text from '../../../components/ui/Text';

export default function VerificationPending() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams();
  const { user, updateUser } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Update user active status to false
    if (user) {
      updateUser({ ...user, isActive: false });
    }

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.replace('/(app)/protected/(tabs)/Home');
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={80} color="#3898B3" />
        </View>

        <Text style={styles.title}>Verification in Progress</Text>

        <Text style={styles.message}>
          Your Aadhaar has been submitted for manual verification.
          Our team will review it within 24-48 hours.
        </Text>

        <Text style={styles.subMessage}>
          Until then, you won't be able to accept new jobs or work on the platform.
          Please hang tight and check back later!
        </Text>

        <Text style={styles.note}>
          You'll receive a notification once your verification is complete.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Got it, take me to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  subMessage: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  note: {
    fontSize: 14,
    color: '#3898B3',
    textAlign: 'center',
    marginBottom: 25,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#3898B3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
