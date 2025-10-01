import * as NavigationBar from "expo-navigation-bar/src/NavigationBar.android";
import { usePathname, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Text from "../components/ui/Text";
import { useAppStates } from "../context/AppStates";
import { useAuth } from "../context/AuthProvider";

export default function Index() {
  const { isAppOpenedFirstTime, isProfileCompleted } = useAppStates();
  const { isLoggedIn, isLoading, userData, needsProfileSetup } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const a = useCallback(async () => {
    await NavigationBar.setVisibilityAsync("hidden");
    // await NavigationBar.setBehaviorAsync("inset-swipe"); // This line causes the warning, commented out
  }, []);

  useEffect(() => {
    a();
  }, []);

  useEffect(() => {
    // Wait for all loading states to complete - add small delay to prevent flash
    if (isAppOpenedFirstTime !== null && !isLoading) {
      // Add a small delay to ensure auth state is fully resolved
      const timeoutId = setTimeout(() => {
      

      // Don't redirect if user is already on profile-setup page
      if (pathname === '/(app)/auth/profile-setup') {
        return;
      }

      if (isAppOpenedFirstTime) {
        // First time opening app - show onboarding
        router.replace("/intro");
      } else if (!isLoggedIn) {
        // User not logged in - go to sign in
        router.replace("/(app)/auth/sign-in");
      } else if (isLoggedIn && needsProfileSetup) {
        // User is logged in but needs profile setup (not in taskmaster table)
        router.replace("/(app)/auth/profile-setup");
      } else if (isLoggedIn && !userData) {
        // User is logged in but userData not yet loaded - wait
        return;
      } else if (isLoggedIn && userData && (!userData.name || !userData.ph_no)) {
        // User logged in but profile incomplete - go to profile setup
        router.replace("/(app)/auth/profile-setup");
      } else if (isLoggedIn && userData) {
        // User is logged in and has completed profile - go to main app
        router.replace("/(app)/protected/(tabs)/Home");
      }
      }, 100); // 100ms delay to prevent flash

      return () => clearTimeout(timeoutId);
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
