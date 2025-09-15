// HomeScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import BottomNavBar from "../components/BottomNavBar";
import { useTheme } from "../(extraScreens)/ThemeContext";
import { useUser } from "../(extraScreens)/UserContext";
import { API_BASE_URL } from "../../config/app";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const screenWidth = Dimensions.get("window").width;
const cardWidth = screenWidth - 46;

type Bill = {
  _id: string;
  name?: string;
  date: string; // "DD/MM/YYYY"
  amount: string;
  category: string;
  imageUri?: string | null;
  description?: string;
};

export default function HomeScreen({ navigation, fallbackName = "User" }: any) {
  const { theme } = useTheme();
  const { user } = useUser();
  const [name, setName] = useState<string>(fallbackName);
  const [search, setSearch] = useState("");
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [cardDetailModalVisible, setCardDetailModalVisible] = useState(false);
  const [cardDetailContent, setCardDetailContent] = useState<any>(null);
  const [expiryListModalVisible, setExpiryListModalVisible] = useState(false);
  const [billDetailModalVisible, setBillDetailModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [totalBillsCount, setTotalBillsCount] = useState(0);
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const userId = user?.uid;

  // Fetch latest 10 bills from backend
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
        const billsArray = data.bills;
        if (!Array.isArray(billsArray)) {
          console.error("Expected array but got:", billsArray);
          return;
        }

        setTotalBillsCount(Array.isArray(data.bills) ? data.bills.length : 0);
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
          category: bill.categoryName,
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

  useEffect(() => {
    const loadUserData = async () => {
      const storedName = await AsyncStorage.getItem("userName");
      if (storedName) setName(storedName);
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (userId) {
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
                ? `${API_BASE_URL}/${bill.imageUrl}`
                : null,
              description: bill.description || "",
            }));
            setRecentBills(mappedBills);
          })
          .catch((err) =>
            console.error("Error fetching recent bills on focus:", err)
          );
      }
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
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
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
    } else if (cardIndex === 1) {
      content = {
        title: "Number of Bills Uploaded",
        subtitle: numBillsUploaded,
        description:
          "Count of bills you've saved. Keep uploading to track expenses better.",
      };
    } else {
      content = { title: "Card", subtitle: "--", description: "Details" };
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
    const opts: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return d.toLocaleDateString(undefined, opts);
  };

  const filteredRecent = useMemo(() => {
    if (!recentBills || recentBills.length === 0) return [];
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
    <SafeAreaProvider style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: 5 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <FlatList
          data={filteredRecent}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recentCard}
              activeOpacity={0.8}
              onPress={() => openBillDetail(item)}
            >
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.recentImage}
                />
              ) : (
                <View style={[styles.recentImage, styles.noImage]}>
                  <Text style={{ color: theme.text.secondary }}>No Image</Text>
                </View>
              )}
              <View style={styles.recentDetails}>
                <Text style={styles.recentAmount}>₹ {item.amount}</Text>
                <Text style={styles.recentMeta}>
                  {item.date} • {item.category}
                </Text>
                <Text style={styles.recentName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 18 }}
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
              <View style={styles.emojiRow}>
                {/* 1️⃣ Bill History */}
                <TouchableOpacity
                  style={styles.emojiBtn}
                  onPress={() => navigation.navigate("Bill")}
                >
                  <Text style={styles.emoji}>🧾</Text>
                  <Text
                    style={[styles.emojiLabel, { color: theme.text.secondary }]}
                  >
                    Bill History
                  </Text>
                </TouchableOpacity>

                {/* 2️⃣ Manage Notifications */}
                <TouchableOpacity
                  style={styles.emojiBtn}
                  onPress={() => navigation.navigate("Profile")}
                >
                  <Text style={styles.emoji}>🔔</Text>
                  <Text
                    style={[styles.emojiLabel, { color: theme.text.secondary }]}
                  >
                    Notifications
                  </Text>
                </TouchableOpacity>

                {/* 3️⃣ Filter Bills */}
                <TouchableOpacity
                  style={styles.emojiBtn}
                  onPress={() => navigation.navigate("Bill")}
                >
                  <Text style={styles.emoji}>🔍</Text>
                  <Text
                    style={[styles.emojiLabel, { color: theme.text.secondary }]}
                  >
                    Filter Bills
                  </Text>
                </TouchableOpacity>

                {/* 4️⃣ Generate Report */}
                <TouchableOpacity
                  style={styles.emojiBtn}
                  onPress={() => navigation.navigate("Report")}
                >
                  <Text style={styles.emoji}>📊</Text>
                  <Text
                    style={[styles.emojiLabel, { color: theme.text.secondary }]}
                  >
                    Report
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          }
        />
      </View>
      <BottomNavBar currentScreen="Home" navigation={navigation} />
    </SafeAreaProvider>
  );
}

// Keep your existing styles here (no change)
const styles = StyleSheet.create({
  titleRow: { alignItems: "center", marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "700", color: "darkblue" },
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
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#333" },
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginHorizontal: 10,
    bottom: 20,
  },
  emojiBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: { fontSize: 36, marginBottom: 6 },
  emojiLabel: { fontSize: 12, textAlign: "center" },

  recentImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  noImage: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#888",
  },
  recentDetails: { marginLeft: 12, flex: 1 },
  recentAmount: { fontSize: 17, fontWeight: "800", color: "#111" },
  recentMeta: { fontSize: 13, color: "#666", marginTop: 2 },
  recentName: { fontSize: 15, fontWeight: "500", marginTop: 3 },
});
