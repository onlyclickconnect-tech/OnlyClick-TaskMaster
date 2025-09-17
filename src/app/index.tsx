import * as NavigationBar from "expo-navigation-bar/src/NavigationBar.android";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAppStates } from "../context/AppStates";
import { useAuth } from "../context/AuthProvider";

export default function Index() {
  const { isAppOpenedFirstTime, isProfileCompleted } = useAppStates();
  const { isLoggedIn, isLoading, userData, needsProfileSetup } = useAuth();
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
    if (isAppOpenedFirstTime !== null && !isLoading) {
      console.log('App state:', { 
        isAppOpenedFirstTime, 
        isLoggedIn, 
        hasUserData: !!userData, 
        needsProfileSetup 
      });
      
      if (isAppOpenedFirstTime) {
        // First time opening app - show onboarding
        console.log('Routing to intro (first time)');
        router.replace("/intro");
      } else if (!isLoggedIn) {
        // User not logged in - go to sign in
        console.log('Routing to sign-in (not logged in)');
        router.replace("/(app)/auth/sign-in");
      } else if (isLoggedIn && needsProfileSetup) {
        // User is logged in but needs profile setup (not in taskmaster table)
        console.log('Routing to profile setup (user not in taskmaster table)');
        router.replace("/(app)/auth/profile-setup");
      } else if (isLoggedIn && !userData) {
        // User is logged in but userData not yet loaded - wait
        console.log('User logged in but userData not loaded yet, waiting...');
        return;
      } else if (isLoggedIn && userData && (!userData.name || !userData.ph_no)) {
        // User logged in but profile incomplete - go to profile setup
        console.log('Routing to profile setup (profile incomplete)');
        console.log('Missing data - name:', userData.name, 'ph_no:', userData.ph_no);
        router.replace("/(app)/auth/profile-setup");
      } else if (isLoggedIn && userData) {
        // User is logged in and has completed profile - go to main app
        console.log('Routing to home (authenticated and profile complete)');
        router.replace("/(app)/protected/(tabs)/Home");
      }
    }
  }, [isAppOpenedFirstTime, isLoggedIn, isLoading, userData, needsProfileSetup, router]);


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
