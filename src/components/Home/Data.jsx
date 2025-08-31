import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthProvider";

export default function Data({ userStats, isLoading }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  
  // Sync isActive with user.isActive
  useEffect(() => {
    if (user?.isActive !== undefined) {
      setIsActive(user.isActive);
    }
  }, [user?.isActive]);
  
  // Get user's primary category/niche - default to 'Electrician' if not available
  const userCategory = user?.services?.primaryCategory || user?.primaryCategory || 'Electrician';

  const handleToggleStatus = async (value) => {
    setIsActive(value);
    // TODO: Here you would make an API call to update the user's status
    // Example: await userService.updateStatus(value);
    console.log(`Worker status changed to: ${value ? 'Active' : 'Inactive'}`);
  };
  const styles = StyleSheet.create({
    container: {
      top: 15,
      height: "100%",
      width: "100%",
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    loadingContainer: {
      height: 200,
      justifyContent: "center",
      alignItems: "center",
    },
    servicesButton: {
      backgroundColor: "#fff",
      marginTop: 20,
      borderRadius: 12,
      padding: 16,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderLeftWidth: 4,
      borderLeftColor: "#4ab9cf",
    },
    servicesButtonContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    servicesButtonText: {
      flex: 1,
      marginLeft: 12,
    },
    servicesButtonTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
      marginBottom: 2,
    },
    servicesButtonSubtitle: {
      fontSize: 13,
      color: "#666",
    },
    statusToggleContainer: {
      backgroundColor: "#fff",
      marginTop: 20,
      borderRadius: 12,
      padding: 20,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderLeftWidth: 4,
    },
    statusToggleContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statusInfo: {
      flex: 1,
    },
    statusTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: "#333",
      marginBottom: 4,
    },
    statusSubtitle: {
      fontSize: 14,
      color: "#666",
      lineHeight: 20,
    },
  });

  // Default values with real data integration
  const totalEarnings = userStats?.totalEarnings || 0;
  const jobsFinished = userStats?.completedBookings || 0;
  const totalRequests = userStats?.totalBookings || 0;
  const totalAssigned = userStats?.activeBookings || 0;

  const data = [
    {
      number: jobsFinished,
      text: "Jobs Finished",
      bgColor: "#3ea2bb",
      textColor: "white",
    },
    {
      number: totalRequests,
      text: "Total Requests",
      bgColor: "#3ea2bb",
      textColor: "white",
    },
    {
      number: totalAssigned,
      text: "Total Assigned",
      bgColor: "#3ea2bb",
      textColor: "white",
    },
  ];

  // Dummy recent bookings data
  const dummyRecentBookings = [
    { id: 1, serviceType: "Plumbing", createdAt: "2025-08-15", amount: 500, status: "completed" },
    { id: 2, serviceType: "Electrical", createdAt: "2025-08-14", amount: 750, status: "in-progress" },
    { id: 3, serviceType: "Cleaning", createdAt: "2025-08-13", amount: 300, status: "pending" },
  ];

  // Replace recentBookings prop with dummy data
  const recentBookings = dummyRecentBookings;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ab9cf" />
          <Text style={{ marginTop: 10, color: "#666" }}>Loading statistics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          backgroundColor: "#F1C40F",
          borderRadius: 15,
          paddingVertical: 15,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "600", color: "white" }}>
          Total Earnings
        </Text>
        <Text
          style={{
            backgroundColor: "white",
            color: "#1e1e1e",
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            fontWeight: "500",
          }}
        >
          Rs. {totalEarnings.toLocaleString()}
        </Text>
      </View>

      {/* Worker Status Toggle */}
      <View 
        style={[
          styles.statusToggleContainer, 
          { borderLeftColor: isActive ? "#4CAF50" : "#FF5722" }
        ]}
      >
        <View style={styles.statusToggleContent}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              Work Status: {isActive ? "Active" : "Inactive"}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isActive 
                ? "You're available for new jobs" 
                : "You won't receive new job requests"
              }
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={handleToggleStatus}
            trackColor={{ false: "#FF5722", true: "#4CAF50" }}
            thumbColor={isActive ? "#fff" : "#fff"}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View>

      {/* View Services Button */}
      <TouchableOpacity 
        style={styles.servicesButton}
        onPress={() => router.push('/(app)/protected/Services')}
      >
        <View style={styles.servicesButtonContent}>
          <Ionicons name="construct" size={24} color="#4ab9cf" />
          <View style={styles.servicesButtonText}>
            <Text style={styles.servicesButtonTitle}>View My Services</Text>
            <Text style={styles.servicesButtonSubtitle}>
              See {userCategory} services & pricing
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#4ab9cf" />
        </View>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          top: 30,
          justifyContent: "space-around",
          gap: 10,
        }}
      >
        {data.map((item, index) => {
          return (
            <View key={index} style={{ alignItems: "center" }}>
              <View
                style={{
                  height: 80,
                  width: 80,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 40,
                  backgroundColor: item.bgColor,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "600",
                    color: item.textColor,
                  }}
                >
                  {item.number}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "400",
                  top: 10,
                  textAlign: "center",
                }}
              >
                {item.text}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Recent Bookings Section */}
      {recentBookings && recentBookings.length > 0 && (
        <View style={{ top: 50, marginBottom: 150 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 15 }}>
            Recent Bookings
          </Text>
          {recentBookings.slice(0, 3).map((booking, index) => (
            <View
              key={booking._id || index}
              style={{
                backgroundColor: "#f8f9fa",
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
                borderLeftWidth: 4,
                borderLeftColor: booking.status === 'completed' ? '#28a745' : 
                               booking.status === 'in-progress' ? '#ffc107' : '#6c757d',
              }}
            >
              <Text style={{ fontWeight: "600", color: "#333" }}>
                {booking.serviceType || "Service"}
              </Text>
              <Text style={{ color: "#666", fontSize: 12 }}>
                {new Date(booking.createdAt).toLocaleDateString()} • Rs. {booking.amount}
              </Text>
              <Text style={{ 
                color: booking.status === 'completed' ? '#28a745' : 
                       booking.status === 'in-progress' ? '#ffc107' : '#6c757d',
                fontSize: 12,
                fontWeight: "500",
                textTransform: "capitalize"
              }}>
                {booking.status}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Service List Modal */}
  {/* ServiceListModal is kept in the repo for backward compatibility but navigation now opens the full screen Services page */}
    </View>
  );
}
