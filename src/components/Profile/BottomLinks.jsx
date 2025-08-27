import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const BottomLinks = () => {
  return (
    <View style={styles.container}>
      <View style={styles.helpSection}>
        <Text style={styles.helpText}>Need help?</Text>
      </View>
      
      <TouchableOpacity style={styles.chatButton} onPress={() => {}}>
        <FontAwesome name="comments" size={18} color="white" style={styles.chatIcon} />
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
      
      <View style={styles.linksRow}>
        <TouchableOpacity style={styles.linkItem} onPress={() => {}}>
          <FontAwesome name="info-circle" size={14} color="#808080" />
          <Text style={styles.linkText}>About Us</Text>
        </TouchableOpacity>

        
        <TouchableOpacity style={styles.linkItem} onPress={() => {}}>
          <FontAwesome name="file-text" size={14} color="#808080" />
          <Text style={styles.linkText}>Terms & Conditions</Text>
        </TouchableOpacity>
        
        
        <TouchableOpacity style={styles.linkItem} onPress={() => {}}>
          <FontAwesome name="shield" size={14} color="#808080" />
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'white',
    marginTop: 20,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  helpIcon: {
    marginRight: 8,
  },
  helpText: {
    fontSize: 15,
    fontWeight: '300',
    color: '#808080',
  },
  chatButton: {
    flexDirection: 'row',
    backgroundColor: '#0097B3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 40,
    marginBottom: 24,
    width: '100%',
    maxWidth: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIcon: {
    marginRight: 8,
    
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '300',
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    
  },
  linkText: {
    color: '#808080',
    fontSize: 14,
    marginLeft: 4,
  },
});

export default BottomLinks;