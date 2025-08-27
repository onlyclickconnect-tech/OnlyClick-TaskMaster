import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

function Badge({
  badgeColor = "red",
  withNumbers = false,
  hasBadge = true,
  numbers = 0,
  element,
  style,
  badgeSize = 15,
  textColor = "white",
  pressable = false,
  onPress = () => {
    console.log("Pressed");
  },
  badgeTop = -7.5,
  badgeRight = -7.5,
}) {
  return pressable ? (
    <TouchableOpacity
      onPress={onPress}
      style={[
        style,
        { display: "flex", justifyContent: "center", alignItems: "center" },
      ]}
    >
      <View
        style={[
          {
            position: "absolute",
            backgroundColor: badgeColor,
            minHeight: badgeSize,
            minWidth: badgeSize,
            top: badgeTop,
            right: badgeRight,
           paddingHorizontal:2,
           paddingVertical:1,
           justifyContent:"center",
           alignContent:"center",
            borderRadius: badgeSize / 2,
          },
        ]}
      >
        {withNumbers && (
          <Text
            style={{
              color: textColor,
              textAlign: "center",
              alignSelf: "center",
              fontWeight: "bold",
            }}
          >
            {numbers < 99 ? numbers : "99+"}
          </Text>
        )}
      </View>
      {element}
    </TouchableOpacity>
  ) : (
    <View
      style={[
        style,
        { display: "flex", justifyContent: "center", alignItems: "center" },
      ]}
    >
      <View
        style={{
          position: "absolute",
          backgroundColor: badgeColor,
          height: badgeSize,
          width: badgeSize,
          top: { badgeTop },
          right: { badgeRight },
          
          borderRadius: badgeSize / 2,
        }}
      >
        {withNumbers && (
          <Text
            style={{
              color: textColor,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {numbers < 99 ? numbers : "99+"}
          </Text>
        )}
      </View>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {element}
      </View>
    </View>
  );
}

export default Badge;
