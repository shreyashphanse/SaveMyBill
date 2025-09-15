// HomeScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  StatusBar,
  Modal,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";
import { useTheme } from "../(extraScreens)/ThemeContext";
import { useUser } from "../(extraScreens)/UserContext";
import { API_BASE_URL } from "../../config/app";

const { width } = Dimensions.get("window");
const screenWidth = width;
const cardWidth = screenWidth - 46;

type Bill = {
  _id: string;
  name?: string;
  date: string;
  amount: string;
  category: string;
  imageUri?: string | null;
  description?: string;
};

export default function HomeScreen({ navigation, fallbackName = "User" }: any) {
  const { theme } = useTheme();
  const { user } = useUser();
  const userId = user?.uid;

  const [name, setName] = useState<string>(fallbackName);
  const [search, setSearch] = useState("");
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [totalBillsCount, setTotalBillsCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardDetailModalVisible, setCardDetailModalVisible] = useState(false);
  const [cardDetailContent, setCardDetailContent] = useState<any>(null);
  const [billDetailModalVisible, setBillDetailModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Fetch bills
  useEffect(() => {
    const fetchBills = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/bills?userId=${userId}`);
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.error("Backend did not return JSON:", text);
          return;
        }

        const billsArray = data.bills || [];
        setTotalBillsCount(billsArray.length);
        setAllBills(billsArray);

        const sorted = billsArray
          .sort(
            (a: any, b: any) =>
              new Date(b.expiryDate).getTime() -
              new Date(a.expiryDate).getTime()
          )
          .slice(0, 10);

        const mappedBills = sorted.map((bill: any) => ({
          _id: bill._id,
          name: bill.title,
          amount: bill.amount,
          category: bill.categoryName || "—",
          date: bill.expiryDate,
          imageUri: bill.imageUrl ? `${API_BASE_URL}/${bill.imageUrl}` : null,
          description: bill.description || "",
        }));

        setRecentBills(mappedBills);
      } catch (err) {
        console.error("Error fetching recent bills:", err);
      }
    };

    fetchBills();
  }, [userId]);

  // Load stored user name
  useEffect(() => {
    const loadUserData = async () => {
      const storedName = await AsyncStorage.getItem("userName");
      if (storedName) setName(storedName);
    };
    loadUserData();
  }, []);

  // Refresh bills on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (!userId) return;
      fetch(`${API_BASE_URL}/api/bills?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          const billsArray = data.bills || [];
          const sorted = billsArray
            .sort(
              (a: any, b: any) =>
                new Date(b.expiryDate).getTime() -
                new Date(a.expiryDate).getTime()
            )
            .slice(0, 10);
          const mappedBills = sorted.map((bill: any) => ({
            _id: bill._id,
            name: bill.title,
            amount: bill.amount,
            category: bill.categoryName || "—",
            date: bill.expiryDate,
            imageUri: bill.imageUrl
              ? `${API_BASE_URL}/${bill.imageUrl.replace(/^\/+/, "")}`
              : null,
            description: bill.description || "",
          }));
          setRecentBills(mappedBills);
        })
        .catch((err) => console.error("Error fetching bills on focus:", err));
    });

    return unsubscribe;
  }, [navigation, userId]);

  const totalSpentThisMonth = `₹ ${allBills.reduce(
    (acc, b) => acc + Number(b.amount),
    0
  )}`;
  const numBillsUploaded = `${totalBillsCount}`;
  const cardsData = [
    { id: "c1", title: "Total Spent", subtitle: totalSpentThisMonth },
    { id: "c2", title: "Bills Uploaded", subtitle: numBillsUploaded },
  ];

  const onScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index % cardsData.length);
  };

  const openCardDetail = (cardIndex: number) => {
    let content;
    if (cardIndex === 0) {
      content = {
        title: "Total Spent This Month",
        subtitle: totalSpentThisMonth,
        description:
          "Sum of all bills recorded for the current month. Tap to see breakdown by category in Reports.",
      };
    } else {
      content = {
        title: "Number of Bills Uploaded",
        subtitle: numBillsUploaded,
        description:
          "Count of bills you've saved. Keep uploading to track expenses better.",
      };
    }
    setCardDetailContent(content);
    setCardDetailModalVisible(true);
  };

  const openBillDetail = (bill: Bill) => {
    setSelectedBill(bill);
    setBillDetailModalVisible(true);
  };

  const getTodayString = () => {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredRecent = useMemo(() => {
    if (!recentBills) return [];
    const lowerSearch = search.toLowerCase();
    return recentBills.filter((bill) => {
      const name = bill.name?.toLowerCase() || "";
      const category = bill.category?.toLowerCase() || "";
      const amount = bill.amount?.toString() || "";
      return (
        name.includes(lowerSearch) ||
        category.includes(lowerSearch) ||
        amount.includes(lowerSearch)
      );
    });
  }, [recentBills, search]);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, padding: 5 }}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
          <FlatList
            ListHeaderComponent={
              <>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: theme.text.primary }]}>
                    Save My Bill
                  </Text>
                </View>

                <View style={styles.searchRow}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search bills, categories..."
                    value={search}
                    onChangeText={setSearch}
                    returnKeyType="search"
                  />
                </View>

                <View style={styles.dateRow}>
                  <View style={{ flex: 1 }} />
                  <Text
                    style={[styles.dateText, { color: theme.text.secondary }]}
                  >
                    {getTodayString()}
                  </Text>
                </View>

                <Text
                  style={[styles.welcomeText, { color: theme.text.highlight }]}
                >
                  Welcome {name}!
                </Text>

                {/* Info Cards */}
                <View style={styles.cardsSection}>
                  <FlatList
                    data={cardsData}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    onMomentumScrollEnd={onScrollEnd}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => openCardDetail(index)}
                        style={[styles.infoCard, { width: cardWidth }]}
                      >
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <View style={styles.dotsRow}>
                    {cardsData.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          { opacity: i === activeIndex ? 1 : 0.2 },
                        ]}
                      />
                    ))}
                  </View>
                </View>

                {/* Emoji buttons */}
                <View style={styles.emojiRow}>
                  <TouchableOpacity
                    style={styles.emojiBtn}
                    onPress={() => navigation.navigate("Bill")}
                  >
                    <Text style={styles.emoji}>🧾</Text>
                    <Text
                      style={[
                        styles.emojiLabel,
                        { color: theme.text.secondary },
                      ]}
                    >
                      Bill History
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.emojiBtn}
                    onPress={() => navigation.navigate("Profile")}
                  >
                    <Text style={styles.emoji}>🔔</Text>
                    <Text
                      style={[
                        styles.emojiLabel,
                        { color: theme.text.secondary },
                      ]}
                    >
                      Notifications
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.emojiBtn}
                    onPress={() => navigation.navigate("Bill")}
                  >
                    <Text style={styles.emoji}>🔍</Text>
                    <Text
                      style={[
                        styles.emojiLabel,
                        { color: theme.text.secondary },
                      ]}
                    >
                      Filter Bills
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.emojiBtn}
                    onPress={() => navigation.navigate("Report")}
                  >
                    <Text style={styles.emoji}>📊</Text>
                    <Text
                      style={[
                        styles.emojiLabel,
                        { color: theme.text.secondary },
                      ]}
                    >
                      Report
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            }
            data={filteredRecent}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => openBillDetail(item)}
                style={styles.recentCard}
              >
                {item.imageUri ? (
                  <Image
                    source={{ uri: item.imageUri }}
                    style={styles.recentImage}
                  />
                ) : (
                  <View style={styles.noImage}>
                    <Text style={{ color: "#fff" }}>No Image</Text>
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardDetails}>₹{item.amount}</Text>
                  <Text style={styles.cardDate}>Expiry: {item.date}</Text>
                </View>
                {/* {item.category} - */}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 18 }}
          />
          {/* Bill Detail Modal */}
          <Modal
            visible={billDetailModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setBillDetailModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              <View
                style={{
                  width: "100%",
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                {/* Bill Image */}
                {selectedBill?.imageUri ? (
                  <Image
                    source={{ uri: selectedBill.imageUri }}
                    style={{ width: "100%", height: 200, borderRadius: 12 }}
                  />
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: 200,
                      borderRadius: 12,
                      backgroundColor: "#888",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff" }}>No Image</Text>
                  </View>
                )}

                {/* Bill Info */}
                <View style={{ marginTop: 15 }}>
                  <Text
                    style={{ fontSize: 18, fontWeight: "700", color: "#333" }}
                  >
                    {selectedBill?.name || "—"}
                  </Text>

                  <Text style={{ fontSize: 16, color: "#555", marginTop: 6 }}>
                    Amount: ₹{selectedBill?.amount || "0"}
                  </Text>

                  {/* <Text style={{ fontSize: 16, color: "#555", marginTop: 4 }}>
                  Category:{" "}
                  {selectedBill?.category && selectedBill.category !== ""
                    ? selectedBill.category
                    : "—"}
                </Text> */}

                  <Text
                    style={{ fontSize: 14, color: "darkblue", marginTop: 4 }}
                  >
                    Expiry: {selectedBill?.date || "—"}
                  </Text>

                  {selectedBill?.description ? (
                    <Text style={{ fontSize: 14, color: "#666", marginTop: 6 }}>
                      Description: {selectedBill.description}
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={{
                    marginTop: 20,
                    backgroundColor: "#003366",
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                  onPress={() => setBillDetailModalVisible(false)}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaProvider>
      <BottomNavBar currentScreen="Home" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { alignItems: "center", marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "700" },
  searchRow: { marginBottom: 8 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  dateRow: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  dateText: { fontSize: 13, color: "#555" },
  welcomeText: { fontSize: 40, fontWeight: "800", marginVertical: 12 },
  cardsSection: { marginTop: 6, marginBottom: 18 },
  infoCard: {
    backgroundColor: "#eef2ff",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  cardSubtitle: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 8,
    color: "#0b4d91",
  },
  dotsRow: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "#0b4d91",
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  recentImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#ddd",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#888",
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  cardDetails: { fontSize: 14, color: "#666", marginTop: 2 },
  cardDate: { fontSize: 13, color: "darkblue", marginTop: 4 },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginHorizontal: 10,
    bottom: 13,
  },
  emojiBtn: { justifyContent: "center", alignItems: "center" },
  emoji: { fontSize: 36, marginBottom: 6 },
  emojiLabel: { fontSize: 12, textAlign: "center" },
});
