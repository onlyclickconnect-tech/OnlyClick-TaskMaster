import { View, ActivityIndicator, Text } from "react-native";

export default function authCallback() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text style={{ marginTop: 16, fontSize: 18, fontWeight: "600" }}>
        Authenticating...
      </Text>
    </View>
  );
}