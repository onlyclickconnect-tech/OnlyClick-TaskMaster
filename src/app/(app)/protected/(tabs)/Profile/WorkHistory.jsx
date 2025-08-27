import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import userService from '../../../../../services/userService';
import AppHeader from '../../../../../components/common/AppHeader';

const STATUSBAR_PADDING = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12;

export default function WorkHistory() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await userService.getUserBookings();
        if (res && res.success) setItems(res.data.bookings || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const renderItem = ({ item, index }) => {
    const isRecent = index === 0;
    const statusColor = item.status === 'completed' ? '#4CAF50' : item.status === 'pending' ? '#f1c40f' : '#95a5a6';

    return (
      <View style={styles.row}>
        <View style={styles.leftCol}>
          <View style={[styles.dateBadge, isRecent && styles.dateBadgeRecent]}>
            <Text style={[styles.dateText, isRecent && styles.dateTextRecent]}>{item.date}</Text>
          </View>
          <View style={styles.line} />
        </View>

        <View style={[styles.card, isRecent && styles.cardRecent]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.service}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.cardMeta}>Request ID: #{item.id}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Work History" showBack onBack={() => router.back()} />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loading}><ActivityIndicator color="#4ab9cf" size="large" /></View>
        ) : items.length === 0 ? (
          <View style={styles.empty}><Ionicons name="time-outline" size={46} color="#ccc" /><Text style={styles.emptyText}>No work history yet</Text></View>
        ) : (
          <FlatList data={items} keyExtractor={i => String(i.id)} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 40 }} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6fbfb' },
  headerWrap: { backgroundColor: '#4ab9cf', paddingTop: STATUSBAR_PADDING, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { padding: 20 },
  loading: { paddingTop: 40, alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 48 },
  emptyText: { marginTop: 12, color: '#999', fontSize: 16, fontWeight: '600' },

  row: { flexDirection: 'row', marginBottom: 16 },
  leftCol: { width: 92, alignItems: 'center' },
  dateBadge: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e6f6f7' },
  dateBadgeRecent: { backgroundColor: '#4ab9cf' },
  dateText: { fontSize: 12, color: '#177a81', fontWeight: '700' },
  dateTextRecent: { color: '#fff' },
  line: { width: 2, backgroundColor: '#e6f6f7', flex: 1, marginTop: 8 },

  card: { flex: 1, backgroundColor: '#fff', padding: 14, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  cardRecent: { borderWidth: 1, borderColor: '#4ab9cf' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#333' },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#fff', fontWeight: '700', textTransform: 'capitalize' },
  cardMeta: { marginTop: 8, color: '#666' },
});
