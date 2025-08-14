// _layout.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import your screens
import EditProfile from "./EditProfile";

export type RootTabParamList = {
  EditProfile: undefined; // 👈 route name must match Tab.Screen name
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Icon mapping
const ICONS: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  EditProfile: "create-outline", // 👈 any Ionicons icon name you want
};

export default function Layout() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="EditProfile"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#ccc",
            height: 60,
          },
          tabBarActiveTintColor: "darkblue",
          tabBarInactiveTintColor: "gray",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={ICONS[route.name]}
              size={size ?? 24}
              color={color}
            />
          ),
        })}
      >
        <Tab.Screen name="EditProfile" component={EditProfile} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
