import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import GroupedJobBox from '../../../../../components/Jobs/GroupedJobBox';
import JobBox from '../../../../../components/Jobs/JobBox';
import ServiceDetail from '../../../../../components/Jobs/ServiceDetail';
import AppHeader from '../../../../../components/common/AppHeader';
import CustomAlert from '../../../../../components/common/CustomAlert';
import Text from '../../../../../components/ui/Text';
import { useBookings } from '../../../../../context/bookingsContext';
import api from '../../../../api/api';

const formatAmount = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace('₹', '').replace(',', '')) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

export default function Index() {
  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
  const [activeTab, setActiveTab] = useState('Available');
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceModalMode, setServiceModalMode] = useState('Available'); // Add separate state for modal mode
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recent');
  const [acceptingJob, setAcceptingJob] = useState(false); // Add loading state for job acceptance

  const filters = ['All', 'High Pay', 'Nearby', 'Urgent', 'Regular Customer'];
  const sortOptions = ['Recent', 'Distance', 'Payment', 'Rating'];


  const [available, setAvailable] = useState([]);
  const [tabSwitchAnimation] = useState(new Animated.Value(1));

  // Use bookings context for in-progress and completed jobs
  const {
    inProgressBookings,
    completedBookings,
    refreshing: contextRefreshing,
    refreshAllBookings,
    addToInProgress,
    moveToCompleted,
    updateInProgressBooking,
    removeInProgressBooking
  } = useBookings();

  // Custom Alert Modal State
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    buttons: [],
    showCancel: false,
    jobDetails: null,
    processing: false
  });

  // Custom Alert Functions
  const showCustomAlert = (config) => {
    setAlertConfig(config);
    setCustomAlertVisible(true);
  };

  const hideCustomAlert = () => {
    setCustomAlertVisible(false);
  };


  // Refresh available jobs (local state only)
  const refreshAvailableJobs = async () => {
    try {
      const { data, errors } = await api.post('api/v1/getJobsAvailable');
      if (errors) throw errors;
      setAvailable(data?.data || []);
    } catch (error) {
    }
  };

  // Combined refresh function
  const refreshAllJobs = async () => {
    await Promise.all([refreshAvailableJobs(), refreshAllBookings()]);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        await refreshAllJobs();
      } catch (error) {
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, [])






  const switchTabWithAnimation = (newTab) => {
    Animated.sequence([
      Animated.timing(tabSwitchAnimation, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(tabSwitchAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveTab(newTab);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllJobs();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const openService = (item, modeOverride) => {
    
    setSelectedService(item);
    setServiceModalMode(modeOverride || activeTab); // Set modal mode separately
    if (modeOverride && modeOverride !== activeTab) {
      setActiveTab(modeOverride); // Only change tab if it's different
    }
    setServiceModalVisible(true);
    
  };

  // Group jobs by customer function (using userId and cartUuid)
  const groupJobsByCustomer = (jobs) => {
    const grouped = {};

    jobs.forEach(job => {
      // Create a unique key using userId and cartUuid
      const userId = job.userId || job.customerId || job.customer_id;
      const cartUuid = job.cartUuid || job.cart_uuid || job.cartId || 'no-cart';

      // If no cartUuid, treat as individual job (don't group)
      const groupKey = cartUuid !== 'no-cart' ? `${userId}-${cartUuid}` : job._id || job.id;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          customerId: userId,
          customerName: job.customerName || job.name || 'Customer',
          customerPhone: job.customerPhone || job.phone || '',
          address: job.address || job.customerAddress || job.location,
          cartUuid: cartUuid,
          timeSlot: job.timeSlot || job.time_slot || job.dateTime || null, // Add timeSlot from job
          jobs: [],
          totalPayment: 0,
          createdAt: job.createdAt || job.jobPostedTime || job.date,
          urgency: job.urgency || 'Normal',
          _id: groupKey, // Add unique ID for grouped jobs
          isGrouped: cartUuid !== 'no-cart' // Flag to indicate if this is a grouped job
        };
      }

      // Add job to the group
      grouped[groupKey].jobs.push(job);

      // Calculate total payment
      const payment = parseInt(job.payment?.replace('₹', '').replace(',', '') || job.amount || 0);
      grouped[groupKey].totalPayment += payment;

      // Update urgency if any job is urgent
      if (job.urgency === 'High' || job.urgent) {
        grouped[groupKey].urgency = 'High';
      }

      // Keep the earliest created date
      if (new Date(job.createdAt || job.jobPostedTime || job.date) < new Date(grouped[groupKey].createdAt)) {
        grouped[groupKey].createdAt = job.createdAt || job.jobPostedTime || job.date;
      }

      // Update timeSlot if current job has one and group doesn't have it yet
      if ((job.timeSlot || job.time_slot || job.dateTime) && !grouped[groupKey].timeSlot) {
        grouped[groupKey].timeSlot = job.timeSlot || job.time_slot || job.dateTime;
      }
    });

    return Object.values(grouped);
  };

  const onEnterOtp = (item) => {
    
    // If user is in Available section and clicks OTP, move them to Pending
    if (activeTab === 'Available') {
      // Move job from Available to Pending
      // setAvailable(prev => prev.filter(i => i._id !== item._id));
      // setPending(prev => [{ ...item, status: 'Accepted', startTime: new Date().toLocaleTimeString() }, ...prev]);

      // Switch to Pending tab and open service detail
      setTimeout(() => {
        switchTabWithAnimation('Pending');
        setTimeout(() => {
          openService({ ...item, status: 'Accepted' }, 'Pending');
        }, 200);
      }, 300);
    } else {
      // Normal OTP flow for Pending items
      openService(item, 'Pending');
    }
  };

  const handleAccept = (svc) => {
    
    // Check if this is a grouped job (has jobs array)
    const isGroupedJob = svc.jobs && Array.isArray(svc.jobs);
    const jobCount = isGroupedJob ? svc.jobs.length : 1;
    const totalAmount = isGroupedJob ? svc.totalPayment : parseInt(svc.payment?.replace('₹', '').replace(',', '') || 0);
    
    showCustomAlert({
      title: isGroupedJob ? 'Accept All Jobs' : 'Accept Job',
      message: isGroupedJob 
        ? `Are you sure you want to accept all ${jobCount} jobs from ${svc.customerName}?\n\nTotal Amount: ${formatAmount(totalAmount)}`
        : 'Are you sure you want to accept this job?',
      type: 'warning',
      showCancel: true,
      jobDetails: svc,
      buttons: [
        {
          text: isGroupedJob ? 'Accept All Jobs' : 'Accept Job',
          onPress: async () => {
            try {
              // Set loading state immediately
              setAcceptingJob(true);
              hideCustomAlert();

              let results;
              if (isGroupedJob) {
                // Accept all jobs in the group
                const acceptPromises = svc.jobs.map(job => 
                  api.post('api/v1/acceptJob', job)
                );
                results = await Promise.allSettled(acceptPromises);
              } else {
                // Accept single job
                const { data, error } = await api.post('api/v1/acceptJob', svc);
                results = [{ status: error ? 'rejected' : 'fulfilled', value: data, reason: error }];
              }

              const successful = results.filter(result => 
                result.status === 'fulfilled' && result.value?.data?.success
              ).length;
              
              const failed = jobCount - successful;

              if (successful > 0) {
                // Success - refresh all jobs and switch to pending tab
                await refreshAllJobs();
                setServiceModalVisible(false);
                
                let message = isGroupedJob 
                  ? `Successfully accepted ${successful} job${successful > 1 ? 's' : ''} from ${svc.customerName}.`
                  : `You have successfully accepted the job for ${svc.customerName}.`;
                
                if (failed > 0) {
                  message += `\n\n${failed} job${failed > 1 ? 's' : ''} failed to accept.`;
                }
                
                setTimeout(() => {
                  switchTabWithAnimation('Pending');
                  showCustomAlert({
                    title: successful === jobCount ? (isGroupedJob ? 'All Jobs Accepted!' : 'Job Accepted!') : 'Jobs Partially Accepted',
                    message: message + '\n\nYou are now in the Pending section. Use the OTP button to start working!',
                    type: successful === jobCount ? 'success' : 'warning',
                    showCancel: false,
                    jobDetails: svc,
                    buttons: [
                      {
                        text: 'Got it!',
                        onPress: hideCustomAlert
                      }
                    ]
                  });
                }, 300);
              } else {
                // All failed
                showCustomAlert({
                  title: 'Failed to Accept Jobs',
                  message: 'Unable to accept any jobs at this time. Please try again.',
                  type: 'error',
                  showCancel: false,
                  buttons: [
                    {
                      text: 'OK',
                      onPress: hideCustomAlert
                    }
                  ]
                });
              }
            } catch (err) {
              showCustomAlert({
                title: 'Network Error',
                message: 'Could not connect to server. Please check your internet connection and try again.',
                type: 'error',
                showCancel: false,
                buttons: [
                  {
                    text: 'OK',
                    onPress: hideCustomAlert
                  }
                ]
              });
            } finally {
              // Clear loading state
              setAcceptingJob(false);
            }
          }
        }
      ]
    });
  };

  const handleComplete = async (svc) => {
    
    try {
      // For grouped jobs, process them sequentially to prevent race conditions
      if (svc.jobs && svc.jobs.length > 1) {
        
        // Show loading overlay for grouped jobs processing
        setAcceptingJob(true);
        
        let successCount = 0;
        let failCount = 0;
        
        // Process jobs one by one with delays
        for (let i = 0; i < svc.jobs.length; i++) {
          const job = svc.jobs[i];
          try {
            const requestPayload = {
              _id: job._id || job.id,
              otp: svc.otp // Assuming OTP is passed in service object
            };
            
            const response = await api.post('api/v1/verifyJobComplete', requestPayload);
            
            if (response?.data?.success) {
              successCount++;
            } else {
              failCount++;
            }
            
            // Add delay between requests to prevent race conditions (except for last item)
            if (i < svc.jobs.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay
            }
          } catch (error) {
            failCount++;
            console.error(`Failed to complete job ${i + 1}:`, error);
            
            // Continue with next job even if one fails
            if (i < svc.jobs.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        }
        
        setAcceptingJob(false); // Hide loading overlay
      }

      // Refresh all jobs to get updated status from server
      await refreshAllJobs();
      setServiceModalVisible(false);

      // Automatically switch to Completed tab to show the completed job
      setTimeout(() => {
        switchTabWithAnimation('Completed');
        showCustomAlert({
          title: 'Job Completed!',
          message: `Great work! Job completed for ${svc.customerName}.\n\nPayment will be processed and added to your earnings.`,
          type: 'success',
          showCancel: false,
          jobDetails: svc,
          buttons: [
            {
              text: 'Awesome!',
              onPress: hideCustomAlert
            }
          ]
        });
      }, 300);
    } catch (error) {
      console.error('Error in handleComplete:', error);
      setAcceptingJob(false); // Make sure to hide loading overlay on error
      // Still show success message even if refresh fails
      setServiceModalVisible(false);
      setTimeout(() => {
        switchTabWithAnimation('Completed');
        showCustomAlert({
          title: 'Job Completed!',
          message: `Great work! Job completed for ${svc.customerName}.\n\nPayment will be processed and added to your earnings.`,
          type: 'success',
          showCancel: false,
          jobDetails: svc,
          buttons: [
            {
              text: 'Awesome!',
              onPress: hideCustomAlert
            }
          ]
        });
      }, 300);
    }
  };

  const handleBack = () => router.back();

  const getTabCount = (tab) => {
    switch (tab) {
      case 'Available': return available.length;
      case 'Pending': return inProgressBookings.length;
      case 'Completed': return completedBookings.length;
      default: return 0;
    }
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

  const filterJobs = (jobs) => {
    let filtered = jobs;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(job => {
        if (activeTab === 'Available' && job.jobs) {
          // For grouped jobs (Available tab)
          return job.customerName.toLowerCase().includes(search.toLowerCase()) ||
                 job.address.toLowerCase().includes(search.toLowerCase()) ||
                 job.jobs.some(j => j.serviceName?.toLowerCase().includes(search.toLowerCase()));
        } else {
          // For individual jobs (Pending/Completed tabs)
          return job.customerName?.toLowerCase().includes(search.toLowerCase()) ||
                 job.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
                 job.address?.toLowerCase().includes(search.toLowerCase());
        }
      });
    }

    // Apply category filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(job => {
        switch (activeFilter) {
          case 'High Pay': 
            if (activeTab === 'Available' && job.totalPayment) {
              return job.totalPayment >= 1000;
            } else {
              return parseInt(job.payment?.replace('₹', '').replace(',', '') || 0) >= 1000;
            }
          case 'Nearby': return parseFloat(job.distance || 0) <= 2.0;
          case 'Urgent': return job.urgency === 'High' || job.urgent;
          case 'Regular Customer': return job.customerRating >= 4.8;
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Payment': 
          if (activeTab === 'Available') {
            return (b.totalPayment || 0) - (a.totalPayment || 0);
          } else {
            return parseInt(b.payment?.replace('₹', '').replace(',', '') || 0) - parseInt(a.payment?.replace('₹', '').replace(',', '') || 0);
          }
        case 'Rating': return (b.customerRating || 0) - (a.customerRating || 0);
        case 'Recent':
        default: 
          // Sort by most recent first (latest at top)
          const timestampA = parseRelativeTime(a.createdAt || a.jobPostedTime || a.updatedAt);
          const timestampB = parseRelativeTime(b.createdAt || b.jobPostedTime || b.updatedAt);
          return timestampB - timestampA; // Most recent first
      }
    });

    return filtered;
  };

  const getCurrentJobs = () => {
    switch (activeTab) {
      case 'Available': 
        const groupedAvailable = groupJobsByCustomer(available);
        return filterJobs(groupedAvailable);
      case 'Pending': 
        const groupedPending = groupJobsByCustomer(inProgressBookings);
        return filterJobs(groupedPending);
      case 'Completed': return filterJobs(completedBookings);
      default: return [];
    }
  };



  return (
    <View style={styles.container}>
      <AppHeader
        title="Jobs Dashboard"
        subtitle="Manage and track your service jobs"
        showBack
        onBack={handleBack}
        showNotification
        notificationCount={3}
        onNotification={() => router.push('/(app)/protected/Notifications')}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || contextRefreshing} onRefresh={onRefresh} colors={['#4ab9cf']} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.statCard, activeTab === 'Available' && styles.statCardActive]}
              onPress={() => switchTabWithAnimation('Available')}
            >
              <View style={[styles.statIcon, activeTab === 'Available' && styles.statIconActive]}>
                <Ionicons name="briefcase" size={20} color={activeTab === 'Available' ? "#fff" : "#4ab9cf"} />
              </View>
              <Text style={[styles.statNumber, activeTab === 'Available' && styles.statNumberActive]}>{groupJobsByCustomer(available).length}</Text>
              <Text style={[styles.statLabel, activeTab === 'Available' && styles.statLabelActive]}>Available</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, activeTab === 'Pending' && styles.statCardActive]}
              onPress={() => switchTabWithAnimation('Pending')}
            >
              <View style={[styles.statIcon, activeTab === 'Pending' && styles.statIconActive]}>
                <Ionicons name="time" size={20} color={activeTab === 'Pending' ? "#fff" : "#f39c12"} />
              </View>
              <Text style={[styles.statNumber, activeTab === 'Pending' && styles.statNumberActive]}>{groupJobsByCustomer(inProgressBookings).length}</Text>
              <Text style={[styles.statLabel, activeTab === 'Pending' && styles.statLabelActive]}>In Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, activeTab === 'Completed' && styles.statCardActive]}
              onPress={() => switchTabWithAnimation('Completed')}
            >
              <View style={[styles.statIcon, activeTab === 'Completed' && styles.statIconActive]}>
                <Ionicons name="checkmark-circle" size={20} color={activeTab === 'Completed' ? "#fff" : "#27ae60"} />
              </View>
              <Text style={[styles.statNumber, activeTab === 'Completed' && styles.statNumberActive]}>{completedBookings.length}</Text>
              <Text style={[styles.statLabel, activeTab === 'Completed' && styles.statLabelActive]}>Completed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search and Filter Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#7f8c8d"
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <MaterialIcons name="tune" size={20} color="#4ab9cf" />
          </TouchableOpacity>
        </View>

        {/* Jobs List */}
        <Animated.View style={[styles.jobsContainer, { transform: [{ scale: tabSwitchAnimation }] }]}>
          {initialLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#4ab9cf" size="large" />
              <Text style={styles.loadingText}>Loading jobs...</Text>
            </View>
          ) : getCurrentJobs().length > 0 ? (
            getCurrentJobs().map((item, index, arr) => (
              <View key={activeTab === 'Available' || activeTab === 'Pending' ? item._id || item.customerId : item._id} style={[styles.jobCardWrapper, index === (arr.length - 1) ? styles.lastJobCard : null]}>
                {activeTab === 'Available' || activeTab === 'Pending' ? (
                  // Render grouped customer jobs for both Available and Pending
                  <GroupedJobBox
                    customerGroup={item}
                    onAccept={activeTab === 'Available' ? () => handleAccept(item) : () => onEnterOtp(item)}
                    onPress={() => openService(item, activeTab)}
                    isPending={activeTab === 'Pending'}
                  />
                ) : (
                  // Render individual jobs for completed only
                  <JobBox
                    data={item}
                    isPending={false}
                    isCompleted={activeTab === 'Completed'}
                    onEnterOtp={onEnterOtp}
                    onPress={() => openService(item, activeTab)}
                  />
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name={
                  activeTab === 'Available' ? 'briefcase-outline' :
                    activeTab === 'Pending' ? 'time-outline' :
                      'checkmark-circle-outline'
                }
                size={60}
                color="#bdc3c7"
              />
              <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} jobs</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'Available' ? 'New jobs will appear here when customers book services' :
                  activeTab === 'Pending' ? 'Jobs you accept will appear here. Click OTP to start working!' :
                    'Completed jobs will be listed here with payment details'}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Filter by Category</Text>
            <View style={styles.filterOptions}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterOption, activeFilter === filter && styles.filterOptionActive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterOptionText, activeFilter === filter && styles.filterOptionTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Sort by</Text>
            <View style={styles.sortOptions}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.sortOption, sortBy === option && styles.sortOptionActive]}
                  onPress={() => setSortBy(option)}
                >
                  <Text style={[styles.sortOptionText, sortBy === option && styles.sortOptionTextActive]}>
                    {option}
                  </Text>
                  {sortBy === option && <Ionicons name="checkmark" size={20} color="#4ab9cf" />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ServiceDetail
        visible={serviceModalVisible}
        onClose={() => setServiceModalVisible(false)}
        service={selectedService}
        mode={serviceModalMode}
        onAccept={handleAccept}
        onComplete={handleComplete}
      />

      {/* Custom Alert */}
      <CustomAlert
        visible={customAlertVisible}
        onClose={hideCustomAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        showCancel={alertConfig.showCancel}
        jobDetails={alertConfig.jobDetails}
        processing={alertConfig.processing}
      />

      {/* Loading Overlay */}
      <Modal
        visible={acceptingJob}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ab9cf" />
            <Text style={styles.loadingTitle}>
              {selectedService?.jobs?.length > 1 ? 'Processing Multiple Jobs' : 'Processing Job'}
            </Text>
            <Text style={styles.loadingMessage}>
              {selectedService?.jobs?.length > 1 
                ? `Please wait while we process all ${selectedService.jobs.length} jobs sequentially...` 
                : 'Please wait while we process your request...'}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4ab9cf',
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8F4F8',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  statCardActive: {
    backgroundColor: '#4ab9cf',
    elevation: 6,
    shadowOpacity: 0.2,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statNumberActive: {
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  statLabelActive: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  filterButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  jobCardWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  lastJobCard: {
    marginBottom: 86,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    marginTop: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  filterOptionActive: {
    backgroundColor: '#4ab9cf',
    borderColor: '#4ab9cf',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  sortOptions: {
    marginBottom: 20,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 8,
  },
  sortOptionActive: {
    backgroundColor: '#e8f4f8',
    borderWidth: 1,
    borderColor: '#4ab9cf',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#4ab9cf',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#4ab9cf',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
});
