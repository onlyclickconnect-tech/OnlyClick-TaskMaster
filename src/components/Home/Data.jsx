import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../../context/AuthProvider";
import { useBookings } from "../../context/bookingsContext";
import Text from '../ui/Text';

export default function Data({ userStats, isLoading }) {
  const { user } = useAuth();
  const { inProgressBookings, completedBookings, refreshAllBookings, loading: bookingsLoading } = useBookings();
  const router = useRouter();
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  
  // Refresh bookings when component mounts and when user focuses on home tab
  useFocusEffect(
    useCallback(() => {
      refreshAllBookings();
    }, [])
  );
  
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
  const jobsFinished = completedBookings?.length || 0; // Completed jobs from context
  const totalRequests = userStats?.totalBookings || 0;
  const totalAssigned = inProgressBookings?.length || 0; // Pending jobs from context

  const data = [
    {
      number: jobsFinished,
      text: "Jobs Finished",
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

  // Get recent bookings from context (completed and in-progress only)
  const allBookings = [...(completedBookings || []), ...(inProgressBookings || [])];
  const sortedBookings = allBookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const recentBookings = sortedBookings.slice(0, 3);

  if (isLoading || bookingsLoading) {
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
      {/* <View 
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
      </View> */}

      {/* View Services Button */}
      {/* <TouchableOpacity 
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
      </TouchableOpacity> */}

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
          {recentBookings.slice(0, 3).map((booking, index) => {
            // Check if booking is in completedBookings array to determine status
            const isCompleted = completedBookings?.some(job => job._id === booking._id);
            const statusColor = isCompleted ? '#4CAF50' : '#FFC107';
            const statusBgColor = isCompleted ? '#E8F5E8' : '#FFF8E1';
            const statusText = isCompleted ? 'Completed' : 'In Progress';
            
            return (
              <View
                key={booking._id || index}
                style={{
                  backgroundColor: "#fff",
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: statusColor,
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <Text style={{ fontWeight: "600", color: "#333", flex: 1, marginRight: 10 }}>
                    {booking.serviceName || booking.serviceType || "Service"}
                  </Text>
                  <View style={{
                    backgroundColor: statusBgColor,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}>
                    <Text style={{ 
                      color: statusColor,
                      fontSize: 11,
                      fontWeight: "600",
                    }}>
                      {statusText}
                    </Text>
                  </View>
                </View>
                
                <Text style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>
                  {new Date(booking.createdAt).toLocaleDateString()}
                </Text>
                
                {(booking.payment || booking.amount) && (
                  <Text style={{ color: "#4ab9cf", fontSize: 13, fontWeight: "600" }}>
                    Rs. {(booking.payment || booking.amount).toLocaleString()}
                  </Text>
                )}
                
                {booking.customerName && (
                  <Text style={{ color: "#888", fontSize: 11, marginTop: 2 }}>
                    Customer: {booking.customerName}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Service List Modal */}
  {/* ServiceListModal is kept in the repo for backward compatibility but navigation now opens the full screen Services page */}
    </View>
  );
}
