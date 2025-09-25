import { Stack } from "expo-router";
import { View } from "react-native";
import { AppStatesProvider } from "../context/AppStates";
import AuthProvider from "../context/AuthProvider";
import ModalProvider from "../context/ModalProvider";
import { SocketProvider } from "../context/SocketContext";
import { BookingsProvider } from "../context/bookingsContext";

export default function RootLayout() {
  return (
    <AppStatesProvider>
      <AuthProvider>
        <SocketProvider>
          <ModalProvider>
            <BookingsProvider>
              <View style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="intro" options={{ headerShown: false }} />
                  <Stack.Screen name="(app)" options={{ headerShown: false }} />
                </Stack>
              </View>
            </BookingsProvider>
          </ModalProvider>
        </SocketProvider>
      </AuthProvider>
    </AppStatesProvider>
  );
}
