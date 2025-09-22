import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CustomAlert({ 
  visible, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'warning', 'error', 'info'
  buttons = [], // Array of button objects: { text, onPress, style }
  showCancel = true,
  cancelText = 'Cancel',
  jobDetails = null, // Optional job details to display
  processing = false // Show processing state
}) {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getAlertIconName = (type) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'alert-circle';
      case 'error': return 'close-circle';
      case 'info': return 'information-circle';
      default: return 'information-circle';
    }
  };

  const getAlertIconColor = (type) => {
    switch (type) {
      case 'success': return '#27ae60';
      case 'warning': return '#f39c12';
      case 'error': return '#e74c3c';
      case 'info': return '#4ab9cf';
      default: return '#4ab9cf';
    }
  };

  const getProcessingIcon = () => {
    return (
      <Animated.View style={[styles.processingIcon, { backgroundColor: getAlertIconColor(type) }]}>
        <Ionicons name="time" size={24} color="#fff" />
      </Animated.View>
    );
  };

  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    if (button.closeOnPress !== false) {
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityValue }]}>
        <Animated.View 
          style={[
            styles.alertContainer, 
            { transform: [{ scale: scaleValue }] }
          ]}
        >
          {/* Header with Icon */}
          <View style={styles.header}>
            {processing ? (
              getProcessingIcon()
            ) : (
              <View style={[styles.iconContainer, { backgroundColor: getAlertIconColor(type) }]}>
                <Ionicons
                  name={getAlertIconName(type)}
                  size={28}
                  color="#fff"
                />
              </View>
            )}
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Job Details (if provided) */}
          {jobDetails && (
            <View style={styles.jobDetailsContainer}>
              <View style={styles.jobDetailRow}>
                <Ionicons name="briefcase" size={16} color="#4ab9cf" />
                <Text style={styles.jobDetailText}>{jobDetails.serviceName}</Text>
              </View>
              <View style={styles.jobDetailRow}>
                <Ionicons name="person" size={16} color="#4ab9cf" />
                <Text style={styles.jobDetailText}>{jobDetails.customerName}</Text>
              </View>
              <View style={styles.jobDetailRow}>
                <Ionicons name="location" size={16} color="#4ab9cf" />
                <Text style={styles.jobDetailText} numberOfLines={2}>{jobDetails.address}</Text>
              </View>
              <View style={styles.jobDetailRow}>
                <Ionicons name="cash" size={16} color="#4ab9cf" />
                <Text style={styles.jobDetailText}>{jobDetails.payment}</Text>
              </View>
            </View>
          )}

          {/* Buttons */}
          {!processing && (
            <View style={styles.buttonContainer}>
              {showCancel && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
              
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' ? styles.cancelButton : styles.primaryButton,
                    button.style === 'destructive' ? styles.destructiveButton : null
                  ]}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.8}
                >
                  <Text 
                    style={[
                      button.style === 'cancel' ? styles.cancelButtonText : styles.primaryButtonText,
                      button.style === 'destructive' ? styles.destructiveButtonText : null
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  processingIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  jobDetailsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  jobDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobDetailText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  primaryButton: {
    backgroundColor: '#4ab9cf',
  },
  destructiveButton: {
    backgroundColor: '#e74c3c',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  destructiveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});