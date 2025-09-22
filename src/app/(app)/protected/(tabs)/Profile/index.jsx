import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../../../context/AuthProvider';

import AppHeader from '../../../../../components/common/AppHeader';

export default function ProfilePage() {
  const { user, logout, updateProfile, isLoggedIn, userData } = useAuth();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [editablePhone, setEditablePhone] = useState('');
  const [editableCategory, setEditableCategory] = useState('');
  const CATEGORIES = ['Plumber', 'Electrician', 'Carpentry', 'Cleaning', 'Delivery', 'Other'];
  const [displayUser, setDisplayUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const getdata = async () => {
      const { data, error } = await supabase.auth.session();

      console.error("data", data.session);
      console.error("error", error);
    }
    getdata();
  }, [isLoggedIn,user])

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setCameraPermission(cameraStatus.status === 'granted');
      setHasCameraPermission(cameraStatus.status === 'granted');
    })();
    // initialise editable fields from user and displayUser
    if (user) {
      setEditableName(userData?.name || '');
      setEditablePhone(userData?.ph_no || '');
      setEditableCategory(userData?.category || '');
      setProfileImageUri(userData?.tm_profilepic || null);
      setDisplayUser(userData);
    }
  }, []);

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImageUri(result.assets[0].uri);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImageUri(result.assets[0].uri);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const showImagePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            openCamera();
          } else if (buttonIndex === 2) {
            openImageLibrary();
          }
        }
      );
    } else {
      Alert.alert(
        'Update Profile Picture',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: openCamera },
          { text: 'Choose from Library', onPress: openImageLibrary },
        ]
      );
    }
  };

  // When image changes via picker, also keep it in editable state
  useEffect(() => {
    if (profileImageUri) {
      // No-op here: profileImageUri already used in save
    }
  }, [profileImageUri]);

  const handleSaveProfile = async () => {
    // save and reflect immediately in UI
    setIsSaving(true);
    try {
      const payload = {
        name: editableName,
        phoneNumber: editablePhone,
        category: editableCategory,
        profileImage: profileImageUri,
      };

      const res = await updateProfile(payload);
      // optimistic update: reflect changes locally even if backend is slow
      setDisplayUser((prev) => ({ ...(prev || {}), ...payload }));

      // if backend returned the updated user, prefer that
      if (res && (res.data || res.user)) {
        const serverUser = res.data || res.user;
        setDisplayUser(serverUser);
        // sync editable fields with server returned values
        setEditableName(serverUser.name || payload.name || '');
        setEditablePhone(serverUser.phoneNumber || payload.phoneNumber || '');
        setEditableCategory(serverUser.category || payload.category || '');
        setProfileImageUri(serverUser.profileImage || payload.profileImage || profileImageUri);
      }

      if (res && res.success !== false) {
        Alert.alert('Success', 'Profile updated');
        setEditMode(false);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // revert local edits
    setEditableName(displayUser?.name || userData?.name || '');
    setEditablePhone(displayUser?.phoneNumber || user?.phoneNumber || '');
    setEditableCategory(displayUser?.category || user?.category || '');
    setProfileImageUri(displayUser?.profileImage || user?.profileImage || null);
    setEditMode(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/(app)/auth/sign-in');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  // Frontend-only delete account handler: confirm, simulate, then logout and redirect
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account. This action cannot be undone. (Frontend-only stub) Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              // Simulate network/delete delay for UX
              await new Promise((r) => setTimeout(r, 700));
              // Perform local logout/cleanup
              await logout();
              // Redirect to sign-in screen
              router.replace('/(app)/auth/sign-in');
              Alert.alert('Account deleted', 'Your account has been deleted (frontend-only).');
            } catch (err) {
              console.error('Delete account error:', err);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const profileMenuItems = [
    { id: 2, title: 'Work History', subtitle: 'View your completed jobs', icon: 'briefcase-outline', onPress: () => router.push('/(app)/protected/(tabs)/Profile/WorkHistory') },
    // { id: 3, title: 'Payment Methods', subtitle: 'Manage your payment methods', icon: 'card-outline', onPress: () => router.push('/(app)/protected/(tabs)/Profile/PaymentMethods') },
    { id: 4, title: 'Documents', subtitle: 'Manage your verification documents', icon: 'document-text-outline', onPress: () => router.push('/(app)/protected/(tabs)/Profile/Documents') },
    { id: 5, title: 'Help & Support', subtitle: 'Get help and contact support', icon: 'help-circle-outline', onPress: () => router.push('/(app)/protected/(tabs)/Profile/HelpSupport') },
  ];

  const handleBack = () => router.back();


  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Profile" showBack onBack={handleBack} />
      <ScrollView
        style={[styles.container, { marginTop: screenHeight * 0.00 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: profileImageUri || displayUser?.profileImage || user?.profileImage ||
                  'https://via.placeholder.com/120/4ab9cf/ffffff?text=User',
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton} onPress={showImagePicker}>
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            {/* live preview header - updates from state while editing */}
            {(() => {
              const displayName = editMode ? (editableName || displayUser?.name || userData?.name || 'TaskMaster User') : (displayUser?.name || userData?.name || 'TaskMaster User');
              const displayCategory = editMode ? (editableCategory || displayUser?.category || user?.category || 'Service Provider') : (displayUser?.category || user?.category || 'Service Provider');
              const displayPhone = editMode ? (editablePhone || displayUser?.phoneNumber || user?.phoneNumber || '+91 XXXXXXXXXX') : (displayUser?.phoneNumber || user?.phoneNumber || '+91 XXXXXXXXXX');
              const displayImage = editMode ? (profileImageUri || displayUser?.profileImage || user?.profileImage) : (displayUser?.profileImage || user?.profileImage || profileImageUri);

              return (
                <>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{displayName}</Text>
                    <TouchableOpacity onPress={() => setEditMode(true)} style={styles.editIconSmall}>
                      <Ionicons name="pencil" size={16} color="#4ab9cf" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.userCategory}>{displayCategory}</Text>
                  <Text style={styles.userPhone}>{displayPhone}</Text>

                  {/* Status Badge */}
                  <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                    <Text style={styles.statusText}>Active</Text>
                  </View>

                  {/* avatar is shown above with camera FAB; no duplicate here */}

                  {/* Inputs appear below when editing */}
                  {editMode && (
                    <View style={styles.inputCard}>
                      <Text style={styles.inputLabel}>Full name</Text>
                      <TextInput
                        style={[styles.input, isSaving && styles.inputDisabled]}
                        value={editableName}
                        onChangeText={setEditableName}
                        placeholder="Full name"
                        editable={!isSaving}
                      />

                      <Text style={[styles.inputLabel, { marginTop: 12 }]}>Category</Text>
                      <View style={styles.chipsRow}>
                        {CATEGORIES.map((c) => (
                          <TouchableOpacity
                            key={c}
                            onPress={() => !isSaving && setEditableCategory(c)}
                            style={[styles.chip, c === editableCategory && styles.chipSelected]}
                          >
                            <Text style={[styles.chipText, c === editableCategory && styles.chipTextSelected]}>{c}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <Text style={[styles.inputLabel, { marginTop: 12 }]}>Phone</Text>
                      <TextInput
                        style={[styles.input, isSaving && styles.inputDisabled]}
                        value={editablePhone}
                        onChangeText={setEditablePhone}
                        placeholder="Phone number"
                        keyboardType="phone-pad"
                        editable={!isSaving}
                      />

                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={[styles.saveButton, isSaving && styles.buttonDisabled]}
                          onPress={handleSaveProfile}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text style={styles.actionButtonText}>Save</Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.cancelButton, isSaving && styles.buttonDisabledOutline]}
                          onPress={handleCancelEdit}
                          disabled={isSaving}
                        >
                          <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              );
            })()}
          </View>
        </View>

        {/* Stats Section */}
        {/* <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumberSmall} numberOfLines={1} adjustsFontSizeToFit allowFontScaling={false}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumberSmall} numberOfLines={1} adjustsFontSizeToFit allowFontScaling={false}>127</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit allowFontScaling={false}>₹45,670</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
        </View> */}

        {/* Settings Section */}
        {/* <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="notifications-outline" size={24} color="#4ab9cf" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>
                  Receive job alerts and updates
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e0e0e0', true: '#4ab9cf' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="location-outline" size={24} color="#4ab9cf" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Location Services</Text>
                <Text style={styles.settingSubtitle}>
                  Allow location access for nearby jobs
                </Text>
              </View>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: '#e0e0e0', true: '#4ab9cf' }}
              thumbColor="#fff"
            />
          </View>
        </View> */}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          {profileMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuContent}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon} size={24} color="#4ab9cf" />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Delete Account Button (frontend-only) */}
        <TouchableOpacity
          style={[styles.deleteButton, isDeleting && styles.buttonDisabled]}
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={styles.deleteText}>Delete account</Text>
            </>
          )}
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>TaskMaster v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4ab9cf',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 1000,
    paddingTop: 50,
    paddingBottom: 25,
  },
  profileSection: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#4ab9cf',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4ab9cf',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 3,
    borderColor: '#fff',
  },
  fabButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconSmall: {
    marginLeft: 8,
    backgroundColor: '#e8fafb',
    padding: 6,
    borderRadius: 12,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  userCategory: {
    fontSize: 16,
    color: '#4ab9cf',
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputCard: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f6fbfb',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6f6f7',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f8f9',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#4ab9cf',
  },
  chipText: {
    color: '#177a81',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  editButton: {
    marginTop: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e6f6f7',
  },
  editButtonText: {
    color: '#4ab9cf',
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2ac11ce3',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d91e1eff',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelText: {
    color: '#ffffffff',
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: '#67c7cf',
  },
  buttonDisabledOutline: {
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    padding: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4ab9cf',
    marginBottom: 6,
    flexShrink: 1,
  },
  statNumberSmall: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4ab9cf',
    marginBottom: 6,
    flexShrink: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
  },
  settingsSection: {
    marginTop: 25,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  menuSection: {
    marginTop: 25,
    marginHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    marginLeft: 15,
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 25,
    padding: 18,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e74c3c',
    elevation: 2,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
  },
  deleteText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 30,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  /* Fixed header styles */
  fixedHeader: {
    backgroundColor: '#3898B3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4, // Increased spacing for better separation
  },
  backButton: {
    padding: 8, // Increased padding for better touch area
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 28, // Slightly larger font for emphasis
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Balance the back button
  },
  placeholder: {
    width: 34,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8F4F8',
    textAlign: 'center',
    opacity: 0.9,
    marginTop: 4, // Added margin for spacing below title
  },
  filterButton: {
    padding: 8, // Increased padding for better touch area
  },
});
