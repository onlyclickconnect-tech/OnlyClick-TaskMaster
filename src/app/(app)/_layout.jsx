import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="protected">
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="protected" options={{ headerShown: false }} />
    </Stack>
  );
}
