import { ScrollView, StyleSheet, View } from "react-native";
import Text from "../ui/Text";
import React from "react";
import JobAlertBox from "./JobAlertBox";

export default function JobAlert() {
  const notifications = [];
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "30%",
            borderWidth: 1,
            height: 1,
            borderColor: "#b3b3b3",
          }}
        ></View>
        <Text style={{ color: "b3b3b3" }}>New Requests</Text>
        <View
          style={{
            width: "30%",
            borderWidth: 1,
            height: 1,
            borderColor: "#b3b3b3",
          }}
        ></View>
      </View>
      <View style={{ flex: 1, paddingHorizontal: 15 }}>
        {notifications.map((notification, index) => (
          <JobAlertBox key={index} notification={notification} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
