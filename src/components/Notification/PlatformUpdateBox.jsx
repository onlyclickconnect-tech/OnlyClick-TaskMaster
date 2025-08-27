import {
  Image,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

export default function PlatformUpdateBox({ notification }) {
  return (
    <View
      style={{
        width: "100%",
        height: 140,
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
          width: "60%",
          height: "85%",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontWeight: "bold" }}>{notification.title}</Text>
        <Text style={{ fontSize: 12.6, color: "black" }}>
          {notification.description.length < 70
            ? notification.description
            : notification.description.slice(0, 70) + "..."}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={{ fontWeight: "bold", fontSize: 11, color: "#b3b3b3" }}
          >
            {notification.date}
          </Text>
          <TouchableOpacity>
            <Text
              style={{ fontWeight: "bold", fontSize: 12.5, color: "#3ea2bb" }}
            >
              Read More
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          width: "30%",
          height: "80%",
          backgroundColor: "#e6e6e6",
          borderRadius: "10%",
          overflow: "hidden",
        }}
      >
        <Image source={{ uri: notification.image }} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
