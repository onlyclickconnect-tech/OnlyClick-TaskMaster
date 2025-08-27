import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import CustomServiceModal from "../../../components/common/CustomServiceModal";
import EnterAmountModal from "../../../components/common/EnterAmountModal";
import ServiceModal from "../../../components/common/ServiceModal";

export default function RootLayout() {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <Stack initialRouteName="(tabs)">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="Notifications" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen
          name="[customJob]"
          options={{
            headerTitle: "Custom Job",
            headerLeft: () => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    router.back();
                  }}
                  style={{ left: 10, marginRight: 50 }}
                >
                  <Ionicons name="arrow-back" size={25} color="black" />
                </TouchableOpacity>
              );
            },
          }}
        />
      </Stack>
      <ServiceModal />
      <CustomServiceModal />
      <EnterAmountModal />
    </View>
  );
}
