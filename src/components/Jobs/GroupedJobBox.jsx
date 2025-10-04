import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../ui/Text';

const GroupedJobBox = ({ customerGroup, onAccept, onPress, isPending = false }) => {
  const { customerName, address, jobs, totalPayment, urgency, timeSlot } = customerGroup;

  // Get payment method from first job (all jobs in cart have same payment method)
  const paymentMethod = jobs && jobs.length > 0 ? jobs[0].paymentMethod : null;
  
  // Determine payment mode styling
  const isOfflinePayment = paymentMethod === 'Pay on Service';
  const paymentBadgeColor = isOfflinePayment ? '#0bade4ff' : '#27ae60'; // Orange for offline, Green for online

  // Format time slot for user-friendly display
  const formatTimeSlot = (timeSlot) => {
    if (!timeSlot || timeSlot === 'any-time') return null;
    
    // If it's a full timestamp like "2025-10-12 16:00:00", extract just the time part
    if (timeSlot.includes('-') && timeSlot.includes(' ')) {
      try {
        // Extract the time part from "2025-10-12 16:00:00"
        const timePart = timeSlot.split(' ')[1]; // Gets "16:00:00"
        const timeOnly = timePart.split(':'); // Gets ["16", "00", "00"]
        const hour = parseInt(timeOnly[0]);
        const minutes = timeOnly[1] || '00';
        
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        
        // Also extract date for display
        const datePart = timeSlot.split(' ')[0]; // Gets "2025-10-12"
        const [year, month, day] = datePart.split('-');
        const date = new Date(year, month - 1, day); // Create date without timezone issues
        const dateStr = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        
        return `${displayHour}:${minutes} ${ampm} • ${dateStr}`;
      } catch (e) {
        return timeSlot;
      }
    }
    
    // If it's a timestamp with T, format it properly
    if (timeSlot.includes('T')) {
      try {
        const date = new Date(timeSlot);
        const timeStr = date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });
        const dateStr = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        return `${timeStr} • ${dateStr}`;
      } catch (e) {
        return timeSlot;
      }
    }
    
    // If it's time format like "09:00", "14:30", etc. (24-hour format from backend)
    if (timeSlot.includes(':') && !timeSlot.includes('AM') && !timeSlot.includes('PM')) {
      try {
        const [hours, minutes] = timeSlot.split(':');
        const hour = parseInt(hours);
        const min = minutes || '00'; // Handle cases where minutes might be missing
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${min} ${ampm}`;
      } catch (e) {
        return timeSlot;
      }
    }
    
    // If it's already formatted with AM/PM
    if (timeSlot.includes('AM') || timeSlot.includes('PM')) {
      return timeSlot;
    }
    
    return timeSlot;
  };

  const formattedTimeSlot = formatTimeSlot(timeSlot);
  
  // Calculate accurate total from individual job payments (preserve floating point precision)
  const calculatedTotal = jobs?.reduce((sum, job) => {
    const jobAmount = typeof job.payment === 'string' ? 
      parseFloat(job.payment.replace(/[₹,]/g, '')) : 
      job.payment || 0;
    return sum + jobAmount;
  }, 0) || 0;
  
  const formatAmount = (amount) => {
    // If amount is already a number, use it directly
    if (typeof amount === 'number') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
    
    // Handle string amounts by removing currency symbol and all commas
    if (typeof amount === 'string') {
      const numAmount = parseFloat(amount.replace(/[₹,]/g, ''));
      if (isNaN(numAmount)) return '₹0.00';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numAmount);
    }
    
    return '₹0.00';
  };
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.address}>Address:  {address}</Text>
          {formattedTimeSlot && (
            <View style={styles.timeSlotContainer}>
              <Ionicons name="time" size={14} color="#4ab9cf" />
              <Text style={styles.timeSlot}>{formattedTimeSlot}</Text>
            </View>
          )}
        </View>
        <View style={styles.jobCount}>
          <Text style={styles.jobCountText}>{jobs.length} Jobs</Text>
        </View>
      </View>

      <View style={styles.servicesList}>
        {jobs.map((job, index) => (
          <View key={job._id || index} style={styles.serviceItem}>
            <View style={styles.serviceIcon}>
              <Ionicons name="construct" size={16} color="#4ab9cf" />
            </View>
            <View style={styles.serviceDetails}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{job.serviceName || 'Service'}</Text>
              </View>
              <Text style={styles.servicePayment}>{job.payment || '₹0'}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Prominent Payment Mode Section */}
      {paymentMethod && (
        <View style={styles.paymentModeSection}>
          <View style={[styles.paymentModeContainer, { backgroundColor: paymentBadgeColor }]}>
            <Ionicons 
              name={paymentMethod === 'Pay on Service' ? 'cash' : 'card'} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.paymentModeText}>{paymentMethod}</Text>
          </View>
          <Text style={styles.paymentInstruction}>
            {paymentMethod === 'Pay on Service' 
              ? 'Collect payment from customer' 
              : 'Payment already received online'
            }
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>{formatAmount(calculatedTotal)}</Text>
        </View>

        <View style={styles.actions}>
          {urgency === 'High' && (
            <View style={styles.urgentBadge}>
              <Ionicons name="flash" size={14} color="#fff" />
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.acceptButton, isPending && styles.otpButton]} 
            onPress={onAccept}
          >
            <Text style={styles.acceptButtonText}>
              {isPending ? 'Enter OTP' : 'Accept All'}
            </Text>
            <Ionicons 
              name={isPending ? 'key' : 'checkmark-circle'} 
              size={16} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 18,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  timeSlot: {
    fontSize: 12,
    color: '#4ab9cf',
    marginLeft: 4,
    fontWeight: '500',
  },
  jobCount: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobCountText: {
    fontSize: 12,
    color: '#4ab9cf',
    fontWeight: '600',
  },
  servicesList: {
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  paymentMode: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  servicePayment: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    paddingTop: 12,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  totalAmount: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  otpButton: {
    backgroundColor: '#f39c12',
  },
  acceptButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginRight: 6,
  },
  paymentModeSection: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  paymentModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  paymentModeText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  paymentInstruction: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GroupedJobBox;