import React, { useEffect } from "react";
import { Platform } from "react-native";
import { ThemeProvider } from "./src/(extraScreens)/ThemeContext";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthStack from "./src/Navigation/AuthStack";
import { UserProvider, useUser } from "./src/(extraScreens)/UserContext";
import * as Notifications from "expo-notifications";
import { CategoryProvider } from "./src/components/categoryContext";

// Main screens
import HomeScreen from "./src/(mainScreens)/HomeScreen";
import BillScreen from "./src/(mainScreens)/BillScreen";
import UploadScreen from "./src/(mainScreens)/UploadScreen";
import CategoryScreen from "./src/(mainScreens)/CategoryScreen";
import ProfileScreen from "./src/(mainScreens)/ProfileScreen";
import Report from "./src/(extraScreens)/Report";

const Stack = createNativeStackNavigator();

// A small wrapper decide which stack to show based on logged-in user
const MainNavigator = () => {
  const { user } = useUser();

  if (!user) return <AuthStack />; // User not logged in → Auth screens

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Bill" component={BillScreen} />
      <Stack.Screen name="Upload" component={UploadScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Report" component={Report} />
    </Stack.Navigator>
  );
};

export default function App() {
  useEffect(() => {
    //  Notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    //  Android channel
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    //  Ask for permissions
    const getPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Please enable notifications to get bill reminders.");
      }
    };
    getPermissions();

    //  Handle notification clicks
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const billId = response.notification.request.content.data.billId;
        if (billId) {
          console.log("User tapped notification for bill:", billId);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider>
      <UserProvider>
        <CategoryProvider>
          <NavigationContainer>
            <MainNavigator />
          </NavigationContainer>
        </CategoryProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
