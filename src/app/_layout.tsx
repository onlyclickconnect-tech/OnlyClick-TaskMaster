import { Stack } from "expo-router";
import { View } from "react-native";
import AuthProvider from "../context/AuthProvider";
import ModalProvider from "../context/ModalProvider";
import { AppStatesProvider } from "../context/AppStates";
import { SocketProvider } from "../context/SocketContext";

export default function RootLayout() {
  return (
    <AppStatesProvider>
      <AuthProvider>
        <SocketProvider>
          <ModalProvider>
            <View style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="intro" options={{ headerShown: false }} />
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
              </Stack>
            </View>
          </ModalProvider>
        </SocketProvider>
      </AuthProvider>
    </AppStatesProvider>
  );
}
