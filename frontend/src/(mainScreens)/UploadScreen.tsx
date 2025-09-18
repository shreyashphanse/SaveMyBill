import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import * as DocumentPicker from "expo-document-picker";
import { onAuthStateChanged } from "firebase/auth";
import { useTheme } from "../(extraScreens)/ThemeContext";
import BottomNavBar from "../components/BottomNavBar";
import { API_BASE_URL } from "config/app";
import { auth } from "../firebaseConfig";
import { scheduleBillReminder } from "../utilities/notificationUtils";
import { OCR_BASE_URL } from "config/app";

export default function UploadScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();

  const [userId, setUserId] = useState<string | null>(null);
  const [file, setFile] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [storeName, setStoreName] = useState("");

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [selectedHour, setSelectedHour] = useState<string>("12");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedAmPm, setSelectedAmPm] = useState<string>("AM");

  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const [uploadedBill, setUploadedBill] = useState<{
    billId: string;
    storeName: string;
  } | null>(null);

  const [successModal, setSuccessModal] = useState(false);

  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [hourOpen, setHourOpen] = useState(false);
  const [minuteOpen, setMinuteOpen] = useState(false);
  const [amPmOpen, setAmPmOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const OCR_API_URL = `${OCR_BASE_URL}/ocr`;

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch categories
  useEffect(() => {
    if (!userId) return;
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/categories?userId=${userId}`
        );
        const data = await res.json();
        if (res.ok) {
          const dropdownItems = data.categories.map((cat: any) => ({
            label: cat.name,
            value: cat.id,
            id: cat._id,
          }));
          setItems(dropdownItems);
        } else {
          console.error("Error fetching categories:", data.error);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [userId]);

  // Pick file
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        const fileAsset = result.assets[0];
        setFile(fileAsset);
        await processOCR(fileAsset);
      }
    } catch (error) {
      Alert.alert("Error", "Could not pick file");
    }
  };

  // OCR
  const processOCR = async (fileAsset: any) => {
    if (!fileAsset) return;
    const formData = new FormData();
    formData.append("file", {
      uri: fileAsset.uri,
      name: fileAsset.name,
      type: fileAsset.mimeType || "image/jpeg",
    } as any);

    try {
      const response = await fetch(OCR_API_URL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        if (data.data.amount) setAmount(String(data.data.amount));
        if (data.data.expiryDate) {
          const parts = data.data.expiryDate.split(/[\/\-]/);
          if (parts.length === 3) {
            let [d, m, y] = parts;
            if (y.length === 2) y = "20" + y;
            setDay(d);
            setMonth(m);
            setYear(y);
          }
        }
      } else {
        Alert.alert("OCR failed", data.error || "Unknown error");
      }
    } catch (err) {
      console.error("OCR Error:", err);
      Alert.alert("OCR failed", "Server error");
    }
  };

  // Soft date validation with past date check
  const validateDateSoft = (d: string, m: string, y: string) => {
    let day = Number(d);
    let month = Number(m);
    let year = Number(y);
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 6;

    // Month & Year corrections
    if (month > 12) month = 12;
    if (month < 1) month = 1;
    if (year > maxYear) year = maxYear;
    if (year < currentYear) year = currentYear;

    // Days correction
    let maxDays = 31;
    if ([4, 6, 9, 11].includes(month)) maxDays = 30;
    else if (month === 2) {
      maxDays =
        year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
    }

    if (day > maxDays) day = maxDays;
    if (day < 1) day = 1;

    // ✅ Check if date is before today
    const enteredDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ignore time, only compare date

    if (enteredDate < today) {
      Alert.alert("Invalid Date", "Expiry date cannot be in the past.");
      day = today.getDate();
      month = today.getMonth() + 1;
      year = today.getFullYear();
    }

    return {
      day: day.toString(),
      month: month.toString(),
      year: year.toString(),
    };
  };

  // Handle upload
  const handleUpload = async () => {
    if (
      !file ||
      !amount ||
      !selectedCategory ||
      !day ||
      !month ||
      !year ||
      !storeName
    ) {
      Alert.alert("Please fill all required fields");
      return;
    }

    const expiryDate = `${day}/${month}/${year}`;
    const selectedCategoryObj = items.find(
      (item) => item.value === selectedCategory
    );

    const formData = new FormData();
    formData.append("userId", userId!);
    formData.append("title", title);
    formData.append("amount", amount);
    formData.append("category", selectedCategory);
    formData.append("categoryName", selectedCategoryObj?.label || "Unknown");
    formData.append("expiryDate", expiryDate);
    formData.append("description", description);
    formData.append("storeName", storeName);
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || "image/jpeg",
    } as any);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bills/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        setSuccessModal(true);
        setUploadedBill({ billId: data.billId, storeName });

        setTimeout(() => {
          setSuccessModal(false);

          // Ask for reminder
          Alert.alert(
            "Set Reminder?",
            `This bill expires on ${expiryDate}. Do you want to set a reminder?`,
            [
              { text: "No", onPress: () => console.log("Reminder skipped") },
              {
                text: "Yes",
                onPress: () => {
                  const parts = expiryDate.split("/");
                  const d = new Date(
                    Number(parts[2]),
                    Number(parts[1]) - 1,
                    Number(parts[0])
                  );
                  setSelectedDate(d);
                  setShowTimeDropdown(true);
                },
              },
            ]
          );

          // Reset fields
          setFile(null);
          setAmount("");
          setSelectedCategory(null);
          setDay("");
          setMonth("");
          setYear("");
          setStoreName("");
          setDescription("");
          setTitle("");
        }, 1500);
      } else {
        Alert.alert("Upload failed", data.error || "Unknown error");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Upload failed", "Server error");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{ flex: 1, padding: 20, backgroundColor: theme.background }}
        >
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Upload Screen
          </Text>

          <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
            <Text style={styles.fileText}>
              {file ? file.name : "Choose Bill Photo"}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Enter Bill Title"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Bill Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <DropDownPicker
            open={open}
            value={selectedCategory}
            items={items}
            setOpen={setOpen}
            setValue={setSelectedCategory}
            setItems={setItems}
            placeholder={
              items.length ? "Select Category" : "No categories available"
            }
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />

          <Text style={{ padding: 5, fontSize: 20 }}>Expiry Date:</Text>
          <TextInput
            style={[styles.input, { backgroundColor: "#f0f0f0" }]}
            value={day && month && year ? `${day}/${month}/${year}` : ""}
            editable={false}
            placeholder="Detected Expiry Date"
          />

          <View style={styles.dateRow}>
            <TextInput
              style={[styles.input, styles.dateInput]}
              placeholder="DD"
              keyboardType="numeric"
              maxLength={2}
              value={day}
              onChangeText={setDay}
              onEndEditing={() => {
                const validated = validateDateSoft(day, month, year);
                setDay(validated.day);
                setMonth(validated.month);
                setYear(validated.year);
              }}
            />

            <TextInput
              style={[styles.input, styles.dateInput]}
              placeholder="MM"
              keyboardType="numeric"
              maxLength={2}
              value={month}
              onChangeText={setMonth}
              onEndEditing={() => {
                const validated = validateDateSoft(day, month, year);
                setDay(validated.day);
                setMonth(validated.month);
                setYear(validated.year);
              }}
            />

            <TextInput
              style={[styles.input, styles.dateInput, { flex: 2 }]}
              placeholder="YYYY"
              keyboardType="numeric"
              maxLength={4}
              value={year}
              onChangeText={setYear}
              onEndEditing={() => {
                const validated = validateDateSoft(day, month, year);
                setDay(validated.day);
                setMonth(validated.month);
                setYear(validated.year);
              }}
            />
          </View>

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

          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <Text style={styles.uploadText}>Upload</Text>
          </TouchableOpacity>

          {/* Time selection dropdowns */}
          {showTimeDropdown && selectedDate && uploadedBill && (
            <View style={{ marginVertical: 10 }}>
              {/* Dropdowns in one line */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <DropDownPicker
                  open={hourOpen}
                  value={selectedHour}
                  items={Array.from({ length: 12 }, (_, i) => ({
                    label: (i + 1).toString().padStart(2, "0"),
                    value: (i + 1).toString().padStart(2, "0"),
                  }))}
                  setOpen={setHourOpen}
                  setValue={setSelectedHour}
                  containerStyle={{ flex: 1, marginRight: 5 }}
                />

                <DropDownPicker
                  open={minuteOpen}
                  value={selectedMinute}
                  items={Array.from({ length: 60 }, (_, i) => ({
                    label: i.toString().padStart(2, "0"),
                    value: i.toString().padStart(2, "0"),
                  }))}
                  setOpen={setMinuteOpen}
                  setValue={setSelectedMinute}
                  containerStyle={{ flex: 1, marginHorizontal: 5 }}
                />

                <DropDownPicker
                  open={amPmOpen}
                  value={selectedAmPm}
                  items={[
                    { label: "AM", value: "AM" },
                    { label: "PM", value: "PM" },
                  ]}
                  setOpen={setAmPmOpen}
                  setValue={setSelectedAmPm}
                  containerStyle={{ flex: 1, marginLeft: 5 }}
                />
              </View>

              {/* Set Reminder button in the next line */}
              <TouchableOpacity
                style={[styles.uploadButton, { marginTop: 10, width: "100%" }]}
                onPress={() => {
                  // Convert selected time to 24-hour
                  let hour24 = Number(selectedHour);
                  if (selectedAmPm === "PM" && hour24 !== 12) hour24 += 12;
                  if (selectedAmPm === "AM" && hour24 === 12) hour24 = 0;

                  const reminderDate = new Date(selectedDate);
                  reminderDate.setHours(hour24, Number(selectedMinute), 0);

                  const now = new Date();

                  // ✅ Validation: Reminder must always be in the future
                  if (reminderDate <= now) {
                    Alert.alert(
                      "Invalid Time",
                      "Reminder time must be in the future."
                    );
                    return;
                  }

                  // ✅ If valid, schedule reminder
                  scheduleBillReminder(
                    reminderDate.toISOString(),
                    uploadedBill.billId,
                    uploadedBill.storeName
                  );

                  Alert.alert(
                    "Reminder Set",
                    `Reminder scheduled for ${reminderDate.toLocaleString()}`
                  );
                  setShowTimeDropdown(false);
                }}
              >
                <Text style={styles.uploadText}>Set Reminder</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Success modal */}
        <Modal
          visible={successModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.checkmark}>✅</Text>
              <Text style={styles.modalText}>Uploaded successfully</Text>
            </View>
          </View>
        </Modal>
      </SafeAreaProvider>

      <BottomNavBar currentScreen="Upload" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "600", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#6A5ACD",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  filePicker: {
    borderWidth: 1,
    borderColor: "#6A5ACD",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  fileText: { color: "#333", fontSize: 16 },
  dropdown: { borderColor: "#6A5ACD", marginBottom: 15 },
  dropdownContainer: { borderColor: "#6A5ACD" },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  dateInput: { flex: 1, marginHorizontal: 5, textAlign: "center" },
  uploadButton: {
    backgroundColor: "#003366",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
    width: "100%",
  },
  uploadText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
  },
  checkmark: { fontSize: 40, marginBottom: 10 },
  modalText: { fontSize: 18, fontWeight: "600", color: "green" },
});
