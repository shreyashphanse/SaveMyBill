// ProfileScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  TouchableOpacity,
  Switch,
  Modal,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { updateProfile } from "firebase/auth";

import {
  signOut,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import BottomNavBar from "../components/BottomNavBar";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../(extraScreens)/ThemeContext";
import { API_BASE_URL } from "../../config/app";
import { useUser } from "../(extraScreens)/UserContext";

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { theme, isDarkMode, setIsDarkMode } = useTheme();

  const [isNotificationOn, setIsNotificationOn] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const { setUser } = useUser();

  const [newName, setNewName] = useState(name);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");

  const setProfileImagePersist = async (uri: string | null) => {
    setProfileImage(uri);
    if (uri) await AsyncStorage.setItem("profileImage", uri);
    else await AsyncStorage.removeItem("profileImage");
  };

  const handleToggleNotificationPersist = async (value: boolean) => {
    setIsNotificationOn(value);
    await AsyncStorage.setItem("isNotificationOn", JSON.stringify(value));
    if (value) {
      setNotifModal(true);
      setTimeout(() => setNotifModal(false), 750);
    }
  };

  const handleDarkModeTogglePersist = async (value: boolean) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem("darkMode", JSON.stringify(value));
  };

  const LogOut = async () => {
    try {
      await signOut(auth);
      // navigation.replace("AuthStack", { name: "Login" });
      setUser(null);
      await AsyncStorage.removeItem("profileImage");
      await AsyncStorage.removeItem("darkMode");
      await AsyncStorage.removeItem("isNotificationOn");
    } catch (err) {
      console.log("Logout error: ", err);
      Alert.alert("Error", "Failed to log out. Try again.");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) setProfileImagePersist(result.assets[0].uri);
    } catch (error) {
      console.log("ImagePicker Error: ", error);
    }
  };

  const removeProfilePhoto = () => setProfileImagePersist(null);

  const updateName = () => {
    setName(newName);
    setShowEditProfileModal(false);
  };

  const updatePassword = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "No user is logged in!");
      return;
    }
    if (!currentPasswordInput || !newPasswordInput) {
      Alert.alert("Error", "Please fill both fields.");
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        currentPasswordInput
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await firebaseUpdatePassword(auth.currentUser, newPasswordInput);
      setPassword(newPasswordInput);
      await AsyncStorage.setItem("userPassword", newPasswordInput);
      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setShowChangePasswordModal(false);
      Alert.alert("Success", "Password updated successfully!");
    } catch (error: any) {
      console.log("Password update error:", error);
      Alert.alert("Error", error.message || "Failed to update password.");
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const storedName = await AsyncStorage.getItem("userName");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      const storedPassword = await AsyncStorage.getItem("userPassword");
      const storedProfileImage = await AsyncStorage.getItem("profileImage");
      const storedNotif = await AsyncStorage.getItem("isNotificationOn");
      const storedDarkMode = await AsyncStorage.getItem("darkMode");

      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedPassword) setPassword(storedPassword);
      if (storedProfileImage) setProfileImage(storedProfileImage);
      if (storedNotif) setIsNotificationOn(JSON.parse(storedNotif));
      if (storedDarkMode) setIsDarkMode(JSON.parse(storedDarkMode));
    };
    loadUserData();
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Profile Screen
        </Text>
        <ScrollView style={styles.sub1}>
          {/* Profile image + name/email */}
          <View style={styles.imgNameEmail}>
            <TouchableOpacity onPress={() => setShowImageModal(true)}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : {
                        uri: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
                      }
                }
                style={styles.img}
              />
            </TouchableOpacity>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View style={styles.nameEmail}>
                <Text style={[styles.text1, { color: theme.text.highlight }]}>
                  {name}
                </Text>
                <Text style={[styles.text1, { color: theme.text.highlight }]}>
                  {email}
                </Text>
              </View>
            </ScrollView>
          </View>
          {/* Edit Profile Modal */}
          <Modal
            visible={showEditProfileModal}
            transparent
            animationType="slide"
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <View style={styles.popup}>
                <Text style={styles.popupTitle}>Edit Profile</Text>
                <TextInput
                  placeholder="Enter Profile Name"
                  value={newName}
                  onChangeText={setNewName}
                  style={styles.input}
                />
                <View style={{ flexDirection: "row", gap: 20 }}>
                  {/* Cancel Button */}
                  <Pressable
                    style={[styles.modalBtn, { backgroundColor: "#c70000" }]}
                    onPress={() => {
                      setNewName(""); // clear input
                      setShowEditProfileModal(false);
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Cancel</Text>
                  </Pressable>

                  {/* OK Button */}
                  <Pressable
                    style={[styles.modalBtn, { backgroundColor: "#003366" }]}
                    onPress={async () => {
                      if (!newName.trim()) {
                        Alert.alert("Error", "Please enter a valid name.");
                        return;
                      }
                      try {
                        if (auth.currentUser) {
                          await updateProfile(auth.currentUser, {
                            displayName: newName,
                          });
                          setName(newName);
                          await AsyncStorage.setItem("userName", newName);
                        }
                        setNewName(""); // clear input
                        setShowEditProfileModal(false);
                      } catch (error: any) {
                        Alert.alert(
                          "Error",
                          error.message || "Failed to update name."
                        );
                      }
                    }}
                  >
                    <Text style={{ color: "#fff" }}>OK</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          {/* Change Password Modal */}
          <Modal
            visible={showChangePasswordModal}
            transparent
            animationType="slide"
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <View style={styles.popup}>
                <Text style={styles.popupTitle}>Change Password</Text>
                <TextInput
                  placeholder="Old Password"
                  value={currentPasswordInput}
                  onChangeText={setCurrentPasswordInput}
                  secureTextEntry
                  style={styles.input}
                />
                <TextInput
                  placeholder="New Password"
                  value={newPasswordInput}
                  onChangeText={setNewPasswordInput}
                  secureTextEntry
                  style={styles.input}
                />
                <View style={{ flexDirection: "row", gap: 20 }}>
                  {/* Cancel Button */}
                  <Pressable
                    style={[styles.modalBtn, { backgroundColor: "#c70000" }]}
                    onPress={() => {
                      setCurrentPasswordInput(""); // clear inputs
                      setNewPasswordInput("");
                      setShowChangePasswordModal(false);
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Cancel</Text>
                  </Pressable>

                  {/* OK Button */}
                  <Pressable
                    style={[styles.modalBtn, { backgroundColor: "#003366" }]}
                    onPress={async () => {
                      await updatePassword(); // run your password update fn
                      setCurrentPasswordInput(""); // clear inputs
                      setNewPasswordInput("");
                      setShowChangePasswordModal(false);
                    }}
                  >
                    <Text style={{ color: "#fff" }}>OK</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          {/* Image modal */}
          <Modal visible={showImageModal} transparent animationType="fade">
            <View style={styles.modalContainer}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : {
                        uri: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
                      }
                }
                style={styles.fullscreenImg}
              />
              <View style={styles.modalButtonsRow}>
                <Pressable style={styles.modalBtn} onPress={removeProfilePhoto}>
                  <Text style={styles.modalBtnText}>Remove Photo</Text>
                </Pressable>
                <Pressable style={styles.modalBtn} onPress={pickImage}>
                  <Text style={styles.modalBtnText}>Change Photo</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "grey" }]}
                  onPress={() => setShowImageModal(false)}
                >
                  <Text style={styles.modalBtnText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          {/* Terms & Conditions Modal */}
          <Modal visible={showTermsModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.popup}>
                <Text
                  style={[styles.popupTitle, { color: theme.text.primary }]}
                >
                  Terms & Conditions
                </Text>
                <ScrollView>
                  <Text style={{ color: theme.text.secondary }}>
                    By using SaveMyBill, you agree to store receipts, bills, and
                    product details responsibly. We are not responsible for lost
                    data, expired reminders, or incorrect OCR readings. Do not
                    misuse the app for fraudulent warranty claims. SaveMyBill is
                    designed only for personal record-keeping and reminder
                    purposes.
                  </Text>
                </ScrollView>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setShowTermsModal(false)}
                >
                  <Text style={{ color: theme.text.secondary }}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Privacy Policy Modal */}
          <Modal visible={showPrivacyModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.popup}>
                <Text
                  style={[styles.popupTitle, { color: theme.text.primary }]}
                >
                  Privacy Policy
                </Text>
                <ScrollView>
                  <Text style={{ color: theme.text.secondary }}>
                    SaveMyBill stores only the data you provide: receipts,
                    product details, and reminders. No personal data is shared
                    with third parties. Images are kept locally unless you
                    explicitly sync them to cloud storage. We respect your
                    privacy and only use data to improve your experience.
                  </Text>
                </ScrollView>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setShowPrivacyModal(false)}
                >
                  <Text style={{ color: theme.text.secondary }}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Help Modal */}
          <Modal visible={showHelpModal} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.popup}>
                <Text
                  style={[styles.popupTitle, { color: theme.text.primary }]}
                >
                  Help & Support
                </Text>
                <Text style={{ color: theme.text.secondary }}>
                  For support, please contact us at:
                </Text>
                <Text style={{ color: theme.text.primary, fontWeight: "600" }}>
                  pokemongosathiemail22@gmail.com
                </Text>
                <Pressable
                  style={[
                    styles.modalBtn,
                    { backgroundColor: theme.primary, marginTop: 20 },
                  ]}
                  onPress={() => setShowHelpModal(false)}
                >
                  <Text style={{ color: theme.text.secondary }}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Dark mode */}
          <View style={styles.darkMode}>
            <Text style={{ fontSize: 20, color: theme.text.secondary }}>
              Dark Mode
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeTogglePersist}
            />
          </View>

          {/* Notifications */}
          <View style={styles.darkMode}>
            <Text style={{ fontSize: 20, color: theme.text.secondary }}>
              Notifications
            </Text>
            <Switch
              value={isNotificationOn}
              onValueChange={handleToggleNotificationPersist}
            />
          </View>

          {/* Notification modal */}
          <Modal
            visible={notifModal}
            transparent
            animationType="fade"
            onRequestClose={() => setNotifModal(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  padding: 20,
                  borderRadius: 12,
                  minWidth: "70%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", color: "green" }}
                >
                  ✅ Notifications turned on
                </Text>
              </View>
            </View>
          </Modal>

          {/* Account Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowAccountSettings(!showAccountSettings)}
          >
            <Text style={[styles.menuText, { color: theme.text.secondary }]}>
              Account Settings
            </Text>
          </TouchableOpacity>
          {showAccountSettings && (
            <View style={styles.subMenu}>
              <TouchableOpacity onPress={() => setShowEditProfileModal(true)}>
                <Text style={[styles.subItem, { color: theme.text.body }]}>
                  Edit Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowChangePasswordModal(true)}
              >
                <Text style={[styles.subItem, { color: theme.text.body }]}>
                  Change Password
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* User Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowUserSettings(!showUserSettings)}
          >
            <Text style={[styles.menuText, { color: theme.text.secondary }]}>
              User Settings
            </Text>
          </TouchableOpacity>
          {showUserSettings && (
            <View style={styles.subMenu}>
              <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                <Text style={[styles.subItem, { color: theme.text.body }]}>
                  Terms & Conditions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
                <Text style={[styles.subItem, { color: theme.text.body }]}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowHelpModal(true)}>
                <Text style={[styles.subItem, { color: theme.text.body }]}>
                  Help
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Log Out */}
          <Pressable style={styles.logout} onPress={LogOut}>
            <Text style={{ fontSize: 30, fontWeight: "500", color: "white" }}>
              Log-Out
            </Text>
          </Pressable>
        </ScrollView>

        {/* Bottom Nav */}
        <BottomNavBar currentScreen="Profile" navigation={navigation} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 28, color: "darkblue", fontWeight: "600" },
  sub1: { gap: 20 },
  imgNameEmail: { flexDirection: "row", alignItems: "center", gap: 16 },
  nameEmail: { flexDirection: "column", justifyContent: "center", gap: 5 },
  text1: { fontSize: 20, fontWeight: "600" },
  img: { height: 100, width: 100, backgroundColor: "blue", borderRadius: 50 },
  darkMode: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
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
  menuItem: { paddingVertical: 12 },
  menuText: { fontSize: 16, fontWeight: "600" },
  subMenu: { paddingLeft: 20, paddingVertical: 20 },
  subItem: { fontSize: 14, color: "#555", paddingVertical: 10 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImg: {
    width: "80%",
    height: "50%",
    borderRadius: 20,
    marginBottom: 20,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
    marginTop: 10,
  },
  modalBtn: {
    backgroundColor: "#003366",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  modalBtnText: { color: "#fff", fontSize: 16 },
  popup: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: "85%",
    maxHeight: "70%",
    alignItems: "center",
  },

  popupTitle: { fontSize: 20, fontWeight: "600", marginBottom: 15 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
});
