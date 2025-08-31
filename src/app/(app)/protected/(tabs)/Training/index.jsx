import { StyleSheet, Text, View } from "react-native";
import React from "react";
import AppHeader from "../../../../../components/common/AppHeader";
import { useRouter } from "expo-router";

export default function index() {
  const router = useRouter();

  return (
    <View>
      <AppHeader title="Training" showBack={true} onBack={() => router.back()} />
      <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", marginTop: 200 }}>
        Coming Soon ....
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({});
