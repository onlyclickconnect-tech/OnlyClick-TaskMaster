import { Stack } from "expo-router";

export default function TrainingLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="video-player" options={{ headerShown: false }} />
    </Stack>
  );
}
