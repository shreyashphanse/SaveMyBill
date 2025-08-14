// profile.tsx
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  TouchableOpacity,
  Switch,
} from "react-native";
import React, { useState } from "react";

export default function ProfileScreen() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isNotificationOn, setIsNotificationOn] = React.useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  // logout funtion
  const LogOut = () => {
    console.log("loged out");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>

      <View style={styles.sub1}>
        {/* Profile image + name/email */}
        <View style={styles.imgNameEmail}>
          <View style={styles.img}></View>
          <View style={styles.nameEmail}>
            <Text style={styles.text1}>Shreyash Sunil Phanse</Text>
            <Text style={styles.text1}>shreyashphanse22@gmail.com</Text>
          </View>
        </View>

        {/* Dark mode row */}
        <View style={styles.darkMode}>
          <Text style={{ fontSize: 20 }}>Dark Mode</Text>
          <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
        </View>

        {/* notification */}
        <View style={styles.darkMode}>
          <Text style={{ fontSize: 20 }}>Manage Notification</Text>
          <Switch
            value={isNotificationOn}
            onValueChange={setIsNotificationOn}
          />
        </View>

        {/* monthly budget */}
        <View style={styles.darkMode}>
          <Text style={{ fontSize: 20 }}>Monthly budget</Text>
          <TextInput
            style={{
              height: "auto",
              width: 55,
              borderWidth: 1,
              padding: 10,
              borderRadius: 10,
              borderColor: "#ccc",
            }}
            keyboardType="number-pad"
          ></TextInput>
        </View>

        {/* Account Settings */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowAccountSettings(!showAccountSettings)}
        >
          <Text style={styles.menuText}>Account Settings</Text>
        </TouchableOpacity>

        {showAccountSettings && (
          <View style={styles.subMenu}>
            <Text style={styles.subItem}>Edit Profile</Text>
            <Text style={styles.subItem}>Change Password</Text>
            <Text style={styles.subItem}>Export Data</Text>
            <Text style={styles.subItem}>Delete Account</Text>
          </View>
        )}

        {/* User Settings */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setShowUserSettings(!showUserSettings)}
        >
          <Text style={styles.menuText}>User Settings</Text>
        </TouchableOpacity>

        {showUserSettings && (
          <View style={styles.subMenu}>
            <Text style={styles.subItem}>Terms & Conditions</Text>
            <Text style={styles.subItem}>Privacy Policy</Text>
            <Text style={styles.subItem}>Help</Text>
            <Text style={styles.subItem}>Contact</Text>
          </View>
        )}

        <Pressable style={styles.logout} onPress={LogOut}>
          <Text
            style={{
              fontSize: 30,
              fontWeight: 500,
              color: "white",
            }}
          >
            Log-Out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "flex-start",
    gap: 20,
    top: 40,
  },
  title: {
    fontSize: 23,
    color: "darkblue",
    fontWeight: "600",
  },
  sub1: {
    gap: 20,
  },
  imgNameEmail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  nameEmail: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 5,
  },
  text1: {
    fontSize: 20,
    color: "#152700ff",
    fontWeight: "600",
  },
  img: {
    height: 100,
    width: 100,
    backgroundColor: "blue",
    borderRadius: 50,
  },
  darkMode: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    height: 20,
    width: 50,
    backgroundColor: "blue",
    borderRadius: 10,
  },
  logout: {
    height: 50,
    width: "auto",
    backgroundColor: "#c70000ff",
    margin: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
  },
  subMenu: {
    paddingLeft: 20,
    paddingVertical: 20,
  },
  subItem: {
    fontSize: 14,
    color: "#555",
    paddingVertical: 10,
  },
});
