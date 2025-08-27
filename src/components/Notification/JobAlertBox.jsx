import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";

export default function JobAlertBox({ notification }) {
  return (
    <View
      style={{
        width: "100%",
        height: 90,
        padding: 10,
        borderWidth: 2,
        marginVertical: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderColor: "#b3b3b3",
        borderRadius:20
      }}
    >
      <View
        style={{
          width: "20%",
          height: "90%",
          backgroundColor: "#e6e6e6",
          borderRadius: "50%",
          overflow: "hidden",
        }}
      >
        <Image source={{ uri: notification.image }} style={{ flex: 1 }} />
      </View>
      <View
        style={{
          width: "75%",
          left: 20,
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontWeight: "bold" }}>{notification.customerName}</Text>
        <Text style={{ fontWeight: "bold", fontSize: 12.5, color: "#3ea2bb" }}>
          {notification.serviceName}
        </Text>
        <Text style={{ fontSize: 11, color: "#b3b3b3" }}>
          {notification.location}
        </Text>
      </View>
      <Text
        style={{
          position: "absolute",
          top: 0,
          transform: [{ translateY: "-60%" }],
          right: 15,
          backgroundColor: "white",
          paddingHorizontal: 29,
          color: "#b3b3b3",
          fontSize: 12,
        }}
      >
        {notification.date}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({});
