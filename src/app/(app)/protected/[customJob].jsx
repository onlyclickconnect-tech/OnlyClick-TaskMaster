// File: JobRequestCard.js

import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import Text from "../../../components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
// Dummy job request data
const jobRequest = {
  image: "https://res.cloudinary.com/dsjcgs6nu/image/upload/v1751557197/ChatGPT_Image_Jul_3_2025_08_23_43_AM_p72ebu.png", // Replace with actual image if needed
  title: "Urgent Help Needed – Wire Snapped in Living Room",
  description:
    "Hey, I need an electrician asap. One of the wires behind my TV unit just snapped—probably from wear and tear. The power's gone from two plug points, and I'm worried it might be risky. Please send someone who can fix internal wiring and check for safety issues.",
  location: "LH-1, VIT-AP University, Inavolu, AP Secretariat",
  preferredTime: "3:00 PM - 7:00 PM",
};

export default function JobRequestCard() {
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [amount, setAmount] = useState("");

  const handleAcceptJob = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }
    
    Alert.alert(
      "Job Accepted", 
      `You have accepted this job for ₹${amount}`,
      [
        {
          text: "OK",
          onPress: () => {
            setShowAmountModal(false);
            setAmount("");
            // Navigate back or to jobs list
          }
        }
      ]
    );
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Image */}
      <Image source={{ uri: jobRequest.image }} style={styles.image} />

      {/* Title */}
      <Text style={styles.title}>{jobRequest.title}</Text>

      {/* Description */}
      <Text style={[styles.description, { lineHeight: 25 }]}>
        {jobRequest.description}
      </Text>

      {/* Location */}
      <View
        style={{
          gap: 10,
          borderWidth: 1,
          borderColor: "#b3b3b3",
          paddingVertical: 10,
          paddingHorizontal: 5,
          borderRadius: 10,
          top: 10,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="location-outline" size={18} color="red" />
            <Text style={{ fontWeight: "bold" }}>Location:</Text>
          </View>
          <Text style={styles.infoText}>{jobRequest.location}</Text>
        </View>

        {/* Preferred Time */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="time-outline" size={18} color="red" />
            <Text style={{ fontWeight: "bold" }}>Preferred Time:</Text>
          </View>
          <Text style={styles.infoText}>{jobRequest.preferredTime}</Text>
        </View>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.acceptBtn}
        onPress={() => {
          setShowAmountModal(true);
        }}
      >
        <Text style={styles.acceptText}>ACCEPT</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.declineBtn}>
        <Text style={styles.declineText}>DECLINE</Text>
      </TouchableOpacity>

      {/* Amount Input Modal */}
      <Modal
        visible={showAmountModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAmountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Your Quote</Text>
            <Text style={styles.modalSubtitle}>
              How much would you charge for this job?
            </Text>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                keyboardType="numeric"
                autoFocus={true}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAmountModal(false);
                  setAmount("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAcceptJob}
              >
                <Text style={styles.confirmButtonText}>Accept Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#ccc",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  acceptBtn: {
    backgroundColor: "#4CAF50",
    top: 20,
    paddingVertical: 12,
    borderRadius: 15,
    marginRight: 8,
    alignItems: "center",
  },
  declineBtn: {
    borderColor: "red",
    borderWidth: 1.5,
    paddingVertical: 12,
    top: 25,
    borderRadius: 15,
    alignItems: "center",
  },
  acceptText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  declineText: {
    color: "red",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 350,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 25,
    backgroundColor: "#f8f9fa",
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
