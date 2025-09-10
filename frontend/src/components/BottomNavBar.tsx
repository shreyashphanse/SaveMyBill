import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

// Props with strict typing for screen names
type Props = {
  currentScreen: "Home" | "Bill" | "Upload" | "Category" | "Profile";
  navigation: any;
};

export default function BottomNavBar({ currentScreen, navigation }: Props) {
  // Tab definitions
  const tabs = [
    { name: "Home", label: "Home" },
    { name: "Bill", label: "Bill" },
    { name: "Upload", label: "Upload" },
    { name: "Category", label: "Category" },
    { name: "Profile", label: "Profile" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tab}
          onPress={() => navigation.navigate(tab.name)}
        >
          <Text
            style={[
              styles.label,
              currentScreen === tab.name && styles.activeLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    backgroundColor: "#fff",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    color: "#555",
    fontSize: 14,
  },
  activeLabel: {
    color: "#6A5ACD",
    fontWeight: "bold",
  },
});
