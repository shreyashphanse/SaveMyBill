import React, { useState, useMemo, useEffect } from "react";
import BottomNavBar from "../components/BottomNavBar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "../(extraScreens)/ThemeContext";
import { BackHandler } from "react-native";
import { API_BASE_URL } from "../../config/app";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Modal,
  Alert,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useUser } from "../(extraScreens)/UserContext";
import { useCategory } from "../components/categoryContext";

export default function BillScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const { user } = useUser();
  const userId = user?.uid;
  const { categoryDict, idToCategoryDict } = useCategory();

  const handleaddbill = () => {
    navigation?.navigate?.("Upload");
  };

  const [search, setSearch] = useState("");

  // Bills
  const [bills, setBills] = useState<any[]>([]);

  // Dropdown & sort states
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("all");
  const [filterItems, setFilterItems] = useState<
    { label: string; value: string }[]
  >([]);

  const [sortOpen, setSortOpen] = useState(false);
  const [sortValue, setSortValue] = useState("az");
  const [sortItems, setSortItems] = useState([
    { label: "A - Z", value: "az" },
    { label: "By Amount", value: "amount" },
    { label: "Expiry Date", value: "expiry" },
  ]);

  // Selection & modal
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  // Populate filterItems from categoryDict
  useEffect(() => {
    const items = [
      { label: "All", value: "all" },
      ...Object.entries(categoryDict).map(([name, _id]) => ({
        label: name,
        value: _id,
      })),
    ];
    setFilterItems(items);
  }, [categoryDict]);

  // Close filter dropdown when items update
  useEffect(() => {
    setFilterOpen(false);
  }, [filterItems]);

  // Fetch bills
  useEffect(() => {
    if (!userId || Object.keys(idToCategoryDict).length === 0) return;

    const fetchBills = async () => {
      const res = await fetch(`${API_BASE_URL}/api/bills?userId=${userId}`);
      const data = await res.json();
      const billsArray = data.bills || [];

      const mappedBills = billsArray.map((bill: any) => {
        console.log("Bill imageUrl:", bill.imageUrl);
        return {
          id: bill._id,
          title: bill.title,
          amount: bill.amount,
          categoryId: bill.category,
          categoryName: idToCategoryDict[bill.category] ?? "Unknown",
          date: bill.expiryDate,
          image: bill.imageUrl
            ? `${API_BASE_URL}/${bill.imageUrl.replace(/^\/+/, "")}`
            : null,
          details: `${idToCategoryDict[bill.category] ?? ""} - ₹${bill.amount}`,
        };
      });

      setBills(mappedBills);
    };

    fetchBills();
  }, [userId, idToCategoryDict]);

  // Handle long press on bills
  const handleLongPress = (id: string) => {
    setIsSelectionMode(true);
    toggleSelection(id);
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedBills((prev) =>
      prev.includes(id)
        ? prev.filter((billId) => billId !== id)
        : [...prev, id],
    );
  };

  // Delete bills
  const handleDelete = async () => {
    if (selectedBills.length === 0) {
      Alert.alert("No bills selected", "Please select bills to delete.");
      return;
    }
    try {
      for (const id of selectedBills) {
        const res = await fetch(`${API_BASE_URL}/api/bills/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error(`Failed to delete bill ${id}`);
      }
      setBills((prev) =>
        prev.filter((bill) => !selectedBills.includes(bill.id)),
      );
      setSelectedBills([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error("Error deleting bills:", error);
      Alert.alert("Error", "Failed to delete bills.");
    }
  };

  // Filter + search + sort
  const filteredBills = useMemo(() => {
    let data = [...bills];

    // Filter by category
    if (filterValue !== "all") {
      data = data.filter((bill) => bill.categoryId === filterValue);
    }

    // Search
    if (search.trim() !== "") {
      const lowerSearch = search.toLowerCase();
      data = data.filter(
        (bill) =>
          bill.title.toLowerCase().includes(lowerSearch) ||
          bill.categoryName.toLowerCase().includes(lowerSearch) ||
          bill.amount.toString().includes(lowerSearch),
      );
    }

    // Sort
    if (sortValue === "az") data.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortValue === "amount") data.sort((a, b) => b.amount - a.amount);
    else if (sortValue === "expiry")
      data.sort(
        (a, b) =>
          new Date(b.date.split("/").reverse().join("-")).getTime() -
          new Date(a.date.split("/").reverse().join("-")).getTime(),
      );

    return data;
  }, [bills, filterValue, search, sortValue]);

  // Exit delete mode on back button
  useEffect(() => {
    const backAction = () => {
      if (isSelectionMode) {
        setIsSelectionMode(false);
        setSelectedBills([]);
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
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {" "}
            My Bills{" "}
          </Text>

          <TextInput
            style={styles.searchBar}
            placeholder="Search bills..."
            value={search}
            onChangeText={setSearch}
          />

          {/* Filter */}
          <View style={{ zIndex: 2000, marginBottom: 15 }}>
            <DropDownPicker
              open={filterOpen}
              value={filterValue}
              items={filterItems}
              setOpen={setFilterOpen}
              setValue={setFilterValue}
              setItems={setFilterItems}
              placeholder="Filter by category"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          {/* Sort */}
          <View style={{ zIndex: 1000, marginBottom: 15 }}>
            <DropDownPicker
              open={sortOpen}
              value={sortValue}
              items={sortItems}
              setOpen={setSortOpen}
              setValue={setSortValue}
              setItems={setSortItems}
              placeholder="Sort bills"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          {/* Bills list */}
          <FlatList
            data={filteredBills}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onLongPress={() => handleLongPress(item.id)}
                delayLongPress={1000}
                onPress={() => {
                  if (isSelectionMode) toggleSelection(item.id);
                  else setSelectedBill(item);
                }}
              >
                <View
                  style={[
                    styles.card,
                    selectedBills.includes(item.id) && {
                      backgroundColor: "#D8BFD8",
                    },
                  ]}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.cardImage}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDetails}>{item.details}</Text>
                    <Text style={styles.cardDate}>Expiry: {item.date}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          {/* Add Button */}
          <TouchableOpacity style={styles.fab} onPress={handleaddbill}>
            <Text style={{ color: "#fff", fontSize: 30, fontWeight: "bold" }}>
              {" "}
              +{" "}
            </Text>
          </TouchableOpacity>

          {/* Delete Button */}
          {isSelectionMode && (
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>
                {" "}
                Delete Selected ({selectedBills.length}){" "}
              </Text>
            </TouchableOpacity>
          )}

          {/* Modal */}
          <Modal visible={!!selectedBill} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {selectedBill && (
                  <>
                    {selectedBill.image ? (
                      <Image
                        source={{ uri: selectedBill.image }}
                        style={styles.modalImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.modalImage,
                          {
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#888",
                          },
                        ]}
                      >
                        <Text style={{ color: "#fff", fontSize: 16 }}>
                          No Image
                        </Text>
                      </View>
                    )}
                    <Text style={styles.modalTitle}>{selectedBill.title}</Text>
                    <Text style={styles.modalDetails}>
                      {selectedBill.details}
                    </Text>
                    <Text style={styles.modalDetails}>
                      Expiry Date: {selectedBill.date}
                    </Text>
                  </>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedBill(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaProvider>
      <BottomNavBar currentScreen="Bill" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "600", marginBottom: 20 },
  searchBar: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  dropdown: { borderColor: "#6A5ACD", borderRadius: 10 },
  dropdownContainer: {
    borderColor: "#6A5ACD",
    borderRadius: 10,
    zIndex: 9999,
    elevation: 5,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardImage: { width: 60, height: 60, borderRadius: 10, marginRight: 12 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  cardDetails: { fontSize: 14, color: "#666", marginTop: 2 },
  cardDate: { fontSize: 13, color: "darkblue", marginTop: 4 },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 25,
    backgroundColor: "#003366",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalImage: { width: 250, height: 250, borderRadius: 12, marginBottom: 15 },
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
  deleteButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "darkblue",
    marginBottom: 10,
  },
  modalDetails: { fontSize: 16, color: "#555", marginBottom: 5 },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#003366",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
