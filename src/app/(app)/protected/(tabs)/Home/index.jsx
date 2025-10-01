import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import Data from "../../../../../components/Home/Data";
import Header from "../../../../../components/Home/Header";
import Info from "../../../../../components/Home/Info";
import { useAuth } from "../../../../../context/AuthProvider";
import { useBookings } from "../../../../../context/bookingsContext";
import { useRouter } from "expo-router";
import api from "../../../../api/api";
export default function Home() {
  const router = useRouter()
  const { user, isLoggedIn, userData, authToken } = useAuth();
  
  // Use bookings context for real data
  const { 
    inProgressBookings, 
    completedBookings, 
    refreshAllBookings, 
    loading: bookingsLoading 
  } = useBookings();

  const [availableBookings, setAvailableBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create userStats from bookings context
  const userStats = {
    totalBookings: (inProgressBookings?.length || 0) + (completedBookings?.length || 0),
    completedBookings: completedBookings || [],
    inProgressBookings: inProgressBookings || [],
    availableBookings: availableBookings || [],
    pendingBookings: inProgressBookings || [], // alias for consistency
  };


  useEffect(() => {
    const getdata = async () => {
      if(!userData || !(userData.name) || !(userData.ph_no)){
        router.replace('/auth/profile-setup');
      } 
    }
    getdata()
  
  }, [userData])


  // Fetch available bookings (not in bookings context)
  const fetchAvailableBookings = async () => {
    try {
      const { data, errors } = await api.post('api/v1/getJobsAvailable');
      if (errors) throw errors;
      const available = data?.data || [];
      setAvailableBookings(available);
      return available;
    } catch (error) {
      console.error('Error fetching available bookings:', error);
      return [];
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch available bookings
      await fetchAvailableBookings();
      
      // Set recent bookings from completed bookings (last 5)
      const recent = (completedBookings || [])
        .slice(0, 5)
        .map(booking => ({
          id: booking._id || booking.id,
          service: booking.serviceName || booking.service,
          date: booking.completedAt || booking.updatedAt || booking.createdAt
        }));
      
      setRecentBookings(recent);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshAllBookings(), // Refresh in-progress and completed bookings
        fetchAvailableBookings() // Refresh available bookings
      ]);
      await fetchDashboardData(); // Update recent bookings
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [completedBookings, inProgressBookings, availableBookings]); // Re-run when bookings data changes

  // Update loading state based on bookings loading
  useEffect(() => {
    setIsLoading(bookingsLoading);
  }, [bookingsLoading]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Header />
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
