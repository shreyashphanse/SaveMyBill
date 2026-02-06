// notificationUtils.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

export async function scheduleBillReminder(
  expiryDateTimeString: string,
  billId: string,
  storeName: string
) {
  //  Check notification preference first
  const notifPref = await AsyncStorage.getItem("isNotificationOn");
  if (notifPref === "false") {
    Alert.alert(
      "Notifications Off",
      "Notifications are turned off in settings, so new reminders won’t be scheduled."
    );
    return;
  }

  const d = new Date(expiryDateTimeString);
  const secondsUntilExpiry = Math.max(
    1,
    Math.floor((d.getTime() - Date.now()) / 1000)
  );

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📌 Bill Expiry Reminder",
        body: `Your bill for ${storeName} expires at your selected time.`,
        data: { billId },
      },
      trigger: {
        type: "timeInterval",
        seconds: secondsUntilExpiry,
        repeats: false,
      } as any,
    });
    console.log("✅ Notification scheduled in", secondsUntilExpiry, "seconds");
  } catch (error) {
    console.error("❌ Failed to schedule notification:", error);
  }
}
