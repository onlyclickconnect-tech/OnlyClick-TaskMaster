import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import serviceService from '../../services/serviceService';

const { width, height } = Dimensions.get('window');

const ServiceListModal = ({ visible, onClose, userCategory }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      // don't claim responder on start so ScrollView's touches work; only become responder on vertical drag that starts near top
      onStartShouldSetPanResponder: (e, g) => false,
      onMoveShouldSetPanResponder: (e, g) => {
        const dy = Math.abs(g.dy);
        const dx = Math.abs(g.dx);
        const startY = (e && e.nativeEvent && (e.nativeEvent.locationY ?? e.nativeEvent.pageY)) || 0;
        // activate only for mostly-vertical drags that started near the top (grabber area)
        return dy > 5 && dx < 20 && startY < 80;
      },
      onPanResponderMove: (e, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (e, g) => {
        if (g.dy > 120 || g.vy > 1.2) {
          Animated.timing(translateY, { toValue: 500, duration: 180, useNativeDriver: true }).start(() => {
            translateY.setValue(0);
            onClose && onClose();
          });
        } else {
          Animated.timing(translateY, { toValue: 0, duration: 160, useNativeDriver: true }).start();
        }
      }
    })
  ).current;

  useEffect(() => {
    if (visible && userCategory) {
      fetchServices();
    }
  }, [visible, userCategory]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      // Try to use the API first, fallback to dev mode automatically
      const response = await serviceService.getServicesByCategory(userCategory);
      
      if (response.success) {
        setServices(response.data.services);
        setSelectedCategory(response.data.category);
      } else {
        Alert.alert('Error', 'Failed to load services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    const category = userCategory;
    if (category === 'Painting') {
      return `₹${price}/sq ft`;
    }
    return `₹${price}`;
  };

  const renderServiceCard = (service) => (
    <View key={service.serviceId || service.id || service._id} style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceName}>{service.title || service.name}</Text>
        <Text style={styles.servicePrice}>{formatPrice(service.price ?? service.basePrice)}</Text>
      </View>

      <Text style={styles.serviceDescription}>{service.description}</Text>

      <View style={styles.serviceDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Time: {service.duration ?? service.timeEstimate}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="construct-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Includes: {Array.isArray(service.includes) ? service.includes.join(', ') : (service.materials || '—')}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="folder-outline" size={16} color="#666" />
          <Text style={styles.detailText}>Category: {service.category}</Text>
        </View>
      </View>

      <View style={styles.serviceFooter}>
        <View style={styles.subcategoryBadge}>
          <Text style={styles.subcategoryText}>{service.subCategory || service.subcategory || ''}</Text>
        </View>

        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => {
            Alert.alert(
              'Service Selected', 
              `You offer "${service.title || service.name}" service with base rate ${formatPrice(service.price ?? service.basePrice)}. You can request price adjustments based on job complexity.`,
              [
                { text: 'OK', style: 'default' },
                { text: 'Request Price Change', style: 'default', onPress: () => {
                  Alert.alert('Coming Soon', 'Price change request feature will be available soon!');
                }}
              ]
            );
          }}
        >
          <Text style={styles.selectButtonText}>Manage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}> 
          <View style={styles.dragHandle} {...panResponder.panHandlers}>
            <View style={styles.dragBar} />
          </View>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{selectedCategory} Services</Text>
            <Text style={styles.headerSubtitle}>
              {services.length} services available
            </Text>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ab9cf" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps='handled'
          >
            <View style={styles.content}>
              {services.length > 0 ? (
                <>
                  <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#4ab9cf" />
                    <Text style={styles.infoText}>
                      These are your service offerings. Base rates are shown - you can request price adjustments for specific jobs based on complexity and requirements.
                    </Text>
                  </View>
                  
                  {services.map(renderServiceCard)}
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="construct-outline" size={60} color="#ccc" />
                  <Text style={styles.emptyTitle}>No Services Available</Text>
                  <Text style={styles.emptySubtitle}>
                    No services found for {selectedCategory} category
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  dragHandle: { height: 28, alignItems: 'center', justifyContent: 'center' },
  dragBar: { width: 56, height: 6, borderRadius: 4, backgroundColor: '#ddd' },
  closeButton: {
    padding: 5,
  },
  headerContent: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e7f3ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4ab9cf',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ab9cf',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subcategoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subcategoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: '#4ab9cf',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default ServiceListModal;
