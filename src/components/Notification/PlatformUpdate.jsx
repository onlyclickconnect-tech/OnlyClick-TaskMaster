import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import PlatformUpdateBox from "./PlatformUpdateBox";

export default function PlatformUpdate() {
  const notifications = [
    {
      title: "New Jobs Available",
      description:
        "We have new jobs available for you. Please check your notifications.",
      date: "Today",
      image: "https://picsum.photos/200/300",
    },
    {
      title: "New Jobs Available",
      description:
        "We have new jobs available for you. Please check your notifications.We have new jobs available for you. Please check your notifications.",
      date: "Tomorrow",
      image: "https://picsum.photos/201/301",
    },
    {
      title: "New Jobs Available",
      description:
        "We have new jobs available for you. Please check your notifications.",
      date: "Yesterday",
      image: "https://picsum.photos/202/302",
    },
    {
      title: "New Jobs Available",
      description:
        "We have new jobs available for you. Please check your notifications.We have new jobs available for you. Please check your notifications.",
      date: "Tomorrow",
      image: "https://picsum.photos/201/301",
    },
    {
      title: "New Jobs Available",
      description:
        "We have new jobs available for you. Please check your notifications.We have new jobs available for you. Please check your notifications.",
      date: "Tomorrow",
      image: "https://picsum.photos/201/301",
    },
  ];
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
