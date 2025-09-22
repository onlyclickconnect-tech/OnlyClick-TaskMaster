import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import JobBox from '../../../../../components/Jobs/JobBox';
import ServiceDetail from '../../../../../components/Jobs/ServiceDetail';
import AppHeader from '../../../../../components/common/AppHeader';
import CustomAlert from '../../../../../components/common/CustomAlert';
import api from '../../../../api/api';

export default function Index() {
  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
  const [activeTab, setActiveTab] = useState('Available');
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceModalMode, setServiceModalMode] = useState('Available'); // Add separate state for modal mode
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recent');

  const filters = ['All', 'High Pay', 'Nearby', 'Urgent', 'Regular Customer'];
  const sortOptions = ['Recent', 'Distance', 'Payment', 'Rating'];

  // const initial = {
  //   Available: [
  //     { 
  //       _id: 'a1', 
  //       customerName: 'Rajesh Kumar', 
  //       serviceName: 'AC Repair & Service', 
  //       address: '221B Baker Street, Bandra West', 
  //       image: 'https://picsum.photos/300',
  //       distance: '2.3 km',
  //       estimatedTime: '45 mins',
  //       payment: '₹850',
  //       urgency: 'Medium',
  //       customerRating: 4.8,
  //       jobPostedTime: '5 mins ago',
  //       description: 'AC not cooling properly, needs immediate attention',
  //       serviceType: 'Emergency',
  //       customerPhone: '+91 98765 43210'
  //     },
  //     { 
  //       _id: 'a2', 
  //       customerName: 'Priya Sharma', 
  //       serviceName: 'Plumbing Service', 
  //       address: '12 Park Avenue, Andheri East', 
  //       image: 'https://picsum.photos/301',
  //       distance: '1.8 km',
  //       estimatedTime: '30 mins',
  //       payment: '₹650',
  //       urgency: 'High',
  //       customerRating: 4.9,
  //       jobPostedTime: '12 mins ago',
  //       description: 'Kitchen sink blockage and water leakage',
  //       serviceType: 'Regular',
  //       customerPhone: '+91 87654 32109'
  //     },
  //     { 
  //       _id: 'a3', 
  //       customerName: 'Amit Verma', 
  //       serviceName: 'Electrical Work', 
  //       address: '45 Marine Drive, Mumbai Central', 
  //       image: 'https://picsum.photos/303',
  //       distance: '3.5 km',
  //       estimatedTime: '60 mins',
  //       payment: '₹1200',
  //       urgency: 'Low',
  //       customerRating: 4.6,
  //       jobPostedTime: '25 mins ago',
  //       description: 'Install new electrical fittings and fix wiring issues',
  //       serviceType: 'Scheduled',
  //       customerPhone: '+91 76543 21098'
  //     },
  //   ],
  //   Pending: [
  //     { 
  //       _id: 'p1', 
  //       customerName: 'Sneha Reddy', 
  //       serviceName: 'Home Cleaning', 
  //       address: '5 Downing Street, Powai', 
  //       phone: '+91 98765 43210', 
  //       image: 'https://picsum.photos/302',
  //       distance: '2.1 km',
  //       estimatedTime: '90 mins',
  //       payment: '₹400',
  //       urgency: 'Medium',
  //       customerRating: 4.7,
  //       jobPostedTime: '1 hour ago',
  //       description: 'Deep cleaning of 2BHK apartment',
  //       serviceType: 'Regular',
  //       status: 'In Progress',
  //       startTime: '10:30 AM',
  //       otp: '4528'
  //     },
  //     { 
  //       _id: 'p2', 
  //       customerName: 'Rahul Gupta', 
  //       serviceName: 'Appliance Repair', 
  //       address: '78 Linking Road, Bandra', 
  //       phone: '+91 87654 32109', 
  //       image: 'https://picsum.photos/305',
  //       distance: '1.5 km',
  //       estimatedTime: '45 mins',
  //       payment: '₹750',
  //       urgency: 'High',
  //       customerRating: 4.5,
  //       jobPostedTime: '2 hours ago',
  //       description: 'Washing machine not working properly',
  //       serviceType: 'Emergency',
  //       status: 'En Route',
  //       startTime: '11:00 AM',
  //       otp: '7329'
  //     },
  //   ],
  //   Completed: [
  //     { 
  //       _id: 'c1', 
  //       customerName: 'Kavya Patel', 
  //       serviceName: 'Carpentry Work', 
  //       address: '400 Elm Street, Juhu', 
  //       image: 'https://picsum.photos/304', 
  //       amountReceived: '₹1,200', 
  //       paymentMethod: 'Digital',
  //       distance: '4.2 km',
  //       estimatedTime: '120 mins',
  //       payment: '₹1200',
  //       urgency: 'Low',
  //       customerRating: 4.9,
  //       jobPostedTime: '1 day ago',
  //       description: 'Custom furniture installation and repair',
  //       serviceType: 'Scheduled',
  //       completedTime: '2:30 PM',
  //       actualDuration: '110 mins',
  //       customerFeedback: 'Excellent work! Very professional and timely.',
  //       tipReceived: '₹100'
  //     },
  //     { 
  //       _id: 'c2', 
  //       customerName: 'Vikram Singh', 
  //       serviceName: 'Painting Service', 
  //       address: '33 Hill Road, Bandra', 
  //       image: 'https://picsum.photos/306', 
  //       amountReceived: '₹2,500', 
  //       paymentMethod: 'Cash',
  //       distance: '3.1 km',
  //       estimatedTime: '180 mins',
  //       payment: '₹2500',
  //       urgency: 'Medium',
  //       customerRating: 4.8,
  //       jobPostedTime: '2 days ago',
  //       description: 'Interior wall painting for bedroom',
  //       serviceType: 'Regular',
  //       completedTime: '4:45 PM',
  //       actualDuration: '175 mins',
  //       customerFeedback: 'Great job! Clean work and on time.',
  //       tipReceived: '₹200'
  //     },
  //   ],
  // };

  const [available, setAvailable] = useState([]);
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [tabSwitchAnimation] = useState(new Animated.Value(1));

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


  // Refresh all jobs function
  const refreshAllJobs = async () => {
    try {
      const getPendigs = async () => {
        const { data, errors } = await api.post('api/v1/getJobsAvailable');
        if (errors) throw errors
        setAvailable(data.data)
      }
      const getInProgress = async () => {
        const { data, errors } = await api.post('api/v1/getJobsInProgress');
        if (errors) throw errors
        setPending(data.data)
      }
      const getCompleted = async () => {
        const { data, errors } = await api.post('api/v1/getJobsCompleted');
        if (errors) throw errors
        setCompleted(data.data)
      }

      await Promise.all([getPendigs(), getInProgress(), getCompleted()]);
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    }
  };

  useEffect(() => {
    refreshAllJobs();
  }, [refreshing])






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
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const openService = (item, modeOverride) => {
    console.log('=== OPEN SERVICE CALLED ===');
    console.log('item:', item);
    console.log('modeOverride:', modeOverride);
    console.log('activeTab before override:', activeTab);
    
    setSelectedService(item);
    setServiceModalMode(modeOverride || activeTab); // Set modal mode separately
    if (modeOverride && modeOverride !== activeTab) {
      setActiveTab(modeOverride); // Only change tab if it's different
    }
    setServiceModalVisible(true);
    
    console.log('Modal should open with mode:', modeOverride || activeTab);
  };

  const onEnterOtp = (item) => {
    console.log('=== ON ENTER OTP CALLED ===');
    console.log('activeTab:', activeTab);
    console.log('item:', item);
    
    // If user is in Available section and clicks OTP, move them to Pending
    if (activeTab === 'Available') {
      console.log('User is in Available tab, switching to Pending');
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
      console.log('User is in Pending tab, opening service modal');
      // Normal OTP flow for Pending items
      openService(item, 'Pending');
    }
  };

  const handleAccept = (svc) => {
    console.log("=== HANDLE ACCEPT CALLED ===");
    console.log("handle accept here");
    console.log("svc", svc);
    
    showCustomAlert({
      title: 'Accept Job',
      message: 'Are you sure you want to accept this job?',
      type: 'warning',
      showCancel: true,
      jobDetails: svc,
      buttons: [
        {
          text: 'Accept Job',
          onPress: async () => {
            try {
              // Show loading state
              hideCustomAlert();
              showCustomAlert({
                title: 'Processing...',
                message: 'Accepting job, please wait...',
                type: 'info',
                processing: true,
                showCancel: false,
                buttons: []
              });

              // Make API call to accept job
              const { data, error } = await api.post('api/v1/acceptJob', svc);
              
              hideCustomAlert();

              if (error) {
                // Show error alert
                showCustomAlert({
                  title: 'Error',
                  message: error.message || 'Failed to accept job. Please try again.',
                  type: 'error',
                  showCancel: false,
                  buttons: [
                    {
                      text: 'OK',
                      onPress: hideCustomAlert
                    }
                  ]
                });
                return;
              }

              if (data && data.success) {
                // Success - refresh all jobs and switch to pending tab
                await refreshAllJobs();
                setServiceModalVisible(false);
                
                // Automatically switch to Pending tab to show the accepted job
                setTimeout(() => {
                  switchTabWithAnimation('Pending');
                  showCustomAlert({
                    title: 'Job Accepted!',
                    message: `You have successfully accepted the job for ${svc.customerName}.\n\nYou are now in the Pending section. Use the OTP button to start the job.`,
                    type: 'success',
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
                // API returned success: false
                showCustomAlert({
                  title: 'Failed to Accept',
                  message: data?.message || 'Unable to accept job at this time. Please try again.',
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
              hideCustomAlert();
              console.error('Error accepting job:', err);
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
            }
          }
        }
      ]
    });
  };

  const handleComplete = async (svc) => {
    console.log('=== HANDLE COMPLETE CALLED ===');
    console.log('Completed service:', svc);
    
    try {
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
      console.error('Error refreshing jobs after completion:', error);
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
      case 'Pending': return pending.length;
      case 'Completed': return completed.length;
      default: return 0;
    }
  };

  const filterJobs = (jobs) => {
    let filtered = jobs;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(job =>
        job.customerName.toLowerCase().includes(search.toLowerCase()) ||
        job.serviceName.toLowerCase().includes(search.toLowerCase()) ||
        job.address.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(job => {
        switch (activeFilter) {
          case 'High Pay': return parseInt(job.payment.replace('₹', '').replace(',', '')) >= 1000;
          case 'Nearby': return parseFloat(job.distance) <= 2.0;
          case 'Urgent': return job.urgency === 'High';
          case 'Regular Customer': return job.customerRating >= 4.8;
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Distance': return parseFloat(a.distance) - parseFloat(b.distance);
        case 'Payment': return parseInt(b.payment.replace('₹', '').replace(',', '')) - parseInt(a.payment.replace('₹', '').replace(',', ''));
        case 'Rating': return b.customerRating - a.customerRating;
        default: return 0; // Recent - keep original order
      }
    });

    return filtered;
  };

  const getCurrentJobs = () => {
    switch (activeTab) {
      case 'Available': return filterJobs(available);
      case 'Pending': return filterJobs(pending);
      case 'Completed': return filterJobs(completed);
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4ab9cf']} />
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
              <Text style={[styles.statNumber, activeTab === 'Available' && styles.statNumberActive]}>{available.length}</Text>
              <Text style={[styles.statLabel, activeTab === 'Available' && styles.statLabelActive]}>Available</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, activeTab === 'Pending' && styles.statCardActive]}
              onPress={() => switchTabWithAnimation('Pending')}
            >
              <View style={[styles.statIcon, activeTab === 'Pending' && styles.statIconActive]}>
                <Ionicons name="time" size={20} color={activeTab === 'Pending' ? "#fff" : "#f39c12"} />
              </View>
              <Text style={[styles.statNumber, activeTab === 'Pending' && styles.statNumberActive]}>{pending.length}</Text>
              <Text style={[styles.statLabel, activeTab === 'Pending' && styles.statLabelActive]}>In Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statCard, activeTab === 'Completed' && styles.statCardActive]}
              onPress={() => switchTabWithAnimation('Completed')}
            >
              <View style={[styles.statIcon, activeTab === 'Completed' && styles.statIconActive]}>
                <Ionicons name="checkmark-circle" size={20} color={activeTab === 'Completed' ? "#fff" : "#27ae60"} />
              </View>
              <Text style={[styles.statNumber, activeTab === 'Completed' && styles.statNumberActive]}>{completed.length}</Text>
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
          {getCurrentJobs().length > 0 ? (
            getCurrentJobs().map((item, index, arr) => (
              <View key={item._id} style={[styles.jobCardWrapper, index === (arr.length - 1) ? styles.lastJobCard : null]}>
                <JobBox
                  data={item}
                  isPending={activeTab === 'Pending'}
                  isCompleted={activeTab === 'Completed'}
                  onEnterOtp={onEnterOtp}
                  onPress={() => openService(item, activeTab)}
                />
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
});
