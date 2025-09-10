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

import React, { useState, useEffect } from "react";
import BottomNavBar from "../components/BottomNavBar";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../(extraScreens)/ThemeContext";

export default function ProfileScreen({ navigation }: { navigation: any }) {
  // dark mode
  const { theme, isDarkMode, setIsDarkMode } = useTheme();
  // const theme = isDarkMode ? darkTheme : lightTheme;
  const [isNotificationOn, setIsNotificationOn] = useState(false);
  const [notifModal, setNotifModal] = useState(false);

  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const [name, setName] = useState("Shreyash Sunil Phanse");
  const [email, setEmail] = useState("pokemongosathiemail22@gmail.com");
  const [password, setPassword] = useState("shreyash22");

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showExportDataModal, setShowExportDataModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // User settings popups
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [newName, setNewName] = useState(name);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");

  const handleToggleNotification = (value: boolean) => {
    setIsNotificationOn(value);

    if (value) {
      setNotifModal(true);
      setTimeout(() => setNotifModal(false), 750);
    }
  };

  const LogOut = () => console.log("logged out");

  // // theme color
  // const ProfileScreen = () => {
  // const [isDarkMode, setIsDarkMode] = useState(false);

  // // Load theme from storage
  // useEffect(() => {
  //   const loadTheme = async () => {
  //     const savedTheme = await AsyncStorage.getItem("theme");
  //     if (savedTheme === "dark") setIsDarkMode(true);
  //   };
  //   loadTheme();
  // }, []);

  // // Save theme when toggled
  // const toggleTheme = async () => {
  //   const newValue = !isDarkMode;
  //   setIsDarkMode(newValue);
  //   await AsyncStorage.setItem("theme", newValue ? "dark" : "light");
  // };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) setProfileImage(result.assets[0].uri);
    } catch (error) {
      console.log("ImagePicker Error: ", error);
    }
  };

  const removeProfilePhoto = () => setProfileImage(null);

  const updateName = () => {
    setName(newName);
    setShowEditProfileModal(false);
  };

  const updatePassword = () => {
    if (currentPasswordInput !== password) {
      Alert.alert("Error", "Current password is incorrect!");
      return;
    }
    setPassword(newPasswordInput);
    setCurrentPasswordInput("");
    setNewPasswordInput("");
    setShowChangePasswordModal(false);
    Alert.alert("Success", "Password updated successfully!");
  };

  const exportData = () => {
    setShowExportDataModal(false);
    console.log("Exporting all bills and sending to:", email);
    Alert.alert("Success", "All bills exported and sent to your email.");
  };

  const deleteAccount = () => {
    setShowDeleteAccountModal(false);
    setName("");
    setEmail("");
    setPassword("");
    setProfileImage(null);
    console.log("Account deleted with all data");
    Alert.alert("Deleted", "Your account and all data have been deleted.");
  };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "#fff" }}>
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

          {/* Fullscreen profile photo modal */}
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
                  <Text style={[styles.modalBtnText]}>Remove Photo</Text>
                </Pressable>
                <Pressable style={styles.modalBtn} onPress={pickImage}>
                  <Text style={[styles.modalBtnText]}>Change Photo</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "grey" }]}
                  onPress={() => setShowImageModal(false)}
                >
                  <Text style={[styles.modalBtnText]}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          {/* Dark mode */}
          <View style={styles.darkMode}>
            <Text style={{ fontSize: 20, color: theme.text.secondary }}>
              Dark Mode
            </Text>
            <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
          </View>

          {/* Notifications */}
          <View style={styles.darkMode}>
            <Text style={{ fontSize: 20, color: theme.text.secondary }}>
              Notifications
            </Text>
            <Switch
              value={isNotificationOn}
              onValueChange={handleToggleNotification}
            />
          </View>
          {/* Modal for Notifications  */}
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
                backgroundColor: "rgba(0,0,0,0.3)", // dim bg
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

          {/* Monthly budget
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
            />
          </View> */}

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
              <TouchableOpacity onPress={() => setShowExportDataModal(true)}>
                <Text style={[styles.subItem, { color: theme.text.body }]}>
                  Export Data
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDeleteAccountModal(true)}>
                <Text style={[styles.subItem, { color: theme.text.body }]}>
                  Delete Account
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

          <Pressable style={styles.logout} onPress={LogOut}>
            <Text style={{ fontSize: 30, fontWeight: "500", color: "white" }}>
              Log-Out
            </Text>
          </Pressable>
        </ScrollView>

        {/* Edit Profile Modal */}
        <Modal visible={showEditProfileModal} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.popup}>
              <Text style={[styles.popupTitle]}>Edit Name</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
              />
              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "grey" }]}
                  onPress={() => setShowEditProfileModal(false)}
                >
                  <Text style={[styles.modalBtnText]}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalBtn} onPress={updateName}>
                  <Text style={[styles.modalBtnText]}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          visible={showChangePasswordModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={styles.popup}>
              <Text style={[styles.popupTitle]}>Change Password</Text>
              <TextInput
                placeholder="Current Password"
                secureTextEntry
                style={styles.input}
                value={currentPasswordInput}
                onChangeText={setCurrentPasswordInput}
              />
              <TextInput
                placeholder="New Password"
                secureTextEntry
                style={styles.input}
                value={newPasswordInput}
                onChangeText={setNewPasswordInput}
              />
              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "grey" }]}
                  onPress={() => setShowChangePasswordModal(false)}
                >
                  <Text style={[styles.modalBtnText]}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalBtn} onPress={updatePassword}>
                  <Text style={[styles.modalBtnText]}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Export Data Modal */}
        <Modal visible={showExportDataModal} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.popup}>
              <Text style={[styles.popupTitle]}>Export Data</Text>
              <Text style={{ marginBottom: 20 }}>
                All bills will be exported and sent to {email}.
              </Text>
              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "grey" }]}
                  onPress={() => setShowExportDataModal(false)}
                >
                  <Text style={[styles.modalBtnText]}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalBtn} onPress={exportData}>
                  <Text style={[styles.modalBtnText]}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Account Modal */}
        <Modal
          visible={showDeleteAccountModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={styles.popup}>
              <Text style={[styles.popupTitle]}>Delete Account</Text>
              <Text style={{ marginBottom: 20 }}>
                Are you sure you want to delete your account? This action is
                irreversible.
              </Text>
              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "grey" }]}
                  onPress={() => setShowDeleteAccountModal(false)}
                >
                  <Text style={[styles.modalBtnText]}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalBtn} onPress={deleteAccount}>
                  <Text style={[styles.modalBtnText]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Terms & Conditions Modal */}
        <Modal visible={showTermsModal} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={[styles.popup, { height: "70%" }]}>
              <Text style={[styles.popupTitle]}>Terms & Conditions</Text>
              <ScrollView style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, color: "#333", lineHeight: 20 }}>
                  <Text style={{ fontWeight: "bold" }}>
                    Terms & Conditions {"\n\n"}
                  </Text>
                  <Text style={{ fontWeight: "bold" }}>
                    1. Acceptance of Terms{"\n"}
                  </Text>
                  By using SaveMyBill, you agree to comply with these Terms &
                  Conditions and any future updates we may publish.{"\n\n"}
                  <Text style={{ fontWeight: "bold" }}>
                    2. Data Responsibility{"\n"}
                  </Text>
                  You are responsible for ensuring that all bill details you
                  store in the app are accurate and up to date.{"\n\n"}
                  <Text style={{ fontWeight: "bold" }}>3. Security{"\n"}</Text>
                  You are responsible for keeping your login credentials secure.
                  SaveMyBill will not be liable for any unauthorized access
                  resulting from your negligence.{"\n\n"}
                  <Text style={{ fontWeight: "bold" }}>
                    4. Features & Services{"\n"}
                  </Text>
                  The app provides reminders for bill expiry and warranty dates.
                  We reserve the right to modify, update, or discontinue any
                  feature with prior notice.{"\n\n"}
                  <Text style={{ fontWeight: "bold" }}>
                    5. Account Suspension{"\n"}
                  </Text>
                  Any unauthorized or abusive use of the app may lead to
                  temporary or permanent suspension of your account.{"\n\n"}
                  <Text style={{ fontWeight: "bold" }}>6. Agreement{"\n"}</Text>
                  By continuing to use SaveMyBill, you confirm that you have
                  read, understood, and agreed to these Terms & Conditions.
                  {"\n"}
                </Text>
              </ScrollView>
              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "grey" }]}
                  onPress={() => setShowTermsModal(false)}
                >
                  <Text style={[styles.modalBtnText]}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Privacy Policy Modal */}
        <Modal visible={showPrivacyModal} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={[styles.popup, { height: "70%" }]}>
              <Text style={[styles.popupTitle]}>Privacy Policy</Text>
              <ScrollView style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, color: "#333", lineHeight: 20 }}>
                  <Text style={{ fontWeight: "bold", color: theme.text }}>
                    Privacy Policy {"\n\n"}
                  </Text>
                  <Text style={{ fontWeight: "bold", color: theme.text }}>
                    1. Data Collection{"\n"}
                  </Text>
                  SaveMyBill collects only the information necessary to provide
                  its core features, including your name, email, and bill
                  details.{"\n\n"}
                  <Text style={{ fontWeight: "bold", color: theme.text }}>
                    2. Data Storage{"\n"}
                  </Text>
                  All personal and bill-related information is securely stored
                  on our servers with industry-standard security measures.
                  {"\n\n"}
                  <Text style={{ fontWeight: "bold", color: theme.text }}>
                    3. Data Sharing{"\n"}
                  </Text>
                  We do not sell, rent, or share your personal information with
                  any third parties.{"\n\n"}
                  <Text style={{ fontWeight: "bold", color: theme.text }}>
                    4. Notifications{"\n"}
                  </Text>
                  Email notifications and reminders are sent securely and only
                  for purposes related to your stored bills.{"\n\n"}
                  <Text style={{ fontWeight: "bold", color: theme.text }}>
                    5. User Control{"\n"}
                  </Text>
                  You may request deletion of your account and all associated
                  data at any time.{"\n\n"}
                  <Text style={{ fontWeight: "bold", color: theme.text }}>
                    6. Consent{"\n"}
                  </Text>
                  By using SaveMyBill, you consent to the collection and use of
                  your data in accordance with this Privacy Policy.{"\n"}
                </Text>
              </ScrollView>
              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "grey" }]}
                  onPress={() => setShowPrivacyModal(false)}
                >
                  <Text style={[styles.modalBtnText]}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Help Modal */}
        <Modal visible={showHelpModal} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={[styles.popup, { height: "50%" }]}>
              <Text style={[styles.popupTitle]}>Help & Support</Text>
              <ScrollView style={{ marginBottom: 15 }}>
                <Text style={{ fontSize: 14, color: "#333", lineHeight: 20 }}>
                  <Text style={{ fontWeight: "bold", color: theme.text }}>
                    Help & Support{"\n\n"}
                  </Text>
                  <Text style={{ fontWeight: "bold", color: theme.text }}>
                    1. Assistance{"\n"}
                  </Text>
                  For any questions regarding SaveMyBill, including app usage,
                  account issues, or feature-related queries, our support team
                  is here to help.{"\n\n"}
                  <Text style={{ fontWeight: "bold", color: theme.text }}>
                    2. Contact Information{"\n"}
                  </Text>
                  Email: pokemongosathiemail22@gmail.com{"\n"}
                  Phone: +91 8097142445{"\n\n"}
                  <Text style={{ fontWeight: "bold", color: theme.text }}>
                    3. Response Time{"\n"}
                  </Text>
                  We are committed to responding promptly to all queries. Please
                  provide detailed information about your issue for faster
                  assistance.{"\n\n"}
                  <Text style={{ fontWeight: "bold", color: theme.text }}>
                    4. Feedback{"\n"}
                  </Text>
                  We welcome your suggestions and feedback to improve SaveMyBill
                  and ensure a smooth user experience.{"\n"}
                </Text>
              </ScrollView>
              <View style={styles.modalButtonsRow}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "grey" }]}
                  onPress={() => setShowHelpModal(false)}
                >
                  <Text style={[styles.modalBtnText]}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <BottomNavBar currentScreen="Profile" navigation={navigation} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 28,
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
  modalBtnText: {
    color: "#fff",
    fontSize: 16,
  },
  popup: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: "80%",
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
});
