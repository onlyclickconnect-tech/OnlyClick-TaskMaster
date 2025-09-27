import { StyleSheet } from "react-native";
import useDimension from "../../hooks/useDimensions";

export default function HeaderStyle() {
  const { screenHeight, screenWidth } = useDimension();

  const styles = StyleSheet.create({
    header: {
      height: screenHeight * 0.12, // Increased from 0.20 to give more space
      width: screenWidth,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
      paddingTop: screenHeight * 0.04, // Keep padding consistent
      backgroundColor: "white",
      borderBottomLeftRadius: 20, // Added rounded bottom corners
      borderBottomRightRadius: 20,
      overflow: 'hidden', // Ensure gradient respects border radius
    },
    locationAndNotification: {
      flexDirection: "row",
      height: screenHeight * 0.18 * 0.4, // Updated to use correct header height
      width: screenWidth,
      justifyContent: "space-between",
      alignItems: "center",
    },
    location: {
      flexDirection: "column",
      height: screenHeight * 0.18 * 0.4, // Updated to use correct header height
      width: screenWidth * 0.7,
      paddingLeft: 15,
      justifyContent: "center", // Added for better vertical alignment
    },
    notification: {
      justifyContent: "center",
      alignItems: "center",
      height: screenHeight * 0.18 * 0.4, // Updated to use correct header height
      width: screenWidth * 0.2,
      paddingLeft: 10,
    },
    locationText: {
      flexDirection: "row",
      alignItems: "center",
    },
    searchAndProfile: {
      flexDirection: "row",
      height: screenHeight * 0.18 * 0.4, // Updated to use correct header height
      width: screenWidth,
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 15, // Increased bottom padding for better spacing
    },
    search: {
      position: "relative",
      justifyContent: "center",
      height: screenHeight * 0.18 * 0.4, // Updated to use correct header height
      width: screenWidth * 0.8,
      paddingLeft: 10,
    },
    searchText: {
      backgroundColor: "white",
      borderRadius: 12, // Increased border radius for better UI
      height: screenHeight * 0.18 * 0.25, // Updated height calculation for better proportion
      paddingLeft: 50,
      fontSize: 16, // Reduced font size for compact design
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    searchIcon: {
      position: "absolute",
      left: 35,
      top: screenHeight * 0.18 * 0.4 * 0.5 - 12, // Updated calculation
      zIndex: 1,
    },
    profile: {
      justifyContent: "center",
      alignItems: "center",
      height: screenHeight * 0.18 * 0.4, // Updated to use correct header height
      width: screenWidth * 0.2,
      paddingLeft: 20,
    },
  });

  return styles;
}