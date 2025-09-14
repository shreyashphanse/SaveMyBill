// notificationUtils.ts
import * as Notifications from "expo-notifications";

export async function scheduleBillReminder(
  expiryDateString: string,
  billId: string,
  storeName: string
) {
  const d = new Date(expiryDateString);
  const secondsUntilExpiry = Math.max(
    1,
    Math.floor((d.getTime() - Date.now()) / 1000)
  );

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📌 Bill Expiry Reminder",
        body: `Your bill for ${storeName} expires today.`,
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
