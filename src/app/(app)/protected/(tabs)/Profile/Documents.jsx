import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Linking, Modal, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../../../../components/common/AppHeader';
const STATUSBAR_PADDING = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 12;

const DOC_KEY = 'user_documents_v1';

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [docType, setDocType] = useState('Aadhaar');
  const [customTitle, setCustomTitle] = useState('');
  const [viewModal, setViewModal] = useState({ open: false, uri: null, title: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => { (async () => {
    const raw = await AsyncStorage.getItem(DOC_KEY);
    setDocs(raw ? JSON.parse(raw) : []);
  })(); }, []);

  const persist = async (next) => { setDocs(next); await AsyncStorage.setItem(DOC_KEY, JSON.stringify(next)); };

  const pick = async () => {
    // Try to load the document picker dynamically so the app doesn't crash
    // if the native module isn't installed. If not present, fall back to
    // expo-image-picker (image-only) if available, otherwise show an
    // actionable message to install the package.
    try {
      const DocumentPicker = require('expo-document-picker');
      const res = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (res.type === 'success') {
        const uri = res.uri;
        const name = res.name || uri.split('/').pop() || 'file';
        const ext = (name || '').split('.').pop() || '';
        const mime = ext ? (`application/${ext}`) : (res.mimeType || 'application/octet-stream');
        const isImage = /(jpg|jpeg|png|gif|webp)$/i.test(name);
  const picked = { uri, name, mimeType: res.mimeType || mime, isImage, persisted: false };
        setSelectedFile(picked);
        if (docType === 'Other' && !customTitle) setCustomTitle(name.replace(/\.[^/.]+$/, ''));
        Alert.alert('Selected', name);
      }
      return;
    } catch (err) {
      // document-picker not available at runtime; attempt image picker fallback
      try {
        const ImagePicker = require('expo-image-picker');
        // Ask for permissions if needed (best-effort; managed apps often already have it)
        if (ImagePicker.requestMediaLibraryPermissionsAsync) {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (perm.status === 'denied') {
            Alert.alert('Permission required', 'Please allow photo library access to pick images');
            return;
          }
        }
        const pickRes = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.8 });
        // expo-image-picker returns { cancelled, uri } or { cancelled, assets: [...] }
        if (pickRes.cancelled) return;
        const asset = pickRes.assets ? pickRes.assets[0] : pickRes;
        const uri = asset.uri || asset.path;
        const name = asset.fileName || uri.split('/').pop() || 'image.jpg';
        const mime = asset.type ? `${asset.type}/jpeg` : 'image/jpeg';
  const picked = { uri, name, mimeType: mime, isImage: true, persisted: false };
  setSelectedFile(picked);
        if (docType === 'Other' && !customTitle) setCustomTitle(name.replace(/\.[^/.]+$/, ''));
        Alert.alert('Selected (image)', name);
        return;
      } catch (e2) {
  console.warn('No picker available', err, e2);
  Alert.alert('Picker unavailable', 'Install expo-document-picker to pick PDFs and files:\n\nnpx expo install expo-document-picker\n\nthen restart the dev server');
        return;
      }
    }
  };

  const uploadSelectedFile = async () => {
    if (!selectedFile) return;
    try {
      const title = docType === 'Other' ? (customTitle || selectedFile.name) : docType;

      // Try to copy the file into the app's document directory so it persists.
      let storedUri = selectedFile.uri;
      try {
        const FileSystem = require('expo-file-system');
        const dir = FileSystem.documentDirectory + 'user_documents/';
        // ensure directory exists
        try { await FileSystem.makeDirectoryAsync(dir, { intermediates: true }); } catch (e) { /* ignore if exists */ }
        const safeName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const dest = dir + safeName;
        await FileSystem.copyAsync({ from: selectedFile.uri, to: dest });
        storedUri = dest;
      } catch (fsErr) {
        console.warn('FileSystem copy failed, falling back to original uri', fsErr);
        // keep storedUri as original; this may not persist across app restarts on Android if it's a content:// uri
      }

      const entry = { id: Date.now(), uri: storedUri, title, type: docType, name: selectedFile.name, mimeType: selectedFile.mimeType, isImage: selectedFile.isImage, persisted: true };
      const next = [entry, ...docs];
      await persist(next);
      setSelectedFile(null);
      setCustomTitle('');
      Alert.alert('Uploaded', `${title} uploaded successfully`);
    } catch (err) {
      console.warn(err);
      Alert.alert('Upload failed', 'Unable to save the document');
    }
  };

  const cancelSelectedFile = () => setSelectedFile(null);

  const remove = async (id) => {
    // Attempt to delete the underlying stored file if it exists under app storage
    try {
      const toRemove = docs.find(d => d.id === id);
      if (toRemove && typeof toRemove.uri === 'string' && toRemove.uri.startsWith((require.cache && require.cache['expo-file-system']) ? '' : '')) {
        try {
          const FileSystem = require('expo-file-system');
          // only delete if it looks like it's in documentDirectory
          if (toRemove.uri && toRemove.uri.startsWith(FileSystem.documentDirectory)) {
            await FileSystem.deleteAsync(toRemove.uri, { idempotent: true });
          }
        } catch (e) {
          // non-fatal
          console.warn('Could not delete file from FS', e);
        }
      }
    } catch (e) {
      console.warn('remove delete attempt failed', e);
    }
    const next = docs.filter(d => d.id !== id);
    await persist(next);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Documents" showBack onBack={() => router.back()} />

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Upload verification document</Text>

        <View style={styles.formRow}>
          <View style={styles.typeRow}>
            {['Aadhaar','PAN','Driving','Other'].map(t => (
              <TouchableOpacity key={t} onPress={() => setDocType(t)} style={[styles.typeBtn, docType === t && styles.typeBtnActive]}><Text style={[styles.typeText, docType === t && styles.typeTextActive]}>{t}</Text></TouchableOpacity>
            ))}
          </View>

          {docType === 'Other' && (
            <TextInput placeholder="Document title (e.g., Voter ID)" style={styles.field} value={customTitle} onChangeText={setCustomTitle} />
          )}

          {/* Prominent picker card: when no file selected show dashed placeholder, otherwise show large preview with Upload CTA */}
          <View style={{ marginTop: 12 }}>
            {!selectedFile ? (
              <TouchableOpacity onPress={pick} activeOpacity={0.85} style={styles.pickerCard}>
                <Ionicons name="cloud-upload-outline" size={44} color="#8fcfd6" />
                <Text style={styles.pickerText}>Tap to choose a file (PDF, image, doc)</Text>
                <Text style={styles.pickerSub} numberOfLines={2}>Supported: .pdf, .jpg, .png, .jpeg, .docx — or use a custom dev client to enable more native pickers.</Text>
                <View style={styles.chooseBtn}><Text style={styles.chooseBtnText}>Choose file</Text></View>
              </TouchableOpacity>
            ) : (
              <View style={styles.previewCard}>
                <View style={styles.previewTop}>
                  {selectedFile.isImage ? (
                    <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.fileIconWrap}><Ionicons name="document-text-outline" size={48} color="#9fbfc2" /></View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.bigFileName} numberOfLines={2}>{selectedFile.name}</Text>
                    <Text style={styles.fileMetaSmall}>{selectedFile.mimeType}</Text>
                    <Text style={styles.fileMetaSmall}>{docType === 'Other' ? (customTitle || 'Custom') : docType}</Text>
                  </View>
                </View>
                <View style={styles.previewActions}>
                  {selectedFile && selectedFile.persisted ? (
                    // already uploaded: offer Open and Delete
                    <>
                      <TouchableOpacity style={styles.greenBtn} onPress={() => Linking.openURL(selectedFile.uri).catch(() => Alert.alert('Open file', 'Cannot open this file'))}><Text style={{ color: '#fff', fontWeight: '800' }}>Open</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.cancelBtn} onPress={async () => { await remove(selectedFile.id); setSelectedFile(null); }}><Text style={{ color: '#e74c3c', fontWeight: '700' }}>Delete</Text></TouchableOpacity>
                    </>
                  ) : (
                    // new pick: upload or cancel
                    <>
                      <TouchableOpacity style={styles.greenBtn} onPress={uploadSelectedFile}><Text style={{ color: '#fff', fontWeight: '800' }}>Upload</Text></TouchableOpacity>
                      <TouchableOpacity style={styles.cancelBtn} onPress={cancelSelectedFile}><Text style={{ color: '#666' }}>Cancel</Text></TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Your documents</Text>

        {docs.length === 0 ? (
          <View style={styles.empty}><Ionicons name="document-text-outline" size={56} color="#cbdfe0" /><Text style={styles.emptyText}>No documents uploaded</Text></View>
        ) : (
          <FlatList data={docs} keyExtractor={d => String(d.id)} style={{ marginTop: 12 }} numColumns={2} renderItem={({ item }) => (
            <View style={styles.thumbWrap}>
              <TouchableOpacity onPress={() => {
                // make the tapped document the active selection so the preview shows
                setSelectedFile(item);
                if (item.isImage) setViewModal({ open: true, uri: item.uri, title: item.title });
              }}>
                {item.isImage ? (
                  <Image source={{ uri: item.uri }} style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.fileThumb]}>
                    <Ionicons name="document-text-outline" size={42} color="#cbdfe0" />
                    <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                  </View>
                )}
                <View style={styles.thumbMeta}>
                  <Text style={styles.thumbTitle}>{item.title}</Text>
                  <Text style={styles.thumbType}>{item.type}</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.thumbActions}>
                <TouchableOpacity onPress={() => { setSelectedFile(item); }} style={styles.iconBtn}><Ionicons name="eye" size={18} color="#177a81" /></TouchableOpacity>
                <TouchableOpacity onPress={async () => { await remove(item.id); if (selectedFile && selectedFile.id === item.id) setSelectedFile(null); }} style={styles.iconBtn}><Ionicons name="trash" size={18} color="#e74c3c" /></TouchableOpacity>
              </View>
            </View>
          )} />
        )}

        <Modal visible={viewModal.open} transparent={false} animationType="slide">
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
              <TouchableOpacity onPress={() => setViewModal({ open: false, uri: null, title: '' })} style={{ marginRight: 12 }}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>{viewModal.title}</Text>
            </View>
            <Image source={{ uri: viewModal.uri }} style={{ flex: 1, resizeMode: 'contain' }} />
          </SafeAreaView>
        </Modal>
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
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  formRow: { marginTop: 12, backgroundColor: '#fff', padding: 12, borderRadius: 12, elevation: 2 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap' },
  typeBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#f6fbfb', marginRight: 8, marginBottom: 8 },
  typeBtnActive: { backgroundColor: '#4ab9cf' },
  typeText: { color: '#177a81', fontWeight: '700' },
  typeTextActive: { color: '#fff' },
  field: { marginTop: 8, backgroundColor: '#f6fbfb', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e6f6f7' },
  uploadBtn: { marginTop: 8, backgroundColor: '#4ab9cf', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  uploadText: { color: '#fff', fontWeight: '800' },
  selectedPreview: { marginTop: 12, backgroundColor: '#fff', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  selectedLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  selectedThumb: { width: 56, height: 56, borderRadius: 8 },
  selectedActions: { alignItems: 'flex-end', marginLeft: 12 },
  greenBtn: { backgroundColor: '#29b765', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  cancelBtn: { marginLeft: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  pickerCard: { borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#cfeff1', backgroundColor: '#fff', padding: 18, borderRadius: 12, alignItems: 'center', elevation: 2 },
  pickerText: { marginTop: 8, fontWeight: '700', color: '#177a81' },
  pickerSub: { marginTop: 6, color: '#7aa8aa', fontSize: 12, textAlign: 'center' },
  chooseBtn: { marginTop: 12, backgroundColor: '#4ab9cf', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  chooseBtnText: { color: '#fff', fontWeight: '800' },
  previewCard: { marginTop: 8, backgroundColor: '#fff', padding: 12, borderRadius: 12, elevation: 2 },
  previewTop: { flexDirection: 'row', alignItems: 'center' },
  previewImage: { width: 88, height: 88, borderRadius: 10 },
  fileIconWrap: { width: 88, height: 88, borderRadius: 10, backgroundColor: '#f1f8f8', alignItems: 'center', justifyContent: 'center' },
  bigFileName: { fontWeight: '800' },
  fileMetaSmall: { color: '#666', marginTop: 4, fontSize: 12 },
  previewActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }
  ,
  empty: { alignItems: 'center', marginTop: 24 },
  emptyText: { marginTop: 12, color: '#999', fontWeight: '700' },
  thumbWrap: { flex: 1, margin: 6, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2 },
  thumb: { width: '100%', height: 140 },
  thumbMeta: { padding: 8, borderTopWidth: 1, borderTopColor: '#f1f6f6' },
  thumbTitle: { fontWeight: '700' },
  thumbType: { color: '#666', marginTop: 4, fontSize: 12 },
  thumbActions: { position: 'absolute', top: 8, right: 8, flexDirection: 'row' },
  iconBtn: { marginLeft: 8, backgroundColor: '#fff', padding: 6, borderRadius: 8, elevation: 2 }
});
