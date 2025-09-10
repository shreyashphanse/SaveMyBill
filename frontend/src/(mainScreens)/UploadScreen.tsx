import React, { useState } from "react";
import BottomNavBar from "../components/BottomNavBar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "../(extraScreens)/ThemeContext";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UploadScreen({ navigation }: { navigation: any }) {
  const [file, setFile] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [storeName, setStoreName] = useState("");
  const { theme } = useTheme();

  // Expiry date fields
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([
    { label: "Food", value: "1" },
    { label: "Electronics", value: "2" },
    { label: "Travel", value: "3" },
    { label: "Shopping", value: "4" },
    { label: "Health", value: "5" },
  ]);

  const [successModal, setSuccessModal] = useState(false);

  // File picker
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const fileAsset = result.assets[0];
        setFile(fileAsset); // fileAsset has { uri, name, size, mimeType }
      }
    } catch (error) {
      Alert.alert("Error", "Could not pick file");
    }
  };

  // Upload button handler
  const handleUpload = () => {
    if (
      !file ||
      !amount ||
      !selectedCategory ||
      !day ||
      !month ||
      !year ||
      !storeName
    ) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    const expiryDate = `${day}/${month}/${year}`;

    // TODO: Upload logic to DB here with expiryDate

    setSuccessModal(true);

    setTimeout(() => {
      setSuccessModal(false);

      // Clear all input fields
      setFile(null);
      setAmount("");
      setSelectedCategory(null);
      setDay("");
      setMonth("");
      setYear("");
      setStoreName("");
      setDescription("");
    }, 1500);
  };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Upload Screen
        </Text>

        {/* File Picker */}
        <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
          <Text style={styles.fileText}>
            {file ? file.name : "Choose Bill Photo"}
          </Text>
        </TouchableOpacity>

        {/* Bill Amount */}
        <TextInput
          style={styles.input}
          placeholder="Enter Bill Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {/* Dropdown */}
        <DropDownPicker
          open={open}
          value={selectedCategory}
          items={items}
          setOpen={setOpen}
          setValue={setSelectedCategory}
          setItems={setItems}
          placeholder="Select Category"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />

        {/* Expiry Date Row */}
        <View style={styles.dateRow}>
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="DD"
            keyboardType="numeric"
            maxLength={2}
            value={day}
            onChangeText={setDay}
          />
          <TextInput
            style={[styles.input, styles.dateInput]}
            placeholder="MM"
            keyboardType="numeric"
            maxLength={2}
            value={month}
            onChangeText={setMonth}
          />
          <TextInput
            style={[styles.input, styles.dateInput, { flex: 2 }]}
            placeholder="YYYY"
            keyboardType="numeric"
            maxLength={4}
            value={year}
            onChangeText={setYear}
          />
        </View>

        {/* Description & Store Name */}
        <TextInput
          style={styles.input}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Store Name"
          value={storeName}
          onChangeText={setStoreName}
        />

        {/* Upload Button */}
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={successModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSuccessModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)", // dimmed overlay
          }}
        >
          <View
            style={{
              width: "70%",
              padding: 20,
              backgroundColor: "white",
              borderRadius: 15,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                textAlign: "center",
              }}
            >
              ✅ Uploaded successfully
            </Text>
          </View>
        </View>
      </Modal>

      {/* Bottom NavBar ALWAYS at bottom */}
      <BottomNavBar currentScreen="Upload" navigation={navigation} />
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
    marginBottom: 20,
  },
  filePicker: {
    borderWidth: 1,
    backgroundColor: "#fff",
    borderColor: "#6A5ACD",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  fileText: {
    color: "#333",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#6A5ACD",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  dropdown: {
    borderColor: "#6A5ACD",
    marginBottom: 15,
  },
  dropdownContainer: {
    borderColor: "#6A5ACD",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 5,
    textAlign: "center",
  },
  uploadButton: {
    backgroundColor: "#003366",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },
  uploadText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
  },
  checkmark: {
    fontSize: 40,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "600",
    color: "green",
  },
});
