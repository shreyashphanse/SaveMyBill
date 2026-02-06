import React, { useState, useEffect, useMemo } from "react";
import BottomNavBar from "../components/BottomNavBar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "../(extraScreens)/ThemeContext";
import { useUser } from "../(extraScreens)/UserContext";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  BackHandler,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { API_BASE_URL } from "../../../config/app";
import { useCategory } from "../components/categoryContext";

type Category = {
  _id: string;
  name: string;
  amount: number;
  bills: number;
};

export default function CategoriesScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user } = useUser();
  const userId = user?.uid;
  const { setCategoryDict, setIdToCategoryDict } = useCategory();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Sort dropdown
  const [sortOpen, setSortOpen] = useState(false);
  const [sortValue, setSortValue] = useState("az");
  const [sortItems, setSortItems] = useState([
    { label: "A - Z", value: "az" },
    { label: "Total Amount", value: "amount" },
    { label: "No. of Bills", value: "bills" },
  ]);

  // Add Category modal
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    if (!userId) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/categories?userId=${userId}`,
      );
      const data = await res.json();
      const raw = Array.isArray(data?.categories) ? data.categories : [];

      // Map raw categories
      const mapped: Category[] = raw.map((cat: any, idx: number) => ({
        _id: cat._id ?? cat.id ?? String(idx),
        name: cat.name ?? "Unnamed",
        amount: cat.totalAmount ?? cat.amount ?? 0,
        bills: cat.bills ?? cat.billsCount ?? cat.numBills ?? 0,
      }));

      // Build dictionaries and update context
      const nameToId: Record<string, string> = {};
      const idToName: Record<string, string> = {};
      mapped.forEach((c) => {
        nameToId[c.name] = c._id;
        idToName[c._id] = c.name;
      });

      setCategoryDict(nameToId);
      setIdToCategoryDict(idToName);

      // Update local categories state
      setCategories(mapped);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Could not fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [userId]);

  const handleLongPress = (id: string) => {
    setIsSelectionMode(true);
    toggleSelection(id);
  };

  const toggleSelection = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleDelete = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert(
        "No categories selected",
        "Please select categories to delete.",
      );
      return;
    }

    try {
      for (const categoryId of selectedCategories) {
        // 1️⃣ Fetch bills under this category
        const resBills = await fetch(
          `${API_BASE_URL}/api/bills?category=${categoryId}`,
        );
        const data = await resBills.json();
        const bills = data.bills || [];

        // 2️⃣ Delete each bill
        // for (const bill of bills) {
        //   await fetch(`${API_BASE_URL}/api/bills/${bill._id}`, {
        //     method: "DELETE",
        //   });
        // }

        // 3️⃣ Delete the category
        await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
          method: "DELETE",
        });
      }

      // 4️⃣ Update local state
      setCategories((prev) =>
        prev.filter((cat) => !selectedCategories.includes(cat._id)),
      );
      setSelectedCategories([]);
      setIsSelectionMode(false);

      setSuccessModal(true);
      setTimeout(() => setSuccessModal(false), 1500);
    } catch (err) {
      console.error("Error deleting categories and bills:", err);
      Alert.alert(
        "Error",
        "Failed to delete selected categories or their bills",
      );
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName?.trim()) {
      Alert.alert("Error", "Please enter category name");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim(), userId }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Add category failed:", data);
        Alert.alert("Error", data?.error || data?.message || "Failed to add");
        return;
      }

      await fetchCategories();
      setModalVisible(false);
      setNewCategoryName("");
    } catch (err) {
      console.error("Error adding category:", err);
      Alert.alert("Error", "Failed to add category");
    }
  };

  const sortedCategories = useMemo(() => {
    const copy = [...categories];
    if (sortValue === "az") copy.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortValue === "amount") copy.sort((a, b) => b.amount - a.amount);
    else if (sortValue === "bills") copy.sort((a, b) => b.bills - a.bills);
    return copy;
  }, [categories, sortValue]);

  useEffect(() => {
    const backAction = () => {
      if (isSelectionMode) {
        setIsSelectionMode(false);
        setSelectedCategories([]);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, [isSelectionMode]);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{ flex: 1, padding: 20, backgroundColor: theme.background }}
        >
          <Text
            style={[styles.title, { color: theme.text?.primary ?? "#000" }]}
          >
            Category Screen
          </Text>

          {/* Sort dropdown */}
          <View style={{ zIndex: 1000, marginBottom: 15 }}>
            <DropDownPicker
              open={sortOpen}
              value={sortValue}
              items={sortItems}
              setOpen={setSortOpen}
              setValue={setSortValue}
              setItems={setSortItems}
              placeholder="Sort categories"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          {/* List */}
          <FlatList
            data={sortedCategories}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onLongPress={() => handleLongPress(item._id)}
                delayLongPress={800}
                onPress={() => {
                  if (isSelectionMode) toggleSelection(item._id);
                }}
              >
                <View
                  style={[
                    styles.card,
                    selectedCategories.includes(item._id) &&
                      styles.selectedCard,
                  ]}
                >
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardDetails}>₹{item.amount}</Text>
                  <Text style={styles.cardDetails}>{item.bills} Bills</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 120 }}
          />

          {/* Add button */}
          {!isSelectionMode && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setModalVisible(true)}
            >
              <Text style={{ color: "#fff", fontSize: 30, fontWeight: "bold" }}>
                +
              </Text>
            </TouchableOpacity>
          )}

          {/* Delete button */}
          {isSelectionMode && (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>
                Delete Selected ({selectedCategories.length})
              </Text>
            </TouchableOpacity>
          )}

          {/* Add modal */}
          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Category Name"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleAddCategory}
                >
                  <Text style={styles.modalButtonText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#aaa" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Success modal */}
          <Modal visible={successModal} animationType="fade" transparent={true}>
            <View style={styles.successOverlay}>
              <View style={styles.successContent}>
                <Text style={styles.successText}>✅ Category deleted</Text>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaProvider>
      <BottomNavBar currentScreen="Category" navigation={navigation} />
    </View>
  );
}
const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    color: "darkblue",
    fontWeight: "600",
    marginBottom: 20,
  },
  dropdown: {
    borderColor: "#6A5ACD",
    borderRadius: 10,
  },
  dropdownContainer: {
    borderColor: "#6A5ACD",
    borderRadius: 10,
  },
  card: {
    backgroundColor: "#c9c5eaff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#513fc3ff",
  },
  selectedCard: {
    backgroundColor: "#D8BFD8",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardDetails: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#003366",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  deleteButton: {
    position: "absolute",
    bottom: 20,
    right: 100,
    backgroundColor: "#c70000",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#6A5ACD",
    backgroundColor: "#fff",
    padding: 12,
    width: "100%",
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: "#003366",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // success modal
  successOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  successContent: {
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
  },
  successText: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: "green",
  },
});
