import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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
import TransactionCard from '../../../../../components/Earnings/TransactionCard';
import AppHeader from '../../../../../components/common/AppHeader';

export default function Earnings() {
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

  const filters = ['All', 'Credit', 'Debit', 'This Month'];

  const [data, setData] = useState({
    availableBalance: 8700,
    totalWithdrawn: 7000,
    totalEarned: 11500,
    autoPayoutAmount: 5000,
    pendingAmount: 1200,
    thisMonthEarnings: 2800,
    bankDetails: {
      bankName: "HDFC Bank",
      accountNumber: "****5678",
      ifsc: "HDFC0001234"
    },
    transactions: [
      {
        month: "December",
        year: 2024,
        total: 6500,
        entries: [
          {
            id: 1,
            name: "Rahul Sharma",
            image: "https://picsum.photos/200/300?random=1",
            service: "AC Repair & Service",
            date: "15 Dec, 2024",
            amount: 850,
            type: "credit",
            status: "completed",
            customerRating: 4.8,
            transactionId: "TXN123456789"
          },
          {
            id: 2,
            name: "Bank Transfer",
            image: "https://picsum.photos/200/300?random=2",
            service: "Withdrawal to HDFC Bank",
            date: "14 Dec, 2024",
            amount: 2000,
            type: "debit",
            status: "processed",
            transactionId: "WTH987654321"
          },
          {
            id: 3,
            name: "Priya Gupta",
            image: "https://picsum.photos/200/300?random=3",
            service: "Plumbing Service",
            date: "12 Dec, 2024",
            amount: 650,
            type: "credit",
            status: "completed",
            customerRating: 5.0,
            transactionId: "TXN456789123"
          },
        ],
      },
      {
        month: "November",
        year: 2024,
        total: 5200,
        entries: [
          {
            id: 4,
            name: "Amit Kumar",
            image: "https://picsum.photos/200/300?random=4",
            service: "Electrical Work",
            date: "28 Nov, 2024",
            amount: 1200,
            type: "credit",
            status: "completed",
            customerRating: 4.5,
            transactionId: "TXN789123456"
          },
          {
            id: 5,
            name: "Sneha Reddy",
            image: "https://picsum.photos/200/300?random=5",
            service: "Home Cleaning",
            date: "25 Nov, 2024",
            amount: 400,
            type: "credit",
            status: "completed",
            customerRating: 4.9,
            transactionId: "TXN321654987"
          }
        ],
      },
    ],
  });

  // Functions
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
    
    setData(prev => ({
      ...prev,
      availableBalance: prev.availableBalance - amt,
      totalWithdrawn: prev.totalWithdrawn + amt,
      transactions: [{
        ...prev.transactions[0],
        entries: [{
          id: Date.now(),
          name: 'Bank Transfer',
          image: 'https://picsum.photos/200/300?random=bank',
          service: `Withdrawal to ${prev.bankDetails.bankName}`,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          amount: amt,
          type: 'debit',
          status: 'processed',
          transactionId: `WTH${Date.now()}`
        }, ...prev.transactions[0].entries]
      }, ...prev.transactions.slice(1)]
    }));
    
    setWithdrawAmount('');
    setWithdrawModalVisible(false);
    Alert.alert('Success', `₹${amt} has been withdrawn successfully`);
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
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredTransactions = data.transactions.map(month => ({
    ...month,
    entries: month.entries.filter(entry => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Credit') return entry.type === 'credit';
      if (activeFilter === 'Debit') return entry.type === 'debit';
      if (activeFilter === 'This Month') {
        const entryDate = new Date(entry.date);
        const currentDate = new Date();
        return entryDate.getMonth() === currentDate.getMonth() && 
               entryDate.getFullYear() === currentDate.getFullYear();
      }
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
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.cardIcon}>
                <Ionicons name="arrow-down" size={20} color="#e74c3c" />
              </View>
              <Text style={styles.cardLabel}>Withdrawn</Text>
              <Text style={[styles.cardAmount, { color: '#e74c3c' }]}>{formatAmount(data.totalWithdrawn)}</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <View style={styles.cardIcon}>
                <Ionicons name="time" size={20} color="#f39c12" />
              </View>
              <Text style={styles.cardLabel}>This Month</Text>
              <Text style={[styles.cardAmount, { color: '#f39c12' }]}>{formatAmount(data.thisMonthEarnings)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => setWithdrawModalVisible(true)}>
            <Ionicons name="card" size={20} color="#fff" />
            <Text style={styles.primaryActionText}>Withdraw Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryAction} onPress={() => setAutoPayoutModalVisible(true)}>
            <Ionicons name="settings" size={20} color="#4ab9cf" />
            <Text style={styles.secondaryActionText}>Auto Payout</Text>
          </TouchableOpacity>
        </View>

        {/* Bank Details Card */}
        <View style={styles.bankCard}>
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
        </View>

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
          <View style={styles.transactionListContainer}>
            {filteredTransactions.map((monthData, idx) => (
              <View key={idx} style={styles.transactionCardWrapper}>
                <TransactionCard
                  data={monthData}
                  onItemPress={(tx) => {
                    setSelectedTx(tx);
                    setReceiptVisible(true);
                  }}
                />
              </View>
            ))}
          </View>
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
                name={selectedTx?.type === 'credit' ? 'checkmark-circle' : 'arrow-down-circle'} 
                size={60} 
                color={selectedTx?.type === 'credit' ? '#27ae60' : '#e74c3c'} 
              />
            </View>
            
            <Text style={styles.receiptTitle}>
              {selectedTx?.type === 'credit' ? 'Payment Received' : 'Money Withdrawn'}
            </Text>
            
            <Text style={[styles.receiptAmount, { color: selectedTx?.type === 'credit' ? '#27ae60' : '#e74c3c' }]}>
              {selectedTx?.type === 'credit' ? '+' : '-'} {formatAmount(selectedTx?.amount || 0)}
            </Text>
            
            <View style={styles.receiptDetails}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Service</Text>
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
    fontSize: 18,
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
});
