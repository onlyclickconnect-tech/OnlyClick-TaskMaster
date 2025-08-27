import { Text, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as NavigationBar from "expo-navigation-bar/src/NavigationBar.android";
import { useCallback, useEffect } from "react";
import { useAppStates } from "../context/AppStates";
import { useAuth } from "../context/AuthProvider";

export default function Index() {
  const { isAppOpenedFirstTime, isProfileCompleted } = useAppStates();
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  
  const a = useCallback(async () => {
    await NavigationBar.setVisibilityAsync("hidden");
    // await NavigationBar.setBehaviorAsync("inset-swipe"); // This line causes the warning, commented out
  }, []);
  
  useEffect(() => {
    a();
  }, []);

  useEffect(() => {
    // Wait for all loading states to complete
    if (isAppOpenedFirstTime !== null && isProfileCompleted !== null && !isLoading) {
      if (isAppOpenedFirstTime) {
        // First time opening app - show onboarding
        router.replace("/intro");
      } else if (!isLoggedIn) {
        // User not logged in - go to sign in
        router.replace("/(app)/auth/sign-in");
      } else if (!isProfileCompleted) {
        // User logged in but hasn't completed profile - go to signup success which will handle profile setup
        router.replace("/(app)/auth/signup-success");
      } else {
        // User is logged in and has completed profile - go to main app
        router.replace("/(app)/protected/(tabs)/Home");
      }
    }
  }, [isAppOpenedFirstTime, isProfileCompleted, isLoggedIn, isLoading, router]);

  // Show loading while checking app state
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#fff'
    }}>
      <ActivityIndicator size="large" color="#3898b3" />
      <Text style={{ marginTop: 20, color: '#666' }}>Loading TaskMaster...</Text>
    </View>
  );
}
