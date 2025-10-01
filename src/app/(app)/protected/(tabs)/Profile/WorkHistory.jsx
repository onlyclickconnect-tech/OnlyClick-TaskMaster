import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, RefreshControl, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../../../../components/ui/Text';
import AppHeader from '../../../../../components/common/AppHeader';
import { useBookings } from '../../../../../context/bookingsContext';

const STATUSBAR_PADDING = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12;

export default function WorkHistory() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  
  // Use BookingsContext for data
  const {
    inProgressBookings,
    completedBookings,
    loading,
    refreshAllBookings
  } = useBookings();

  // Only refresh on first load, not every focus
  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedRef.current) {
        setInitialLoading(true);
        refreshAllBookings().finally(() => {
          setInitialLoading(false);
          hasLoadedRef.current = true;
        });
      }
    }, [])
  );

  // Manual refresh function for pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllBookings();
    } catch (error) {
      console.error('Error refreshing work history:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Combine both in-progress and completed jobs for work history
  const getAllJobs = () => {
    const allJobs = [...inProgressBookings, ...completedBookings];
    
    // Sort by most recent first (latest at top)
    return allJobs.sort((a, b) => {
      // You can customize this sorting logic based on your date field
      const dateA = new Date(a.createdAt || a.jobPostedTime || 0);
      const dateB = new Date(b.createdAt || b.jobPostedTime || 0);
      return dateB - dateA;
    });
  };

  // Helper function to parse relative time strings and convert to timestamp
  const parseRelativeTime = (timeString) => {
    if (!timeString) return 0;
    
    // Try to parse as regular date first
    const regularDate = new Date(timeString);
    if (!isNaN(regularDate.getTime())) {
      return regularDate.getTime();
    }
    
    // Parse relative time strings like "8 mins ago", "1 days ago", "2 hours ago"
    const now = Date.now();
    const timeStr = timeString.toLowerCase();
    
    if (timeStr.includes('min')) {
      const mins = parseInt(timeStr.match(/\d+/)?.[0] || 0);
      return now - (mins * 60 * 1000);
    } else if (timeStr.includes('hour')) {
      const hours = parseInt(timeStr.match(/\d+/)?.[0] || 0);
      return now - (hours * 60 * 60 * 1000);
    } else if (timeStr.includes('day')) {
      const days = parseInt(timeStr.match(/\d+/)?.[0] || 0);
      return now - (days * 24 * 60 * 60 * 1000);
    } else if (timeStr.includes('week')) {
      const weeks = parseInt(timeStr.match(/\d+/)?.[0] || 0);
      return now - (weeks * 7 * 24 * 60 * 60 * 1000);
    } else if (timeStr.includes('month')) {
      const months = parseInt(timeStr.match(/\d+/)?.[0] || 0);
      return now - (months * 30 * 24 * 60 * 60 * 1000);
    }
    
    return 0;
  };

  // Filter jobs based on active filter
  const getFilteredJobs = () => {
    let filteredJobs = [];
    
    switch (activeFilter) {
      case 'Completed':
        filteredJobs = [...completedBookings];
        break;
      case 'Pending':
        filteredJobs = [...inProgressBookings];
        break;
      case 'All':
      default:
        filteredJobs = [...inProgressBookings, ...completedBookings];
        break;
    }
    
    // Apply the same sorting to all filtered jobs (most recent first)
    return filteredJobs.sort((a, b) => {
      const timestampA = parseRelativeTime(a.createdAt || a.jobPostedTime || a.updatedAt);
      const timestampB = parseRelativeTime(b.createdAt || b.jobPostedTime || b.updatedAt);
      return timestampB - timestampA; // Most recent first
    });
  };

  const renderItem = ({ item, index }) => {
    const isRecent = index === 0;
    const isCompleted = completedBookings.some(job => job._id === item._id);
    const statusColor = isCompleted ? '#4CAF50' : '#f1c40f';
    const statusText = isCompleted ? 'Completed' : 'In Progress';

    return (
      <View style={styles.row}>
        <View style={styles.leftCol}>
          <View style={[styles.dateBadge, isRecent && styles.dateBadgeRecent]}>
            <Text style={[styles.dateText, isRecent && styles.dateTextRecent]}>{item.jobPostedTime || 'N/A'}</Text>
          </View>
          <View style={styles.line} />
        </View>

        <View style={[styles.card, isRecent && styles.cardRecent]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.serviceName}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>

          <View style={styles.cardDetails}>
            <Text style={styles.cardMeta}>Request ID: #{item._id || 'N/A'}</Text>
            {item.customerName && <Text style={styles.cardMeta}>Customer: {item.customerName}</Text>}
            {item.address && <Text style={styles.cardMeta}>Location: {item.address}</Text>}
            {item.payment && <Text style={styles.cardMeta}>Payment: {item.payment}</Text>}
            {item.serviceType && <Text style={styles.cardMeta}>Category: {item.serviceType}</Text>}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Work History" showBack onBack={() => router.back()} />

      <View style={styles.content}>
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {['All', 'Pending', 'Completed'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[styles.filterTabText, activeFilter === filter && styles.filterTabTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {(loading || initialLoading) ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#4ab9cf" size="large" />
            <Text style={styles.loadingText}>Loading work history...</Text>
          </View>
        ) : getFilteredJobs().length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={46} color="#ccc" />
            <Text style={styles.emptyText}>No {activeFilter.toLowerCase()} jobs yet</Text>
          </View>
        ) : (
          <FlatList 
            data={getFilteredJobs()} 
            keyExtractor={item => String(item._id)} 
            renderItem={renderItem} 
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#4ab9cf']}
                tintColor="#4ab9cf"
              />
            }
            ListHeaderComponent={() => (
              <View>
                <Text style={{ marginBottom: 10, color: '#666' }}>
                  Showing {getFilteredJobs().length} {activeFilter.toLowerCase()} jobs
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6fbfb', paddingBottom: 190 },
  headerWrap: { backgroundColor: '#4ab9cf', paddingTop: STATUSBAR_PADDING, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { padding: 20 },
  loading: { paddingTop: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 16, fontWeight: '500' },
  empty: { alignItems: 'center', marginTop: 48 },
  emptyText: { marginTop: 12, color: '#999', fontSize: 16, fontWeight: '600' },

  row: { flexDirection: 'row', marginBottom: 16 },
  leftCol: { width: 110, alignItems: 'center' },
  dateBadge: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e6f6f7' },
  dateBadgeRecent: { backgroundColor: '#4ab9cf' },
  dateText: { fontSize: 12, color: '#177a81', fontWeight: '700' },
  dateTextRecent: { color: '#fff' },
  line: { width: 2, backgroundColor: '#e6f6f7', flex: 1, marginTop: 8 },

  card: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  cardRecent: { borderWidth: 1, borderColor: '#4ab9cf' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#333', marginRight: 10 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, zIndex: 999 },
  statusText: { color: '#fff', fontWeight: '700', textTransform: 'capitalize' },
  cardMeta: { marginTop: 8, color: '#666' },
  cardDetails: { marginTop: 12 },

  filterTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#4ab9cf',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
});
