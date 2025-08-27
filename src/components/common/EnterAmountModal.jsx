import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";
import useDimension from "../../hooks/useDimensions";
import { useModal } from "../../context/ModalProvider";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
const CustomServiceModal = () => {
  const { isEnterAmountModalOpen, setIsEnterAmountModalOpen } = useModal();
  const { screenHeight, screenWidth } = useDimension();
  const router = useRouter();
  const onClose = () => {
    setIsEnterAmountModalOpen(false);
  };
  const data = {
    serviceName: "Custom Service",
    customerName: "Customer 1",
    location: "123 Any Street, Anytown, USA 12345 ",
    hashtags: [
      "#CustomService",
      "#Customer1",
      "#ServiceModal",
      "#CustomService",
      "#Customer1",
      "#ServiceModal",
    ],
  };
  const [timer, setTimer] = useState(15);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    const clearTimer = setTimeout(() => {
      clearInterval(timer);
      //   onClose();
    }, 15000);

    return () => {
      clearTimeout(clearTimer);
    };
  }, []);
  return (
    <Modal
      visible={isEnterAmountModalOpen}
      onRequestClose={onClose}
      animationType="slide"
      transparent={true}
    >
      <Pressable
        onPress={() => {
          onClose();
        }}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 3,
          backgroundColor: "#b3b3b3c0",
        }}
      >
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
          }}
          style={[
            styles.container,
            {
              height: screenHeight * 0.6,
              width: screenWidth * 0.95,
              borderWidth: 3,
              borderColor: "#3898b3",
            },
          ]}
        >
          {/* your modal content here */}
          {/* 1st part */}
          <View
            style={{
              height: "15%",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderBottomWidth: 2,
              borderColor: "#b3b3b3",
            }}
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: "bold",
                color: "#3898b3",
                textAlign: "center",
              }}
            >
              Enter Amount!
            </Text>
          </View>

          {/* 2nd part */}
          <View
            style={{
              height: "60%",
              width: "100%",
              paddingHorizontal: 10,
              paddingVertical: 10,
              gap: 10,
              justifyContent: "space-between",
            }}
          >
            <View style={{ gap: 15 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 70,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 15.5 }}>Service:</Text>
                <Text
                  style={{
                    fontSize: 15.5,
                    fontWeight: "bold",
                    color: "#3898b3",
                  }}
                >
                  {data.serviceName}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 70,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 15.5 }}>Customer Name:</Text>
                <Text style={{ fontSize: 15.5, fontWeight: "bold" }}>
                  {data.customerName}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 70,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 15.5 }}>Location:</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15.5, fontWeight: "bold" }}>
                    {data.location}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 15.5 }}>Tags:</Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {data.hashtags.map((tag, key) => {
                    return (
                      <Text
                        key={key}
                        style={{
                          fontSize: 11.5,
                          fontWeight: "bold",
                          color: "#3898b3",
                        }}
                      >
                        {tag}
                      </Text>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={{ height: "25%" }}>
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                Enter Price:
              </Text>
              <TextInput
                placeholder="Rs. _ _ _ _ _"
                fontSize={18}
                fontWeight="bold"
                textAlign="center"
                placeholderTextColor={"green"}
                style={{
                  borderWidth: 1,
                  borderColor: "#b3b3b3",
                  width: "70%",
                  alignSelf: "center",
                }}
              />
            </View>

            {/* 3rd part */}
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
                top: 15,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setIsEnterAmountModalOpen(false);
                  router.navigate({
                    pathname: "/protected/(tabs)/Home",
                  });
                }}
                style={{
                  width: "90%",
                  backgroundColor: "#3898b3",
                  padding: 10,
                  borderRadius: 30,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 17, fontWeight: "bold" }}
                >
                  Submit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsEnterAmountModalOpen(false);
                }}
                style={{
                  width: "90%",
                  backgroundColor: "white",
                  padding: 10,
                  borderRadius: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "red",
                }}
              >
                <Text
                  style={{ color: "red", fontSize: 17, fontWeight: "bold" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "white",
  },
});

export default CustomServiceModal;
