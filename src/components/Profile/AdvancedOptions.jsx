import { FontAwesome } from '@expo/vector-icons';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const screenWidth = Dimensions.get("window").width;

const AdvancedOptions = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.optionButton} onPress={() => {}}>
        <View style={styles.buttonContent}>
          <FontAwesome name="credit-card" size={18} color="#808080" style={styles.icon} />
          <Text style={styles.buttonText}>Bank Details</Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color="#808080" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={() => {}}>
        <View style={styles.buttonContent}>
          <FontAwesome name="calendar-check-o" size={18} color="#808080" style={styles.icon} />
          <Text style={styles.buttonText}>Subscriptions</Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color="#808080" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.optionButton} onPress={() => {}}>
        <View style={styles.buttonContent}>
          <FontAwesome name="history" size={18} color="#808080" style={styles.icon} />
          <Text style={styles.buttonText}>Booking History</Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color="#808080" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  optionButton: {
    width: screenWidth * 0.9,
    height: 66,
    borderWidth: 1,
    borderColor: '#8080805c',
    borderRadius: 12,
    paddingHorizontal: 40,
    fontSize: 16,
    backgroundColor: "#fff",
    alignSelf: "center",
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  buttonText: {
    fontSize: 16,
    color: '#808080',
  },
});

export default AdvancedOptions;