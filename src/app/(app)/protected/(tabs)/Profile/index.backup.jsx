import { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useAppStates } from "../../../../../context/AppStates";
import AdvancedOptions from "../../../../../components/Profile/AdvancedOptions";
import BottomLinks from "../../../../../components/Profile/BottomLinks";
import ProfileForm from "../../../../../components/Profile/ProfileForm";
import ProfileHeader from "../../../../../components/Profile/ProfileHeader";

const ProfilePage = () => {
  const [isGeneral, setIsGeneral] = useState(true);
  const { isProfileCompleted, markProfileCompleted } = useAppStates();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  useEffect(() => {
    // Show welcome message if profile is not completed
    if (isProfileCompleted === false) {
      setShowWelcomeMessage(true);
    }
  }, [isProfileCompleted]);

  const handleSaveProfile = async () => {
    try {
      await markProfileCompleted();
      Alert.alert(
        "Profile Saved!",
        "Your profile has been completed successfully.",
        [
          {
            text: "Continue to App",
            onPress: () => router.replace("/(app)/protected/(tabs)/Home")
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {showWelcomeMessage && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Complete Your Profile</Text>
          <Text style={styles.welcomeText}>
            Please fill in your details to get the best experience on TaskMaster
          </Text>
        </View>
      )}
      
      <ProfileHeader isGeneral={isGeneral} setIsGeneral={setIsGeneral} />
      {isGeneral ? <ProfileForm /> : <AdvancedOptions />}
      
      {showWelcomeMessage && isGeneral && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save Profile & Continue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={() => router.replace("/(app)/protected/(tabs)/Home")}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <BottomLinks />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "#fff",
  },
  welcomeContainer: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3898B3",
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  saveButton: {
    backgroundColor: "#3898B3",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#3898B3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#3898B3",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ProfilePage;
