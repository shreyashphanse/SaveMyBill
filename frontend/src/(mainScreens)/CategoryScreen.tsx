import React, { useState, useEffect } from "react";
import BottomNavBar from "../components/BottomNavBar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  BackHandler,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../(extraScreens)/ThemeContext";

export default function CategoriesScreen({ navigation }: { navigation: any }) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const [sortBy, setSortBy] = useState("az");
  const [items, setItems] = useState([
    { label: "A - Z", value: "az" },
    { label: "Total Amount", value: "amount" },
    { label: "No. of Bills", value: "bills" },
  ]);

  // Categories data
  const [categories, setCategories] = useState([
    { id: "1", name: "Food", amount: 4500, bills: 12 },
    { id: "2", name: "Electronics", amount: 12000, bills: 5 },
    { id: "3", name: "Travel", amount: 8000, bills: 7 },
    { id: "4", name: "Shopping", amount: 9500, bills: 9 },
    { id: "5", name: "Health", amount: 3000, bills: 4 },
  ]);

  // Selection state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Modal state for adding category
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryAmount, setNewCategoryAmount] = useState("");
  const [newCategoryBills, setNewCategoryBills] = useState("");

  // Back button handler for Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isSelectionMode) {
          setIsSelectionMode(false);
          setSelectedCategories([]);
          return true;
        }
        return false;
      }
    );
    return () => backHandler.remove();
  }, [isSelectionMode]);

  // Sort categories
  const sortedCategories = [...categories].sort((a, b) => {
    if (sortBy === "az") return a.name.localeCompare(b.name);
    if (sortBy === "amount") return b.amount - a.amount;
    if (sortBy === "bills") return b.bills - a.bills;
    return 0;
  });

  // Handle long press on category
  const handleLongPress = (id: string) => {
    setIsSelectionMode(true);
    toggleSelection(id);
  };

  // Select/unselect category
  const toggleSelection = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  // Delete selected categories
  const handleDelete = () => {
    if (selectedCategories.length === 0) {
      Alert.alert(
        "No categories selected",
        "Please select categories to delete."
      );
      return;
    }
    setCategories((prev) =>
      prev.filter((cat) => !selectedCategories.includes(cat.id))
    );
    setSelectedCategories([]);
    setIsSelectionMode(false);
  };

  // Add new category
  const handleAddCategory = () => {
    if (!newCategoryName || !newCategoryAmount || !newCategoryBills) {
      Alert.alert("Error", "Please enter all fields");
      return;
    }
    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      amount: parseInt(newCategoryAmount),
      bills: parseInt(newCategoryBills),
    };
    setCategories([...categories, newCategory]);
    setModalVisible(false);
    setNewCategoryName("");
    setNewCategoryAmount("");
    setNewCategoryBills("");
  };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
        {/* Screen title */}
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Category Screen
        </Text>

        {/* Dropdown for sorting */}
        <View style={styles.dropdownWrapper}>
          <DropDownPicker
            open={open}
            value={sortBy}
            items={items}
            setOpen={setOpen}
            setValue={setSortBy}
            setItems={setItems}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        </View>

        {/* List of categories */}
        <FlatList
          data={sortedCategories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onLongPress={() => handleLongPress(item.id)}
              delayLongPress={2000}
              onPress={() => {
                if (isSelectionMode) toggleSelection(item.id);
              }}
            >
              <View
                style={[
                  styles.categoryCard,
                  selectedCategories.includes(item.id) && styles.selectedCard,
                ]}
              >
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryAmount}>₹{item.amount}</Text>
                <Text style={styles.categoryBills}>{item.bills} Bills</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{
            paddingTop: 80,
            paddingHorizontal: 5,
            paddingBottom: 120,
          }}
        />

        {/* + Button */}
        {!isSelectionMode && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        )}

        {/* Delete Button */}
        {isSelectionMode && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}

        {/* Modal to add category */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Category</Text>
              <TextInput
                style={styles.input}
                placeholder="Category Name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <TextInput
                style={styles.input}
                placeholder="Total Amount"
                keyboardType="numeric"
                value={newCategoryAmount}
                onChangeText={setNewCategoryAmount}
              />
              <TextInput
                style={styles.input}
                placeholder="No. of Bills"
                keyboardType="numeric"
                value={newCategoryBills}
                onChangeText={setNewCategoryBills}
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
      </View>
      <BottomNavBar currentScreen="Category" navigation={navigation} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 28,
    color: "darkblue",
    fontWeight: "600",
    marginBottom: 15,
  },
  dropdownWrapper: {
    position: "absolute",
    top: 65,
    left: 15,
    right: 15,
    zIndex: 1000,
    elevation: 1000,
  },
  dropdown: {
    borderColor: "#6A5ACD",
    backgroundColor: "#fff",
  },
  dropdownContainer: {
    borderColor: "#6A5ACD",
  },
  categoryCard: {
    backgroundColor: "#E6E6FA",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#6A5ACD",
  },
  selectedCard: {
    backgroundColor: "#D8BFD8",
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  categoryAmount: {
    fontSize: 16,
    marginTop: 5,
    color: "#555",
  },
  categoryBills: {
    fontSize: 14,
    marginTop: 3,
    color: "#777",
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
    elevation: 5,
  },
  fabText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  deleteButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#c70000",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 5,
  },
  deleteText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
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
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
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
});
