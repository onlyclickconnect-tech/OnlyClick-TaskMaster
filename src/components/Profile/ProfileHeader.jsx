import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import useDimension from "../../hooks/useDimensions";

const ProfileHeader = ({ isGeneral = true, setIsGeneral = () => {} }) => {
  const sliderPosition = useRef(new Animated.Value(isGeneral ? 0 : 1)).current;
  const { screenWidth } = useDimension();
const toggleWidth = Math.min(screenWidth * 0.9, 340);

const sliderStyle = {
  width: toggleWidth * 0.42,
  transform: [{
    translateX: sliderPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [toggleWidth * 0.03, toggleWidth * 0.45],
    })
  }]
};

  useEffect(() => {
    Animated.timing(sliderPosition, {
      toValue: isGeneral ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [isGeneral]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/images/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.profileSection}>
        <View style={styles.profileIconContainer}>
          <FontAwesome name="user" size={60} color="gray" />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>{"User's Name"}</Text>
          <Text style={styles.userid}>user id</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toggleContainer}>
        <Animated.View style={[styles.slider, sliderStyle]} />
        
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setIsGeneral(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, isGeneral && styles.activeToggleText]}>
            General
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setIsGeneral(false)}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, !isGeneral && styles.activeToggleText]}>
            Advanced
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 50,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
    width: '85%',
    maxWidth: 400,
  },
  profileIconContainer: {
    width: 131,
    height: 131,
    borderRadius: 65.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  username: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: 'black',
    marginBottom: 4,
  },
  userid: { 
    color: "gray", 
    fontSize: 14,
    marginBottom: 8,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#0097B3',
    fontSize: 14,
  },
  toggleContainer: { 
    flexDirection: "row",
    width: '94%',
    maxWidth: 340,
    height: 66,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
  },
  
  slider: {
    position: 'absolute',
    height: 51,
    backgroundColor: '#0097B3',
    borderRadius: 38,
    marginTop: 7.5,
    marginLeft: 3,
  },
  
  
  toggleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  toggleText: {
    color: '#616161',
    fontSize: 16,
    fontWeight: '500',
  },
  activeToggleText: {
    color: 'white',
  },
});

export default ProfileHeader;