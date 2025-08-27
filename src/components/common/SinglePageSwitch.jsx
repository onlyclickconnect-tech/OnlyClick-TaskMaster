import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useState } from "react";

export default function SinglePageSwitch({
  leftText,
  rightText,
  leftElement,
  rightElement,
}) {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      gap: 50,
      alignItems: "center",
    },
  });

  const [isLeft, setIsLeft] = useState(true);
  return (
    <View style={styles.container}>
      <View
        style={{
          width: "90%",
          backgroundColor: "#e6e6e6",
          flexDirection: "row",
          justifyContent: "space-between",
          top: 30,
          borderRadius: 20,
          overflow: "hidden",
          //   paddingHorizontal: 20,
          // paddingVertical: 10,
        }}
      >
        <Pressable
          onPress={() => setIsLeft(true)}
          style={{
            width: "50%",
            height: "100%",
            paddingVertical: 15,
          }}
        >
          <Text
            style={{ textAlign: "center", color: isLeft ? "white" : "black" }}
          >
            {leftText.toString()}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setIsLeft(false)}
          style={{
            width: "50%",
            height: "100%",
            paddingVertical: 15,
          }}
        >
          <Text
            style={{ textAlign: "center", color: isLeft ? "black" : "white" }}
          >
            {rightText.toString()}
          </Text>
        </Pressable>
        <View
          style={{
            height: "82%",
            width: "50%",
            backgroundColor: "#3ea2bb",
            position: "absolute",
            borderRadius: 20,
            margin: 4,
            zIndex: -1,
            right: isLeft ? "47%" : "0%",
          }}
        ></View>
      </View>
      {isLeft ? leftElement : rightElement}
    </View>
  );
}
