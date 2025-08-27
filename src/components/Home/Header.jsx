import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  PanResponder,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAppStates } from "../../context/AppStates";
import useCurrentUserDetails from "../../hooks/useCurrentUserDetails";
import useDimension from "../../hooks/useDimensions";
import LocationService from "../../services/locationService";
import headerStyle from "../../styles/Home/headerStyle";
import Badge from "../common/Badge";

function Header() {
  const [hasNotification, setHasNotification] = useState(false);
  const { screenHeight, screenWidth } = useDimension();
  const [search, setSearch] = useState("");
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const { userAddress } = useCurrentUserDetails();
  const { selectedLocation, updateSelectedLocation } = useAppStates();
  const router = useRouter();
  const styles = headerStyle();
  
  const searchService = async () => {
    console.log("user searched");
  };
  
  useEffect(() => {
    if (userAddress && (!selectedLocation || selectedLocation === "Tap to set location")) {
      updateSelectedLocation(userAddress);
    }
    setManualLocation(selectedLocation || "");
  }, [userAddress, selectedLocation]);
  
  // Use LocationService for robust location fetching with fallback
  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      // First, request/check permissions so we can show a clear message if denied
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Location permission is required to auto-detect your location. Please enable it in settings or enter your address manually.'
        );
        setIsLocationLoading(false);
        return;
      }

      // Try direct Expo Location call first (higher chance on some devices)
      let usedAddress = null;
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
          maximumAge: 10000,
          timeout: 10000,
        });
        console.log('direct Location position:', pos);
        if (pos && pos.coords) {
          const rev = await Location.reverseGeocodeAsync({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          console.log('direct reverseGeocode result:', rev);
          if (rev && rev.length > 0) {
            const addr = rev[0];
            usedAddress = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}`.trim();
          } else {
            usedAddress = `Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)}`;
          }
        }
      } catch (directErr) {
        console.warn('direct Location failed, falling back to LocationService:', directErr);
      }

      // If direct method didn't produce an address, use LocationService (singleton) which has fallbacks
      if (!usedAddress) {
        const result = await LocationService.getCurrentLocationWithAddress();
        console.log('locationService result:', result);
        if (result && result.success && result.data) {
          if (result.data.address && result.data.address.trim()) {
            usedAddress = result.data.address.trim();
          } else if (result.data.latitude && result.data.longitude) {
            usedAddress = `Lat: ${result.data.latitude.toFixed(4)}, Lon: ${result.data.longitude.toFixed(4)}`;
          }
        }
      }

      if (usedAddress) {
        updateSelectedLocation(usedAddress);
        setManualLocation(usedAddress);
        setShowLocationModal(false);
      } else {
        Alert.alert('Unable to fetch location', 'Could not determine your location. Please enter it manually.');
      }
    } catch (error) {
      // Log error for debugging
      console.error('getCurrentLocation error:', error);
      Alert.alert('Error', 'Failed to get current location. Please enter it manually.');
    }
    setIsLocationLoading(false);
  };
  
  const saveManualLocation = () => {
    if (manualLocation && manualLocation.trim()) {
      updateSelectedLocation(manualLocation.trim());
      setShowLocationModal(false);
    }
  };
  
  const changeAddress = () => {
    setShowLocationModal(true);
  };

  // Pan responder + animation for swipe-to-dismiss modal
  const pan = useRef(new Animated.Value(0));
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        // only allow dragging down
        if (gestureState.dy > 0) {
          pan.current.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          // animate out and close
          Animated.timing(pan.current, {
            toValue: 1000,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            pan.current.setValue(0);
            setShowLocationModal(false);
          });
        } else {
          // spring back
          Animated.spring(pan.current, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  );

  // reset pan when modal opens
  useEffect(() => {
    if (showLocationModal) {
      pan.current.setValue(0);
    }
  }, [showLocationModal]);
  
  return (
    <>
      {/* Location Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={showLocationModal}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <TouchableOpacity
          style={modalStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocationModal(false)}
        >
          <Animated.View
            style={[
              modalStyles.modalContainer,
              { transform: [{ translateY: pan.current }] },
            ]}
            {...panResponder.current.panHandlers}
            onStartShouldSetResponder={() => true}
          >
            {/* grabber - small bar to indicate swipe-to-close */}
            <View style={modalStyles.grabberContainer} pointerEvents="none">
              <View style={modalStyles.grabber} />
            </View>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>📍 Update Location</Text>
            </View>

            <View style={modalStyles.modalContent}>
              {/* Current Location Option */}
              <TouchableOpacity 
                style={[modalStyles.locationOption, isLocationLoading && modalStyles.locationOptionDisabled]}
                onPress={getCurrentLocation}
                disabled={isLocationLoading}
              >
                <View style={modalStyles.locationOptionLeft}>
                  <View style={modalStyles.locationIconContainer}>
                    <Ionicons 
                      name={isLocationLoading ? "refresh" : "location"} 
                      size={20} 
                      color="#3898B3" 
                    />
                  </View>
                  <View>
                    <Text style={modalStyles.locationOptionTitle}>
                      {isLocationLoading ? "Getting Location..." : "Use Current Location"}
                    </Text>
                    <Text style={modalStyles.locationOptionSubtitle}>
                      Automatically detect your location
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              {/* Manual Location Input */}
              <View style={modalStyles.manualSection}>
                <Text style={modalStyles.sectionTitle}>Enter Location Manually</Text>
                <View style={modalStyles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#666" style={modalStyles.inputIcon} />
                  <TextInput
                    style={modalStyles.textInput}
                    placeholder="Type your address here..."
                    placeholderTextColor="#999"
                    value={manualLocation}
                    onChangeText={setManualLocation}
                    multiline={true}
                    numberOfLines={2}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={modalStyles.buttonContainer}>
                <TouchableOpacity 
                  style={modalStyles.cancelButton}
                  onPress={() => setShowLocationModal(false)}
                >
                  <Text style={modalStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    modalStyles.saveButton,
                    (!manualLocation || !manualLocation.trim()) && modalStyles.saveButtonDisabled
                  ]}
                  onPress={saveManualLocation}
                  disabled={!manualLocation || !manualLocation.trim()}
                >
                  <Text style={modalStyles.saveButtonText}>Save Location</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

    <LinearGradient colors={["#3898B3", "#47adcaff"]} style={styles.header}>
      <View style={styles.locationAndNotification}>
        <View style={styles.location}>
          <Text style={{ fontSize: 14, color: "white", fontWeight: "500" }}>Location</Text>
          <TouchableOpacity style={styles.locationText} onPress={changeAddress}>
            {/*TODO:  */}
            <Entypo 
              name="location-pin" 
              size={21} // Reduced from 24
              color={isLocationLoading ? "#FFE082" : "#f8bd00"} 
            />
            <Text style={{ fontSize: 12, color: "white", flex: 1, fontWeight: "400" }}>
              {isLocationLoading ? "Getting location..." : selectedLocation || "Tap to set location"}
            </Text>
            <AntDesign
              name="down"
              size={11} // Reduced from 12
              style={{ fontWeight: "bold" }}
              color="#f8bd00"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.notification}>
          <Badge
            pressable={true}
            onPress={() => {
              // console.log("Pressed");
              router.navigate("/protected/Notifications");
            }}
            hasBadge={hasNotification}
            style={{
              height: screenHeight * 0.18 * 0.25, // Updated for smaller header
              width: screenWidth * 0.09, // Slightly smaller width
              backgroundColor: "#409aceff",
              border: 1,
              borderRadius: 8, // Increased border radius
            }}
            badgeSize={12} // Reduced badge size
            badgeColor={"red"}
            badgeTop={-4} // Adjusted position
            badgeRight={-4} // Adjusted position
            textColor="white"
            withNumbers={false}
            element={<Ionicons name="notifications" size={25} color="white" />} // Reduced icon size
          />
        </View>
      </View>

      {/* search and profile */}
      <View style={styles.searchAndProfile}>
        <View style={styles.search}>
          <View
            style={{
              height: 25, // Reduced from 30
              width: 25, // Reduced from 30
              position: "absolute",
              left: 20,
              zIndex: 1,
            }}
          >
            <FontAwesome name="search" size={18} color="#30a7c8ff" /> {/* Reduced from 24 */}
          </View>
          <TextInput
            placeholder="Search"
            style={styles.searchText}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            returnKeyType="search"
            placeholderTextColor={"grey"}
            onSubmitEditing={searchService}
          />
        </View>
        <TouchableOpacity
          style={styles.profile}
          onPress={() => {
            // Navigate to the Profile tab in the protected app tabs
            router.push('/(app)/protected/(tabs)/Profile');
          }}
          accessibilityLabel="Open profile"
        >
          <Ionicons name="person-sharp" size={28} color="#07689f"  borderRadius={15} padding={5} backgroundColor="#ffffffff"/>
        </TouchableOpacity>
      </View>
    </LinearGradient>
    </>
  );
}

// Modal Styles
const modalStyles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  grabberContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d3d3d3',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  locationOptionDisabled: {
    opacity: 0.6,
  },
  locationOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  locationOptionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  manualSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 40,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#B3D9FF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
};

export default Header;
