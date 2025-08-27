import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import JobAlertBox from "./JobAlertBox";

export default function JobAlert() {
  const notifications = [
    {
      date: "Today",
      customerName: "User1",
      serviceName: "Service1",
      location: "Very long and tedious location1",
      image: "https://picsum.photos/200/300",
    },
    {
      date: "Tomorrow",
      customerName: "User2",
      serviceName: "Service2",
      location: "Very long and tedious location2",
      image: "https://picsum.photos/201/301",
    },
    {
      date: "Yesterday",
      customerName: "User3",
      serviceName: "Service3",
      location: "Very long and tedious location3",
      image: "https://picsum.photos/202/302",
    },
    {
      date: "Yesterday",
      customerName: "User3",
      serviceName: "Service3",
      location: "Very long and tedious location3",
      image: "https://picsum.photos/203/303",
    },
    {
      date: "Yesterday",
      customerName: "User3",
      serviceName: "Service3",
      location: "Very long and tedious location3",
      image: "https://picsum.photos/204/304",
    },
    {
      date: "Yesterday",
      customerName: "User3",
      serviceName: "Service3",
      location: "Very long and tedious location3",
      image: "https://picsum.photos/205/305",
    },
  ];
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
