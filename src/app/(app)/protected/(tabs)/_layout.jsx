import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, useRouter } from "expo-router";
import { View } from "react-native";
export default function RootLayout() {
  const router = useRouter();
  return (
    <Tabs
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: "#3898b3",
        tabBarLabelStyle: {
          top: 12,
          color: "#a0a0a0",
        },
        tabBarStyle: {
          height: 90,
          paddingTop: 20,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          position: 'absolute',
          overflow: 'hidden',
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          headerShown: false,
          animation: "shift",
          tabBarLabelStyle: { top: 12 },
          tabBarIcon: ({ focused }) => {
            return (
              <View
                style={{
                  height: 50,
                  width: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 25,
                  backgroundColor: focused ? "#e6f5f8" : "",
                }}
              >
                <AntDesign
                  name="home"
                  size={30}
                  color={focused ? "#3898b3" : "#a0a0a0"}
                />
              </View>
            );
          },
        }}
      />

      <Tabs.Screen
        name="Jobs"
        options={{
          headerShown: false,
          tabBarLabelStyle: { top: 12 },
          animation: "shift",
          tabBarIcon: ({ focused }) => {
            return (
              <View
                style={{
                  height: 50,
                  width: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 25,
                  backgroundColor: focused ? "#e6f5f8" : "",
                }}
              >
                <FontAwesome
                  name="briefcase"
                  size={30}
                  color={focused ? "#3898b3" : "#a0a0a0"}
                />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="Earnings"
        options={{
          headerShown: false,
          animation: "shift",
          tabBarLabelStyle: { top: 12 },
          tabBarIcon: ({ focused }) => {
            return (
              <View
                style={{
                  height: 50,
                  width: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 25,
                  backgroundColor: focused ? "#e6f5f8" : "",
                }}
              >
                <FontAwesome6
                  name="sack-dollar"
                  size={30}
                  color={focused ? "#3898b3" : "#a0a0a0"}
                />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="Training"
        options={{
          headerShown: false,
          animation: "shift",
          tabBarLabelStyle: { top: 12 },
          tabBarIcon: ({ focused }) => {
            return (
              <View
                style={{
                  height: 50,
                  width: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 25,
                  backgroundColor: focused ? "#e6f5f8" : "",
                }}
              >
                <FontAwesome6
                  name="person-chalkboard"
                  size={30}
                  color={focused ? "#3898b3" : "#a0a0a0"}
                />
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          headerShown: false,
          animation: "shift",
          tabBarLabelStyle: { top: 12 },
          tabBarIcon: ({ focused }) => {
            return (
              <View
                style={{
                  height: 50,
                  width: 50,
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 25,
                  backgroundColor: focused ? "#e6f5f8" : "",
                }}
              >
                <Ionicons
                  name="person-sharp"
                  size={30}
                  color={focused ? "#3898b3" : "#a0a0a0"}
                />
              </View>
            );
          },
        }}
      />

      {/* <Stack.Screen name="modal" options={{ presentation: "modal" }} /> */}
    </Tabs>
  );
}
