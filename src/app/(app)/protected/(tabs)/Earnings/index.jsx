import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import TransactionCard from '../../../../../components/Earnings/TransactionCard';
import AppHeader from '../../../../../components/common/AppHeader';
import LoadingSpinner from '../../../../../components/common/LoadingSpinner';
import Text from '../../../../../components/ui/Text';
import { useAuth } from '../../../../../context/AuthProvider';
import earningsService from '../../../../../services/earnings';

export default function Earnings() {
  const { user, userData } = useAuth();
  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [autoPayoutModalVisible, setAutoPayoutModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const filters = ['All', 'Credit', 'Debit', 'Cash'];

  const [data, setData] = useState({
    availableBalance: 0,
    totalWithdrawn: 0,
    totalEarned: 0,
    autoPayoutAmount: 0,
    pendingAmount: 0,
    bankDetails: {
      bankName: "",
      accountNumber: "",
      ifsc: ""
    },
    transactions: []
  });

    const formatTransactionsForDisplay = (transactions) => {
    // Group transactions by month and year
    const grouped = transactions.reduce((acc, transaction) => {
      // Parse the PostgreSQL timestamp format more reliably
      let date;
      try {
        // Handle PostgreSQL timestamp format: "2025-09-30 10:02:47.472158+00"
        const timestampStr = transaction.created_at;
        if (timestampStr && typeof timestampStr === 'string') {
          // Replace space with 'T' and remove timezone offset for ISO format
          const isoString = timestampStr.replace(' ', 'T').replace(/\+.*$/, 'Z');
          date = new Date(isoString);
          
          // If that doesn't work, try direct parsing
          if (isNaN(date.getTime())) {
            date = new Date(timestampStr);
          }
          
          // If still invalid, use current date as fallback
          if (isNaN(date.getTime())) {
            console.warn('Invalid date format:', timestampStr);
            date = new Date();
          }
        } else {
          date = new Date();
        }
      } catch (error) {
        console.error('Error parsing date:', transaction.created_at, error);
        date = new Date();
      }
      
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${month}-${year}`;

      if (!acc[key]) {
        acc[key] = {
          month,
          year,
          total: 0,
          entries: []
        };
      }

      // Create more descriptive transaction titles and services based on backend data
      // This maps backend transaction data to user-friendly display names
      let transactionTitle, transactionService;
      
      if (transaction.type === 'credit') {
        transactionTitle = 'Payment Received';
        transactionService = 'Job Payment from OnlyClick';
      } else if (transaction.type === 'debit') {
        transactionTitle = 'Payment Withdrawn';
        transactionService = 'Withdrawal Request';
      } else {
        // For null or undefined type, show as cash transaction
        transactionTitle = 'Cash';
        transactionService = 'Customer to TaskMaster';
      }

      acc[key].entries.push({
        id: transaction.idx,
        name: transactionTitle,
        title: transactionTitle,
        image: transaction.type === 'credit' ? 
          'https://picsum.photos/200/300?random=payment' : 
          transaction.type === 'debit' ?
          'https://picsum.photos/200/300?random=bank' :
          'https://picsum.photos/200/300?random=cash',
        service: transactionService,
        subtitle: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        remarks: transaction.remarks || null,
        date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: transaction.amount || 0,
        type: transaction.type || 'cash', // Changed from 'credit' to 'cash'
        status: 'completed',
        transactionId: `${transaction.id}`,
        remarks: transaction.remarks || 'N/A'
      });

      acc[key].total += transaction.amount || 0;
      return acc;
    }, {});

    return Object.values(grouped);
  };

  // Load earnings data from Supabase
  useEffect(() => {
    if (user?.id) {
      loadEarningsData();
    }
  }, [user?.id]);

  const loadEarningsData = async () => {
    try {
      setLoading(true);
      
      const [earningsSummary, transactions] = await Promise.all([
        earningsService.getEarningsSummary(user.id),
        earningsService.getTransactions(user.id)
      ]);
      
      // Update the data with real values from Supabase
      setData(prevData => ({
        ...prevData,
        availableBalance: earningsSummary.wallet,
        totalWithdrawn: earningsSummary.withdrawn,
        totalEarned: earningsSummary.totalEarned,
        transactions: formatTransactionsForDisplay(transactions),
        // Keep other fields as default for now since they're not in the current Supabase schema
        // These can be added to the database later if needed
      }));
    } catch (error) {
      console.error('Error loading earnings data:', error);
      // Keep default values if loading fails
    } finally {
      setLoading(false);
    }
  };

  // Functions
  const onRefresh = () => {
    setRefreshing(true);
    if (user?.id) {
      loadEarningsData().finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  };

  const doWithdraw = () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount');
      return;
    }
    if (amt > data.availableBalance) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance to withdraw this amount');
      return;
    }

    // Create WhatsApp message with TaskMaster details
    const companyPhoneNumber = '+919121377419'; // Replace with actual company WhatsApp number
    const message = `Withdrawal Request

TaskMaster ID: TM00${userData?.id || '00'}
Name: ${userData?.name || 'N/A'}
Phone: ${userData?.ph_no || 'N/A'}
Email: ${userData?.email || 'N/A'}

Withdrawal Amount: ${formatAmount(amt)}
Available Balance: ${formatAmount(data.availableBalance)}
Total Earned: ${formatAmount(data.totalEarned)}
Total Withdrawn: ${formatAmount(data.totalWithdrawn)}

Date: ${new Date().toLocaleDateString('en-IN')}
Time: ${new Date().toLocaleTimeString('en-IN')}

Please process this withdrawal request.`;

    // Try multiple WhatsApp URL formats - try opening directly instead of checking canOpenURL first
    const whatsappUrls = [
      `whatsapp://send?phone=${companyPhoneNumber}&text=${encodeURIComponent(message)}`,
      `https://wa.me/${companyPhoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`,
      `https://api.whatsapp.com/send?phone=${companyPhoneNumber}&text=${encodeURIComponent(message)}`
    ];

    const tryOpenWhatsApp = async (urlIndex = 0) => {
      if (urlIndex >= whatsappUrls.length) {
        // All methods failed - show manual contact option
        Alert.alert(
          'Unable to Open WhatsApp',
          'Please send this withdrawal request manually to our support team.',
          [
            { text: 'Copy Message', onPress: () => {
              // Copy message to clipboard (you might need to add Clipboard import)
              // For now, just show the message
              Alert.alert('Message to Send', message);
            }},
            { text: 'Contact Support', onPress: () => {
              // Try to call support
              Linking.openURL(`tel:+919121377419`).catch(() => {
                Alert.alert('Support Contact', 'Call: +91 9121377419');
              });
            }},
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      try {
        const url = whatsappUrls[urlIndex];
        console.log(`Trying WhatsApp URL ${urlIndex + 1}:`, url);
        
        await Linking.openURL(url);
        
        // If we reach here, the URL opened successfully
        setWithdrawAmount('');
        setWithdrawModalVisible(false);
        Alert.alert(
          'Request Sent',
          'Your withdrawal request has been sent to our team via WhatsApp. We will process it within 24 hours.',
          [{ text: 'OK' }]
        );
      } catch (error) {
        console.log(`WhatsApp URL ${urlIndex + 1} failed:`, error);
        // Try next URL format
        tryOpenWhatsApp(urlIndex + 1);
      }
    };

    // Start trying URLs
    tryOpenWhatsApp();
  };

  const toggleAutoPayout = () => {
    setAutoPayoutEnabled(!autoPayoutEnabled);
    Alert.alert(
      'Auto Payout',
      `Auto payout has been ${!autoPayoutEnabled ? 'enabled' : 'disabled'}`
    );
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const filteredTransactions = data.transactions.map(month => ({
    ...month,
    entries: month.entries.filter(entry => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Credit') return entry.type === 'credit';
      if (activeFilter === 'Debit') return entry.type === 'debit';
      if (activeFilter === 'Cash') return entry.type === 'cash';
      return true;
    })
  })).filter(month => month.entries.length > 0);

  return (
    <View style={styles.container}>
  <AppHeader title="Earnings" showBack={true} onBack={() => router.back()} />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4ab9cf']} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.cardIcon}>
                <Ionicons name="wallet" size={20} color="#4ab9cf" />
              </View>
              <Text style={styles.cardLabel}>Available</Text>
              <Text style={styles.cardAmount}>{formatAmount(data.availableBalance)}</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <View style={styles.cardIcon}>
                <Ionicons name="trending-up" size={20} color="#27ae60" />
              </View>
              <Text style={styles.cardLabel}>Total Earned</Text>
              <Text style={[styles.cardAmount, { color: '#27ae60' }]}>{formatAmount(data.totalEarned)}</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.cardIcon}>
                <Ionicons name="arrow-down" size={20} color="#e74c3c" />
              </View>
              <Text style={styles.cardLabel}>Withdrawn</Text>
              <Text style={[styles.cardAmount, { color: '#e74c3c' }]}>{formatAmount(data.totalWithdrawn)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => setWithdrawModalVisible(true)}>
            <Ionicons name="card" size={20} color="#fff" />
            <Text style={styles.primaryActionText}>Withdraw Money</Text>
          </TouchableOpacity>
          
          {/* <TouchableOpacity style={styles.secondaryAction} onPress={() => setAutoPayoutModalVisible(true)}>
            <Ionicons name="settings" size={20} color="#4ab9cf" />
            <Text style={styles.secondaryActionText}>Auto Payout</Text>
          </TouchableOpacity> */}
        </View>

        {/* Bank Details Card */}
        {/* <View style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <Ionicons name="business" size={20} color="#4ab9cf" />
            <Text style={styles.bankTitle}>Bank Account</Text>
            <TouchableOpacity>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.bankName}>{data.bankDetails.bankName}</Text>
          <Text style={styles.accountNumber}>Account: {data.bankDetails.accountNumber}</Text>
          <Text style={styles.ifsc}>IFSC: {data.bankDetails.ifsc}</Text>
        </View> */}

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, activeFilter === filter && styles.activeFilterPill]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#7f8c8d"
          />
        </View>

        {/* Transaction List */}
        <View style={styles.transactionContainer}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <LoadingSpinner />
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : (
            <View style={styles.transactionListContainer}>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((monthData, idx) => (
                  <View key={idx} style={styles.transactionCardWrapper}>
                    <TransactionCard
                      data={monthData}
                      onItemPress={(tx) => {
                        setSelectedTx(tx);
                        setReceiptVisible(true);
                      }}
                    />
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="receipt-outline" size={48} color="#7f8c8d" />
                  <Text style={styles.emptyText}>No transactions found</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal
        visible={withdrawModalVisible}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Money</Text>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.availableText}>Available Balance: {formatAmount(data.availableBalance)}</Text>
            
            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount to withdraw"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
              placeholderTextColor="#7f8c8d"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setWithdrawModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.withdrawButton} onPress={doWithdraw}>
                <Text style={styles.withdrawButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Auto Payout Modal */}
      <Modal
        visible={autoPayoutModalVisible}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={() => setAutoPayoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Auto Payout Settings</Text>
              <TouchableOpacity onPress={() => setAutoPayoutModalVisible(false)}>
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.autoPayoutRow}>
              <Text style={styles.autoPayoutText}>Enable Auto Payout</Text>
              <TouchableOpacity
                style={[styles.toggleButton, autoPayoutEnabled && styles.toggleButtonActive]}
                onPress={toggleAutoPayout}
              >
                <View style={[styles.toggleCircle, autoPayoutEnabled && styles.toggleCircleActive]} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.autoPayoutDescription}>
              Automatically withdraw earnings when they reach ₹{data.autoPayoutAmount}
            </Text>
            
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={() => setAutoPayoutModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        visible={receiptVisible}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={() => setReceiptVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptModal}>
            <View style={styles.receiptHeader}>
              <TouchableOpacity onPress={() => setReceiptVisible(false)}>
                <Ionicons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.receiptIcon}>
              <Ionicons 
                name={selectedTx?.type === 'credit' ? 'checkmark-circle' : 
                     selectedTx?.type === 'debit' ? 'arrow-down-circle' : 'cash'} 
                size={60} 
                color={selectedTx?.type === 'credit' ? '#27ae60' : 
                       selectedTx?.type === 'debit' ? '#e74c3c' : '#f39c12'} 
              />
            </View>
            
            <Text style={styles.receiptTitle}>
              {selectedTx?.title || 
               (selectedTx?.type === 'credit' ? 'Payment Received' : 
                selectedTx?.type === 'debit' ? 'Payment Withdrawn' : 'Cash')}
            </Text>
            
            <Text style={[styles.receiptAmount, { 
              color: selectedTx?.type === 'credit' ? '#27ae60' : 
                     selectedTx?.type === 'debit' ? '#e74c3c' : '#f39c12' 
            }]}>
              {selectedTx?.type === 'credit' ? '+' : 
               selectedTx?.type === 'debit' ? '-' : ''} {formatAmount(selectedTx?.amount || 0)}
            </Text>
            
            <View style={styles.receiptDetails}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Type</Text>
                <Text style={styles.receiptValue}>{selectedTx?.service}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Date</Text>
                <Text style={styles.receiptValue}>{selectedTx?.date}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Transaction ID</Text>
                <Text style={styles.receiptValue}>{selectedTx?.transactionId}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Remarks</Text>
                <Text style={styles.receiptValue}>{selectedTx?.remarks || 'N/A'}</Text>
              </View>
              {selectedTx?.customerRating && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Customer Rating</Text>
                  <Text style={styles.receiptValue}>
                    {selectedTx.customerRating} ⭐
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity style={styles.closeReceiptButton} onPress={() => setReceiptVisible(false)}>
              <Text style={styles.closeReceiptText}>Close</Text>
            </TouchableOpacity>
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
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  notificationButton: {
    padding: 8,
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
  },
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#4ab9cf',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ab9cf',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    color: '#4ab9cf',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bankCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  bankTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  editText: {
    color: '#4ab9cf',
    fontSize: 14,
    fontWeight: '600',
  },
  bankName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  ifsc: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  activeFilterPill: {
    backgroundColor: '#4ab9cf',
    borderColor: '#349db2ff',
  },
  filterText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
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
  transactionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  transactionListContainer: {
    width: '100%',
  },
  transactionCardWrapper: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  availableText: {
    fontSize: 16,
    color: '#27ae60',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  amountInput: {
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e8ed',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  withdrawButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4ab9cf',
    alignItems: 'center',
  },
  withdrawButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  autoPayoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  autoPayoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e1e8ed',
    padding: 2,
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4ab9cf',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  autoPayoutDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#4ab9cf',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  receiptModal: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    alignItems: 'center',
  },
  receiptHeader: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  receiptIcon: {
    marginBottom: 16,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  receiptAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  receiptDetails: {
    width: '100%',
    marginBottom: 24,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  receiptLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  receiptValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  closeReceiptButton: {
    backgroundColor: '#4ab9cf',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  closeReceiptText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});
