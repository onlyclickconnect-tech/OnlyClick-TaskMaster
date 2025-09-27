import { FontAwesome } from '@expo/vector-icons';
import { useRef, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet,TextInput, View } from "react-native";
import Text from '../ui/Text';

import useCurrentUserDetails from "../../hooks/useCurrentUserDetails";

const screenWidth = Dimensions.get("window").width;

const ProfileForm = () => {
  const { phone, address, email } = useCurrentUserDetails();
  const [formData, setFormData] = useState({
    PhoneNumber: phone || '',
    PinCode: '',
    Address: address || '',
    Email: email || '',
  });

  const animValues = {
    PhoneNumber: useRef(new Animated.Value(0)).current,
    PinCode: useRef(new Animated.Value(0)).current,
    Address: useRef(new Animated.Value(0)).current,
    Email: useRef(new Animated.Value(0)).current
  };

  const animateLabel = (fieldName, toValue) => {
    Animated.timing(animValues[fieldName], {
      toValue,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
  };

  const handleInputFocus = (name) => {
    animateLabel(name, 1);
  };

  const handleInputBlur = (name) => {
    if (!formData[name]) {
      animateLabel(name, 0);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderInputField = (name, icon, placeholder, keyboardType = 'default', additionalProps = {}) => (
    <View style={styles.inputGroup}>
      <FontAwesome name={icon} size={18} color="#0097B3" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={formData[name]}
        onChangeText={(text) => handleInputChange(name, text)}
        onFocus={() => handleInputFocus(name)}
        onBlur={() => handleInputBlur(name)}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#808080"
        {...additionalProps}
      />
    </View>
  );

  return (
    <View>
      <Text style={styles.header}>Profile Details</Text>
      {renderInputField('PhoneNumber', 'phone', 'Phone Number', 'phone-pad')}
      {renderInputField('PinCode', 'lock', 'Pin Code', 'number-pad', { maxLength: 6 })}
      {renderInputField('Address', 'map-marker', 'Address', 'default', { multiline: true })}
      {renderInputField('Email', 'envelope', 'Enter your email', 'email-address', { autoCapitalize: 'none' })}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'left',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});

export default ProfileForm;