import { Stack } from "expo-router";

import { useRouter } from "expo-router";

export default function HomeLayout() {
  const router = useRouter();

  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="[bookingId]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
