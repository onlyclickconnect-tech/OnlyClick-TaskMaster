import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { useBookings } from "../../context/bookingsContext";
import useDimension from "../../hooks/useDimensions";
import Text from "../ui/Text";

export default function Info({ userStats, isLoading }) {
  const { screenHeight, screenWidth } = useDimension();
  const { user, userData } = useAuth();

  const [imageError, setImageError] = useState(false);
  
  const styles = StyleSheet.create({
    container: {
      height: screenHeight * 0.3, // Increased height to show more data
      top: 10,
      width: "100%",
      paddingHorizontal: 10,
      backgroundColor: "#fff",
      borderRadius: 15,
      marginHorizontal: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    infoContainer: {
      top: 9,
      height: "65%", // Adjusted for stats row below
      width: "100%",
      flexDirection: "row",
      paddingHorizontal: 10,
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
      justifyContent: "center", // Changed from space-around to center
      paddingLeft: 10,
    },
    loadingContainer: {
      height: "65%",
      justifyContent: "center",
      alignItems: "center",
    }
  });


  const displayName = userData?.name || userData?.fullName || "Taskmaster";
  const profileImageUri = userData?.profileImage || userData?.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(displayName) + "&background=3898b3&color=fff&size=200";
  const fallbackImageUri = "https://avatar.windsor.io/serviceprovider";
  const primaryService = userData?.categories || "General Services";
  const userIdDisplay = userData?.taskmasterId || userData?.id|| "TM001";
  if (isLoading) {

    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3898b3" />
          <Text style={{ marginTop: 10, color: "#666" }}>
            {isLoading ? "Loading profile..." : bookingsLoading ? "Loading jobs data..." : "Loading taskmaster data..."}
          </Text>
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
            style={{ 
              height: 90, 
              width: 90, 
              borderRadius: 45, 
              borderWidth: 2, 
              borderColor: "#3898b3" 
            }}
            onError={() => {
              console.log('Failed to load profile image, using fallback');
              setImageError(true);
            }}
          />
        </View>
        <View style={styles.info}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
              {displayName}
            </Text>
            <View style={{ 
              marginLeft: 10, 
              backgroundColor: "#4CAF50", 
              paddingHorizontal: 8, 
              paddingVertical: 2, 
              borderRadius: 10 
            }}>
              <Text style={{ fontSize: 10, color: "white", fontWeight: "bold" }}>
                ACTIVE
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row" }}>
            <Text>Task Master ID: </Text>
            <Text style={{ fontWeight: "bold", left: 10 }}>TM00{userIdDisplay}</Text>

          </View>
          
          <View style={{ flexDirection: "row", marginBottom: 3 }}>
            <Text style={{ fontSize: 12, color: "#666" }}>Phone: </Text>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#333" }}>
              {displayPhone}
            </Text>
          </View>
          
          <View style={{ flexDirection: "row", marginBottom: 3 }}>
            <Text style={{ fontSize: 12, color: "#666" }}>Email: </Text>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#333" }}>
              {displayEmail}
            </Text>
          </View>
          
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
            
            
          </View>
        </View>
      </View>
      
      {/* Additional Stats Row */}
      <View style={{ 
        flexDirection: "row", 
        justifyContent: "space-around", 
        marginTop: 20, 
        paddingHorizontal: 20 
      }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#3898b3" }}>
            {totalCompletedJobs}
          </Text>
          <Text style={{ fontSize: 11, color: "#666" }}>Completed</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#FFC107" }}>
            {totalInProgressJobs}
          </Text>
          <Text style={{ fontSize: 11, color: "#666" }}>In Progress</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#4CAF50" }}>
            {completionRate}%
          </Text>
          <Text style={{ fontSize: 11, color: "#666" }}>Completion Rate</Text>
        </View>
      </View>
    </View>
  );
}
