import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../../../../components/common/AppHeader';
const STATUSBAR_PADDING = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12;

const STORAGE_KEY = 'payment_methods_v1';

export default function PaymentMethods() {
  const [methods, setMethods] = useState([]);

  useEffect(() => { (async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    setMethods(raw ? JSON.parse(raw) : []);
  })(); }, []);

  const save = async (next) => { setMethods(next); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };

  const addDummy = async () => {
    // deprecated
  };

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addType, setAddType] = useState('card'); // 'card' | 'bank'

  // card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  // bank fields
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');

  const resetForm = () => {
    setCardNumber(''); setCardName(''); setCardExp(''); setCardCVV('');
    setBankName(''); setAccountNumber(''); setIfsc('');
    setAddType('card');
  };

  const saveNewMethod = async () => {
    if (addType === 'card') {
      const cleaned = (cardNumber || '').replace(/\s+/g, '');
      if (cleaned.length < 12) return Alert.alert('Invalid card', 'Please enter a valid card number');
      if (!cardName) return Alert.alert('Invalid name', 'Cardholder name is required');
      const last4 = cleaned.slice(-4);
      const brand = cleaned.startsWith('4') ? 'Visa' : cleaned.startsWith('5') ? 'Mastercard' : 'Card';
      const card = { id: `card_${Date.now()}`, brand, last4, exp: cardExp || '––/––', isPrimary: methods.length === 0, meta: { name: cardName } };
      const next = [card, ...methods.map(m => ({ ...m, isPrimary: false }))];
      await save(next);
      resetForm(); setShowAddForm(false);
      return;
    }

    // bank
    if (!bankName) return Alert.alert('Invalid', 'Bank name is required');
    if (!accountNumber || accountNumber.length < 6) return Alert.alert('Invalid', 'Enter a valid account number');
    const accLast4 = String(accountNumber).slice(-4);
    const bank = { id: `bank_${Date.now()}`, brand: bankName, last4: accLast4, ifsc: ifsc || '', isPrimary: methods.length === 0, type: 'bank' };
    const next = [bank, ...methods.map(m => ({ ...m, isPrimary: false }))];
    await save(next);
    resetForm(); setShowAddForm(false);
  };

  const remove = async (id) => {
    const next = methods.filter(m => m.id !== id);
    await save(next);
  };

  const makePrimary = async (id) => {
    const next = methods.map(m => ({ ...m, isPrimary: m.id === id }));
    await save(next);
  };

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.logoPlaceholder}><Text style={styles.logoText}>{item.brand?.[0] || 'C'}</Text></View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.cardNumber}>{item.brand} •••• {item.last4}</Text>
          <Text style={styles.cardMeta}>Expires {item.exp}</Text>
        </View>
      </View>

      <View style={styles.cardRight}>
        {item.isPrimary && <View style={styles.primaryBadge}><Text style={styles.primaryText}>Primary</Text></View>}
        <TouchableOpacity onPress={() => makePrimary(item.id)} style={styles.iconBtn}><Ionicons name="star" size={18} color={item.isPrimary ? '#f1c40f' : '#bbb'} /></TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Remove card', 'Remove this card?', [{ text: 'Cancel' }, { text: 'Remove', style: 'destructive', onPress: () => remove(item.id) }])} style={styles.iconBtn}><Ionicons name="trash" size={18} color="#e74c3c" /></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Payment Methods" showBack onBack={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.actionsRow}>
          <Text style={styles.sectionTitle}>Saved methods</Text>
          {!showAddForm ? (
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddForm(true)}><Text style={styles.addText}>Add method</Text></TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6f6f7' }]} onPress={() => { resetForm(); setShowAddForm(false); }}><Text style={[styles.addText, { color: '#177a81' }]}>Cancel</Text></TouchableOpacity>
            </View>
          )}
        </View>

        {showAddForm && (
          <View style={styles.addForm}>
            <View style={styles.typeRow}>
              <TouchableOpacity style={[styles.typeBtn, addType === 'card' && styles.typeBtnActive]} onPress={() => setAddType('card')}><Text style={[styles.typeText, addType === 'card' && styles.typeTextActive]}>Card</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, addType === 'bank' && styles.typeBtnActive]} onPress={() => setAddType('bank')}><Text style={[styles.typeText, addType === 'bank' && styles.typeTextActive]}>Bank</Text></TouchableOpacity>
            </View>

            {addType === 'card' ? (
              <>
                <TextInput style={styles.field} placeholder="Card number" value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" />
                <TextInput style={styles.field} placeholder="Cardholder name" value={cardName} onChangeText={setCardName} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput style={[styles.field, { flex: 1 }]} placeholder="MM/YY" value={cardExp} onChangeText={setCardExp} />
                  <TextInput style={[styles.field, { width: 100 }]} placeholder="CVV" value={cardCVV} onChangeText={setCardCVV} keyboardType="number-pad" />
                </View>
              </>
            ) : (
              <>
                <TextInput style={styles.field} placeholder="Bank name" value={bankName} onChangeText={setBankName} />
                <TextInput style={styles.field} placeholder="Account number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" />
                <TextInput style={styles.field} placeholder="IFSC" value={ifsc} onChangeText={setIfsc} />
              </>
            )}

            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity style={[styles.saveNewBtn, { marginRight: 8 }]} onPress={saveNewMethod}><Text style={styles.saveNewText}>Save</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.saveNewBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e6f6f7' }]} onPress={() => { resetForm(); setShowAddForm(false); }}><Text style={[styles.saveNewText, { color: '#177a81' }]}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {methods.length === 0 ? (
          <View style={styles.empty}><Ionicons name="card-outline" size={56} color="#cbdfe0" /><Text style={styles.emptyText}>No saved payment methods</Text></View>
        ) : (
          <FlatList data={methods} keyExtractor={m => m.id} style={{ marginTop: 12 }} renderItem={renderCard} />
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
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  addBtn: { backgroundColor: '#4ab9cf', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addText: { color: '#fff', fontWeight: '700' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  logoPlaceholder: { width: 48, height: 32, borderRadius: 8, backgroundColor: '#e8f8f8', justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#177a81', fontWeight: '800' },
  cardNumber: { fontWeight: '800' },
  cardMeta: { color: '#888', marginTop: 4 },
  cardRight: { alignItems: 'flex-end' },
  primaryBadge: { backgroundColor: '#177a81', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginBottom: 8 },
  primaryText: { color: '#fff', fontWeight: '700' },
  iconBtn: { padding: 6 },

  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { marginTop: 12, color: '#999', fontWeight: '700' },
  addForm: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginTop: 12, elevation: 2 },
  typeRow: { flexDirection: 'row', marginBottom: 12 },
  typeBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#f6fbfb', marginRight: 8 },
  typeBtnActive: { backgroundColor: '#4ab9cf' },
  typeText: { color: '#177a81', fontWeight: '700' },
  typeTextActive: { color: '#fff' },
  field: { backgroundColor: '#f6fbfb', padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e6f6f7' },
  saveNewBtn: { flex: 1, backgroundColor: '#4ab9cf', paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  saveNewText: { color: '#fff', fontWeight: '800' },
});
