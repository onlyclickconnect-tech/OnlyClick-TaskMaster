import { ScrollView, StyleSheet,View } from "react-native";
import Text from "../ui/Text";
import React from "react";
import PlatformUpdateBox from "./PlatformUpdateBox";

export default function PlatformUpdate() {
  const notifications = [];
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 15,
          top: 20,
          alignItems: "center",
        }}
      >
        {notifications.map((notification, index) => (
          <PlatformUpdateBox key={index} notification={notification} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
