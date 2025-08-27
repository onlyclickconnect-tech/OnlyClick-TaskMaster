import { FontAwesome } from '@expo/vector-icons';
import { useRef, useState } from "react";
import { Animated, Dimensions, Easing, StyleSheet, TextInput, View } from "react-native";
import useCurrentUserDetails from "../../hooks/useCurrentUserDetails";

const screenWidth = Dimensions.get("window").width;

const ProfileForm = () => {
    const { phone, address, email} = useCurrentUserDetails();
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

  const AnimatedLabel = ({ fieldName, labelText }) => {
    const translateY = animValues[fieldName].interpolate({
      inputRange: [0, 1],
      outputRange: [20, -10]
    });

    const fontSize = animValues[fieldName].interpolate({
      inputRange: [0, 1],
      outputRange: [16, 14]
    });

    const color = animValues[fieldName].interpolate({
      inputRange: [0, 1],
      outputRange: ['#808080', '#0097B3']
    });

    return (
      <Animated.Text style={[
        styles.placeholderLabel,
        {
          transform: [{ translateY }],
          fontSize,
          color
        }
      ]}>
        {labelText}
      </Animated.Text>
    );
  };

  const renderInputField = (name, icon, keyboardType = 'default', additionalProps = {}) => (
    <View style={styles.inputGroup}>
      <AnimatedLabel fieldName={name} labelText={name.split(/(?=[A-Z])/).join(' ')} />
      <View style={styles.inputWrapper}>
        <FontAwesome name={icon} size={18} color="#808080" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={formData[name]}
          onChangeText={(text) => handleInputChange(name, text)}
          onFocus={() => handleInputFocus(name)}
          onBlur={() => handleInputBlur(name)}
          keyboardType={keyboardType}
          {...additionalProps}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderInputField('PhoneNumber', 'phone', 'phone-pad')}
      {renderInputField('PinCode', 'lock', 'number-pad', { maxLength: 6 })}
      {renderInputField('Address', 'map-marker', 'default', { multiline: true })}
      {renderInputField('Email', 'envelope', 'Email-Address', { autoCapitalize: 'none' })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  inputGroup: {
    position: "relative",
    marginBottom: 20,
  },
  placeholderLabel: {
    position: "absolute",
    left: 40,
    zIndex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    position: "absolute",
    left: 16,
    zIndex: 2,
  },
  input: {
    width: screenWidth * 0.9,
    height: 66,
    borderWidth: 1,
    borderColor: "#8080805c",
    borderRadius: 12,
    paddingLeft: 48,
    fontSize: 16,
    backgroundColor: "#fff",
    alignSelf: "center",
    color: "#333",
  },
});

export default ProfileForm;