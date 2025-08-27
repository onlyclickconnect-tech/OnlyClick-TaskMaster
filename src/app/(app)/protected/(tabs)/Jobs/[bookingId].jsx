import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import useDimension from "../../../../../hooks/useDimensions";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { OtpInput } from "react-native-otp-entry";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function BookingDetail() {
  const [isStarted, setIsStarted] = useState(true);
  const data = {
    dateAndTime: "Thu, Mar 30 at 3:00 PM",
    address: "address",
    phoneNumber: "+91 9876543210",
    totalAmount: "XYZ",
    paymentPending: "XYZ",
  };
  const [otp, setOtp] = useState("");
  const { screenHeight, screenWidth } = useDimension();
  console.log("hello world this is servicedetail page");
  return (
    <View style={{ height: screenHeight, width: screenWidth }}>
      {/* box1 */}
      <View
        style={{
          height: "27%",
          backgroundColor: "white",
          marginVertical: 10,
          paddingVertical: 10,
          paddingHorizontal: 10,
        }}
      >
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>
          Booking Details
        </Text>
        <View
          style={{
            top: 10,
            flexDirection: "row",
            backgroundColor: "white",
            gap: 20,
            alignItems: "center",
            borderBottomWidth: 1,
            paddingVertical: 10,
            borderColor: "#b3b3b3",
          }}
        >
          <View style={{ height: 25, width: 25 }}>
            <Feather name="clock" size={24} color="black" />
          </View>
          <Text>{data.dateAndTime}</Text>
        </View>
        <View
          style={{
            top: 10,
            flexDirection: "row",
            backgroundColor: "white",
            gap: 20,
            alignItems: "center",
            borderBottomWidth: 1,
            paddingVertical: 10,
            borderColor: "#b3b3b3",
          }}
        >
          <View style={{ height: 25, width: 25 }}>
            <Entypo name="location-pin" size={24} color="black" />
          </View>
          <Text>
            Home {">"} {data.address}
          </Text>
        </View>
        <View
          style={{
            top: 10,
            flexDirection: "row",
            backgroundColor: "white",
            gap: 20,
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <View style={{ height: 25, width: 25 }}>
            <FontAwesome name="phone" size={24} color="black" />
          </View>
          <Text>
            User {">"} {data.phoneNumber}
          </Text>
        </View>
      </View>

      {/* box2 */}

      <View
        style={{
          height: "34%",
          backgroundColor: "white",
          paddingHorizontal: 10,
          paddingVertical: 10,
          justifyContent: "space-between",
          // gap: 15,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 ,top:10}}>
          <View style={{ height: 50, width: 50 }}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={50}
              color="#3898b3"
            />
          </View>
          <Text style={{ fontSize: 25, fontWeight: "bold" }}>
            Booking Schedule
          </Text>
        </View>
        <Text style={{ color: "#b3b3b3" }}>
          {!isStarted
            ? " Enter the OTP before starting service"
            : "Enter the OTP after ending service"}
        </Text>

        <View style={{ paddingHorizontal: 20 }}>
          <OtpInput
            numberOfDigits={4}
            focusColor={"#3898b3"}
            theme={{
              pinCodeContainerStyle: {
                height: 50,
                width: 50,
                borderColor: "#3898b3",
              },
              containerStyle: { paddingHorizontal: 20 },
            }}
            type="numeric"
          />
        </View>

        <TouchableOpacity
          style={{
            alignSelf: "center",
            backgroundColor: !isStarted ? "#3898b3" : "#D84516",
            paddingVertical: 5,
            paddingHorizontal: 30,
            borderRadius: 20,
          }}
        >
          {!isStarted ? (
            <Text style={{ fontWeight: "bold", color: "white", fontSize: 20 }}>
              Start
            </Text>
          ) : (
            <Text style={{ fontWeight: "bold", color: "white", fontSize: 20 }}>
              End
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* box3 */}
      {/* box3 */}
      <View
        style={{
          bottom: 0,
          width: "100%",
          top: 10,
          height: "30%",
          backgroundColor: "white",
          padding: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 20 }}>Amount</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <FontAwesome5 name="money-bill-wave" size={24} color="black" />
          <View
            style={{
              marginTop: 10,
              left: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                marginLeft: 10,
              }}
            >
              Rs. {data.totalAmount} Total Amount
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginLeft: 10,
                color: "#3898b3",
              }}
            >
              Rs. {data.paymentPending} Payment Pending
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
