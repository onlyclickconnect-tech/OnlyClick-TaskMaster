import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
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
import headerStyle from "../../styles/Home/headerStyle";
import Badge from "../common/Badge";

function Header() {
  const [hasNotification, setHasNotification] = useState(false);
  const { screenHeight, screenWidth } = useDimension();
  const [search, setSearch] = useState("");
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
            <TouchableOpacity style={styles.locationText} onPress={changeAddress}>
              {/*TODO:  */}
              <Entypo
                name="location-pin"
                size={21} // Reduced from 24
                color="#f8bd00"
              />
              <Text style={{ fontSize: 12, color: "white", flex: 1, fontWeight: "400" }}>
                {selectedLocation || "Tap to set location"}
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
              onChangeText={setSearch}
              returnKeyType="search"
              placeholderTextColor="grey"
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
            <Ionicons name="person-sharp" size={28} color="#07689f" borderRadius={15} padding={5} backgroundColor="#ffffffff" />
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
