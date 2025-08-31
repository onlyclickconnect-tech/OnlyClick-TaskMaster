import { StyleSheet, View } from "react-native";
import AppHeader from '../../../components/common/AppHeader';
import SinglePageSwitch from "../../../components/common/SinglePageSwitch";
import JobAlert from "../../../components/Notification/JobAlert";
import PlatformUpdates from "../../../components/Notification/PlatformUpdate";
import { useRouter } from "expo-router";
export default function Notifications() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: "white"  }}>
      <AppHeader title="Notifications" showBack={true} onBack={() => router.back()}/>
      <SinglePageSwitch
        leftText={"Job Alert"}
        rightText={"Platform Updates"}
        leftElement={<JobAlert />}
        rightElement={<PlatformUpdates />}
      />
    </View>
  );
}

const styles = StyleSheet.create({});
