import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { View, ActivityIndicator} from "react-native";
import Text from '../../../components/ui/Text';

export default function authCallback() {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      console.log('Callback page focused, redirecting to index...');
      // Use a small timeout to ensure proper mounting
      const timer = setTimeout(() => {
        router.replace('/');
      }, 50);

      return () => clearTimeout(timer);
    }, [router])
  );

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
        Redirecting...
      </Text>
    </View>
  );
}