import React, { useState, useMemo } from "react";
import BottomNavBar from "../components/BottomNavBar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "../(extraScreens)/ThemeContext";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Modal,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BillScreen({ navigation }: { navigation: any }) {
  const handleaddbill = () => {
    navigation?.navigate?.("Upload");
  };
  const [search, setSearch] = useState("");
  const { theme } = useTheme();

  // Filter dropdown
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("all");
  const [filterItems, setFilterItems] = useState([
    { label: "All", value: "all" },
    { label: "Food", value: "food" },
    { label: "Electronics", value: "electronics" },
    { label: "Travel", value: "travel" },
    { label: "Shopping", value: "shopping" },
    { label: "Health", value: "health" },
  ]);

  // Sort dropdown
  const [sortOpen, setSortOpen] = useState(false);
  const [sortValue, setSortValue] = useState("az");
  const [sortItems, setSortItems] = useState([
    { label: "A - Z", value: "az" },
    { label: "By Amount", value: "amount" },
    { label: "Expiry Date", value: "expiry" },
  ]);

  // Modal state
  const [selectedBill, setSelectedBill] = useState<any>(null);

  // Dummy bills
  const bills = [
    {
      id: "1",
      title: "Pizza Hut",
      details: "Food - ₹450",
      amount: 450,
      category: "food",
      date: "05/09/2025",
      image: "https://via.placeholder.com/300",
    },
    {
      id: "2",
      title: "Amazon",
      details: "Electronics - ₹2000",
      amount: 2000,
      category: "electronics",
      date: "02/09/2025",
      image: "https://via.placeholder.com/300",
    },
    {
      id: "3",
      title: "Apollo Pharmacy",
      details: "Health - ₹750",
      amount: 750,
      category: "health",
      date: "01/09/2025",
      image: "https://via.placeholder.com/300",
    },
  ];

  // Apply search + filter + sort
  const filteredBills = useMemo(() => {
    let data = [...bills];

    // Filter
    if (filterValue !== "all") {
      data = data.filter((bill) => bill.category === filterValue);
    }

    // Search
    if (search.trim() !== "") {
      const lowerSearch = search.toLowerCase();
      data = data.filter(
        (bill) =>
          bill.title.toLowerCase().includes(lowerSearch) ||
          bill.details.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    if (sortValue === "az") {
      data.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortValue === "amount") {
      data.sort((a, b) => b.amount - a.amount);
    } else if (sortValue === "expiry") {
      data.sort(
        (a, b) =>
          new Date(b.date.split("/").reverse().join("-")).getTime() -
          new Date(a.date.split("/").reverse().join("-")).getTime()
      );
    }

    return data;
  }, [bills, filterValue, search, sortValue]);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 20, backgroundColor: theme.background }}>
        {/* Title */}
        <Text style={[styles.title, { color: theme.text.primary }]}>
          My Bills
        </Text>

        {/* Search Bar */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search bills..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Filter Dropdown */}
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

        {/* Sort Dropdown */}
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

        {/* Bills List */}
        <FlatList
          data={filteredBills}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedBill(item)}>
              <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
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

        {/* Floating Add Button */}
        <TouchableOpacity style={styles.fab} onPress={handleaddbill}>
          <Text style={{ color: "#fff", fontSize: 30, fontWeight: "bold" }}>
            +
          </Text>
        </TouchableOpacity>

        {/* Full Screen Bill Modal */}
        <Modal visible={!!selectedBill} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedBill && (
                <>
                  <Image
                    source={{ uri: selectedBill.image }}
                    style={styles.modalImage}
                  />
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
      <BottomNavBar currentScreen="Bill" navigation={navigation} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    color: "darkblue",
    fontWeight: "600",
    marginBottom: 20,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  dropdown: {
    borderColor: "#6A5ACD",
    borderRadius: 10,
  },
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
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cardDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  cardDate: {
    fontSize: 13,
    color: "darkblue",
    marginTop: 4,
  },
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
  modalImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "darkblue",
    marginBottom: 10,
  },
  modalDetails: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "blue",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
