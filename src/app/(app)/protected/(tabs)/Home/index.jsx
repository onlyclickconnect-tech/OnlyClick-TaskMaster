import { ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useState, useEffect } from "react";
import Header from "../../../../../components/Home/Header";
import Info from "../../../../../components/Home/Info";
import Data from "../../../../../components/Home/Data";
import { useAuth } from "../../../../../context/AuthProvider";

export default function Home() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Dummy data for user stats
      const dummyStats = {
        totalBookings: 10,
        completedBookings: 8,
        pendingBookings: 2,
      };

      // Dummy data for recent bookings
      const dummyBookings = [
        { id: 1, service: "Plumbing", date: "2025-08-15" },
        { id: 2, service: "Electrical", date: "2025-08-14" },
        { id: 3, service: "Cleaning", date: "2025-08-13" },
        { id: 4, service: "Painting", date: "2025-08-12" },
        { id: 5, service: "Carpentry", date: "2025-08-11" },
      ];

      // Simulate API response
      setUserStats(dummyStats);
      setRecentBookings(dummyBookings);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Header/>
      <Info userStats={userStats} isLoading={isLoading} />
      <Data 
        recentBookings={recentBookings} 
        userStats={userStats}
        isLoading={isLoading} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  }
});
