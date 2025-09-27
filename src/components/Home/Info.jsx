import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import Text from "../ui/Text";
import { useAuth } from "../../context/AuthProvider";
import useDimension from "../../hooks/useDimensions";

export default function Info({ userStats, isLoading }) {
  const { screenHeight, screenWidth } = useDimension();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  
  const styles = StyleSheet.create({
    container: {
      height: screenHeight * 0.25,
      top: 10,
      width: "100%",
      paddingHorizontal: 10,
    },
    infoContainer: {
      top: 9,
      height: "50%",
      width: "100%",
      flexDirection: "row",
    },
    profileImage: {
      height: "100%",
      width: "30%",
      justifyContent: "center",
      alignItems: "center",
    },
    info: {
      height: "100%",
      width: "70%",
      justifyContent: "space-around",
    },
    loadingContainer: {
      height: "50%",
      justifyContent: "center",
      alignItems: "center",
    }
  });



  const displayName = user?.name || user?.fullName || "Taskmaster";
  const profileImageUri = user?.profileImage || user?.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(displayName) + "&background=3898b3&color=fff&size=200";
  const fallbackImageUri = "https://avatar.windsor.io/serviceprovider";
  const primaryService = user?.services?.[0] || "General Services";
  const userIdDisplay = user?.taskmasterId || user?._id?.slice(-6) || "TM001";
  const rating = userStats?.averageRating || user?.rating || 0;

  if (isLoading) {
    return (
      <View style={styles.container}>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3898b3" />
          <Text style={{ marginTop: 10, color: "#666" }}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={styles.profileImage}>
          <Image
            source={{ uri: imageError ? fallbackImageUri : profileImageUri }}
            style={{ height: 90, width: 90, borderRadius: 45, borderWidth: 1, borderColor: "#ccc" }}
            onError={() => {
              console.log('Failed to load profile image, using fallback');
              setImageError(true);
            }}
          />
        </View>
        <View style={styles.info}>
          <View style={{ flexDirection: "row" }}>
            <Text>Task Master Name: </Text>
            <Text style={{ fontWeight: "bold", left: 10 }}>{displayName}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text>Task Master ID: </Text>
            <Text style={{ fontWeight: "bold", left: 10 }}>{userIdDisplay}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Text>Primary Service: </Text>
            <Text style={{ fontWeight: "bold", left: 10, color: "#3898b3" }}>
              {primaryService}
            </Text>
          </View>
        </View>
      </View>
      
    </View>
  );
}
