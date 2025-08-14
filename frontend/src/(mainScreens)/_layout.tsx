// _layout.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import your screens (keep your existing files/paths)
import ProfileScreen from "./ProfileScreen";
import HomeScreen from "./HomeScreen";
import BillScreen from "./BillScreen";
import UploadScreen from "./UploadScreen";
import CategoryScreen from "./CategoryScreen";

export type RootTabParamList = {
  Home: undefined;
  Bills: undefined;
  Upload: undefined;
  Categories: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Type-safe icon mapping to avoid the Ionicons `name` type error
const ICONS: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: "home-outline",
  Bills: "document-text-outline",
  Upload: "cloud-upload-outline",
  Categories: "grid-outline",
  Profile: "person-outline",
};

export default function Layout() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Profile" // ✅ Start with Profile
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false, // icons only (you can turn labels on later)
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
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Bills" component={BillScreen} />
        <Tab.Screen name="Upload" component={UploadScreen} />
        <Tab.Screen name="Categories" component={CategoryScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        
      </Tab.Navigator>
    </NavigationContainer>
  );
}
