import { StyleSheet, View } from "react-native";
import AppHeader from '../../../components/common/AppHeader';
import SinglePageSwitch from "../../../components/common/SinglePageSwitch";
import JobAlert from "../../../components/Notification/JobAlert";
import PlatformUpdates from "../../../components/Notification/PlatformUpdate";
export default function Notifications() {
  return (
    <View style={{ flex: 1, backgroundColor: "white"  }}>
      <AppHeader title="Notifications" showBack={true} />
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
