import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Text from '../ui/Text';

export default function JobBox({ data, isPending, isCompleted, onEnterOtp, onPress }) {
  const router = useRouter();

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'High': return '#e74c3c';
      case 'Medium': return '#f39c12';
      case 'Low': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return '#4ab9cf';
      case 'En Route': return '#f39c12';
      case 'Accepted': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  // If the job is completed, make the whole card tappable so the parent can open details (receipt)
  const CardContent = (
    <>
      {/* Customer Image */}
      <Image
        source={data.image ? { uri: data.image } : require('../../../assets/images/avatarPlaceholder.png')}
        style={styles.customerImage}
      />
      
      {/* Job Content */}
      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{data.customerName}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#f39c12" />
              <Text style={styles.rating}>{data.customerRating}</Text>
            </View>
          </View>
          <View style={styles.paymentContainer}>
            <Text style={styles.payment}>{data.payment}</Text>
            <Text style={styles.timeAgo}>{data.jobPostedTime}</Text>
          </View>
        </View>

        {/* Service Info */}
        <View style={styles.serviceRow}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{data.serviceName}</Text>
            <View style={[
              styles.serviceTypeBadge, 
              { backgroundColor: data.serviceType === 'Emergency' ? '#e74c3c' : data.serviceType === 'Scheduled' ? '#4ab9cf' : '#27ae60' }
            ]}>
              <Text style={styles.serviceTypeText}>{data.serviceType}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.description} numberOfLines={2}>{data.description}</Text>

        {/* Location and Distance */}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="#7f8c8d" />
          <Text style={styles.address} numberOfLines={1}>{data.address}</Text>
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={styles.leftInfo}>
            <View style={styles.timeContainer}>
              <Ionicons name="time" size={14} color="#7f8c8d" />
              <Text style={styles.estimatedTime}>{data.estimatedTime}</Text>
            </View>
            
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isPending ? (
              <View style={styles.pendingActions}>
                {data.status && (
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(data.status) }]}>
                    <Text style={styles.statusText}>{data.status}</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => onEnterOtp && onEnterOtp(data)}
                  style={styles.otpButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="keypad" size={14} color="#fff" />
                  <Text style={styles.otpText}>OTP</Text>
                </TouchableOpacity>
              </View>
            ) : data.status === 'Completed' ? (
              <View style={styles.completedActions}>
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#27ae60" />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
                {data.tipReceived && (
                  <Text style={styles.tipReceived}>Tip: {data.tipReceived}</Text>
                )}
                <TouchableOpacity style={styles.viewReceiptBtn} onPress={() => onPress && onPress(data)} activeOpacity={0.8}>
                  <Ionicons name="receipt" size={14} color="#4ab9cf" />
                  <Text style={styles.viewReceiptText}>View Receipt</Text>
                </TouchableOpacity>
              </View>
            ) : data.status === 'Cancelled' ? (
              <View style={styles.cancelledActions}>
                <View style={styles.cancelledBadge}>
                  <Ionicons name="close-circle" size={16} color="#e74c3c" />
                  <Text style={styles.cancelledText}>Cancelled</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.acceptButton} activeOpacity={0.8} onPress={() => onPress && onPress(data)}>
                <Text style={styles.acceptText}>View Details</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );

  if (data.status === 'Completed') {
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onPress && onPress(data)}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      {CardContent}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 4,
    position: 'relative',
  },
  customerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    position: 'absolute',
    top: 16,
    left: 16,
  },
  content: {
    marginLeft: 66,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  customerInfo: {
    flex: 1,
    marginRight: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  paymentContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  payment: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 11,
    color: '#95a5a6',
    fontWeight: '500',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4ab9cf',
    flex: 1,
  },
  serviceRow: {
    marginBottom: 6,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  description: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 18,
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  address: {
    flex: 1,
    fontSize: 13,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ab9cf',
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  estimatedTime: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionButtons: {
    alignItems: 'flex-end',
  },
  pendingActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  otpButton: {
    backgroundColor: '#4ab9cf',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  otpText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedActions: {
    alignItems: 'flex-end',
    gap: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27ae60',
  },
  tipReceived: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f39c12',
  },
  viewReceiptBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0fbff',
  },
  viewReceiptText: {
    color: '#4ab9cf',
    fontWeight: '700',
    fontSize: 12,
  },
  cancelledActions: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cancelledText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e74c3c',
  },
  acceptButton: {
    backgroundColor: '#4ab9cf',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  acceptText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  serviceTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  serviceTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});
