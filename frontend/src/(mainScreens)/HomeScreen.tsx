// HomeScreen.tsx
import React, { useEffect, useState } from "react";
import BottomNavBar from "../components/BottomNavBar";
import { useTheme } from "../(extraScreens)/ThemeContext";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const screenWidth = Dimensions.get("window").width;
const cardWidth = screenWidth - 46;

type Bill = {
  id: string;
  name?: string;
  date: string; // "DD/MM/YYYY"
  amount: string;
  category: string;
  imageUri?: string | null;
  description?: string;
};
export default function HomeScreen({
  navigation,
  route,
  fallbackName = "User",
}: any) {
  const [userName, setUserName] = useState<string>(fallbackName);
  const [searchText, setSearchText] = useState("");
  const { theme } = useTheme();

  const [recentBills, setRecentBills] = useState<Bill[]>([
    {
      id: "b1",
      name: "Groceries",
      date: "03/09/2025",
      amount: "1299",
      category: "Food",
      imageUri: "https://via.placeholder.com/120",
      description: "Weekly groceries",
    },
    {
      id: "b2",
      name: "Phone Bill",
      date: "01/09/2025",
      amount: "499",
      category: "Utilities",
      imageUri: "https://via.placeholder.com/120",
      description: "Monthly prepaid recharge",
    },
    {
      id: "b3",
      name: "Headphones",
      date: "28/08/2025",
      amount: "2499",
      category: "Electronics",
      imageUri: "https://via.placeholder.com/120",
      description: "Noise cancelling headphones",
    },
  ]);

  const totalSpentThisMonth = "₹ 4,297";
  const numBillsUploaded = `${recentBills.length}`;
  const highestSpendingCategory = "Electronics";
  const upcomingExpiringBills = recentBills.filter((b) => {
    return b.id === "b3" || b.id === "b2";
  });

  const [cardDetailModalVisible, setCardDetailModalVisible] = useState(false);
  const [cardDetailContent, setCardDetailContent] = useState<any>(null);

  const [expiryListModalVisible, setExpiryListModalVisible] = useState(false);

  const [billDetailModalVisible, setBillDetailModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Cards data
  const cardsData = [
    { id: "c1", title: "Total Spent", subtitle: totalSpentThisMonth },
    { id: "c2", title: "Bills Uploaded", subtitle: numBillsUploaded },
    {
      id: "c3",
      title: "Expiring Soon",
      subtitle: `${upcomingExpiringBills.length} bills`,
    },
  ];

  // Track current card
  const [activeIndex, setActiveIndex] = useState(0);

  const onScrollEnd = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveIndex(index % cardsData.length);
  };

  useEffect(() => {
    const loadName = async () => {
      try {
        const name = await AsyncStorage.getItem("profileName");
        if (name) setUserName(name);
      } catch (e) {}
    };
    loadName();

    const unsubscribe = navigation?.addListener?.("focus", loadName);
    return unsubscribe;
  }, [navigation]);

  const openCardDetail = (cardIndex: number) => {
    if (cardIndex === 2) {
      setExpiryListModalVisible(true);
      return;
    }
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
      content = {
        title: "Card",
        subtitle: "--",
        description: "Details",
      };
    }
    setCardDetailContent(content);
    setCardDetailModalVisible(true);
  };

  const openBillDetail = (bill: Bill) => {
    setSelectedBill(bill);
    setBillDetailModalVisible(true);
  };

  const onBillsHistory = () => {
    navigation?.navigate?.("Bill");
  };
  const onManageNotifications = () => {
    navigation?.navigate?.("Profile");
  };
  const onFilterByCategory = () => {
    navigation?.navigate?.("Bill");
  };
  const onGenerateReport = () => {
    navigation?.navigate?.("Report");
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

  const filteredRecent = recentBills.filter((b) => {
    if (!searchText) return true;
    const s = searchText.toLowerCase();
    return (
      (b.name && b.name.toLowerCase().includes(s)) ||
      (b.category && b.category.toLowerCase().includes(s)) ||
      (b.amount && b.amount.toLowerCase().includes(s))
    );
  });

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 5, backgroundColor: theme.background }}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <FlatList
          data={filteredRecent}
          keyExtractor={(item) => item.id}
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
                  value={searchText}
                  onChangeText={setSearchText}
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
                Welcome {userName} !
              </Text>

              {/* Swipeable cards */}
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

              {/* 4 circular icons */}
              <View style={styles.iconGrid}>
                <TouchableOpacity
                  style={styles.iconCircle}
                  onPress={onBillsHistory}
                >
                  <Text style={styles.iconEmoji}>🧾</Text>
                  <Text
                    style={[styles.iconLabel, { color: theme.text.secondary }]}
                  >
                    Bills History
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconCircle}
                  onPress={onManageNotifications}
                >
                  <Text style={styles.iconEmoji}>🔔</Text>
                  <Text
                    style={[styles.iconLabel, { color: theme.text.secondary }]}
                  >
                    Notifications
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconCircle}
                  onPress={onFilterByCategory}
                >
                  <Text style={styles.iconEmoji}>🔎</Text>
                  <Text
                    style={[styles.iconLabel, { color: theme.text.secondary }]}
                  >
                    Filter
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconCircle}
                  onPress={onGenerateReport}
                >
                  <Text style={styles.iconEmoji}>📊</Text>
                  <Text
                    style={[styles.iconLabel, { color: theme.text.secondary }]}
                  >
                    Report
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.recentHeaderRow}>
                <Text
                  style={[styles.recentTitle, { color: theme.text.secondary }]}
                >
                  Recent
                </Text>
              </View>
            </>
          }
        />

        {/* ---------- Modals ---------- */}
        {/* Generic card detail modal */}
        <Modal
          visible={cardDetailModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setCardDetailModalVisible(false)}
        >
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.cardModalContainer}>
              <Text style={styles.cardModalTitle}>
                {cardDetailContent?.title}
              </Text>
              <Text style={styles.cardModalSubtitle}>
                {cardDetailContent?.subtitle}
              </Text>
              <Text style={styles.cardModalDescription}>
                {cardDetailContent?.description}
              </Text>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setCardDetailModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Expiry list modal */}
        <Modal
          visible={expiryListModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setExpiryListModalVisible(false)}
        >
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.expiryModalContainer}>
              <Text style={styles.expiryModalTitle}>Bills Near Expiry</Text>
              <Text style={styles.expiryModalSubtitle}>
                {upcomingExpiringBills.length} bill(s) expiring soon
              </Text>

              <FlatList
                data={upcomingExpiringBills}
                keyExtractor={(it) => it.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.expiryListItem}
                    onPress={() => {
                      openBillDetail(item);
                    }}
                  >
                    {item.imageUri ? (
                      <Image
                        source={{ uri: item.imageUri }}
                        style={styles.expiryThumb}
                      />
                    ) : (
                      <View style={[styles.expiryThumb, styles.noImage]}>
                        <Text style={{ color: "#fff" }}>No Image</Text>
                      </View>
                    )}
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ fontWeight: "700" }}>
                        {item.name || "Bill"}
                      </Text>
                      <Text>
                        {item.date} • ₹ {item.amount}
                      </Text>
                      <Text style={{ color: "#666" }}>{item.category}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                contentContainerStyle={{ paddingVertical: 18 }}
              />

              <TouchableOpacity
                style={[styles.modalCloseBtn, { marginTop: 12 }]}
                onPress={() => setExpiryListModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Bill detail modal */}
        <Modal
          visible={billDetailModalVisible}
          animationType="slide"
          transparent={false}
          onRequestClose={() => {
            setBillDetailModalVisible(false);
            setSelectedBill(null);
          }}
        >
          <SafeAreaView style={styles.modalSafe}>
            <ScrollView contentContainerStyle={styles.billModalContainer}>
              <Text style={styles.billModalTitle}>
                {selectedBill?.name || "Bill Detail"}
              </Text>

              {selectedBill?.imageUri ? (
                <Image
                  source={{ uri: selectedBill.imageUri }}
                  style={styles.billImage}
                />
              ) : (
                <View style={[styles.billImage, styles.noImage]}>
                  <Text style={{ color: "#fff" }}>No Image</Text>
                </View>
              )}

              <View style={styles.billInfoRow}>
                <Text style={styles.billInfoLabel}>Amount</Text>
                <Text style={styles.billInfoValue}>
                  ₹ {selectedBill?.amount}
                </Text>
              </View>

              <View style={styles.billInfoRow}>
                <Text style={styles.billInfoLabel}>Date</Text>
                <Text style={styles.billInfoValue}>{selectedBill?.date}</Text>
              </View>

              <View style={styles.billInfoRow}>
                <Text style={styles.billInfoLabel}>Category</Text>
                <Text style={styles.billInfoValue}>
                  {selectedBill?.category}
                </Text>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: "700" }}>Description</Text>
                <Text style={{ color: "#444", marginTop: 6 }}>
                  {selectedBill?.description || "—"}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalCloseBtn, { marginTop: 20 }]}
                onPress={() => {
                  setBillDetailModalVisible(false);
                  setSelectedBill(null);
                }}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </View>
      <BottomNavBar currentScreen="Home" navigation={navigation} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "darkblue",
  },
  searchRow: {
    marginBottom: 8,
  },
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
  dateText: {
    fontSize: 13,
    color: "#555",
  },
  welcomeText: {
    fontSize: 40,
    fontWeight: "800",
    marginVertical: 12,
  },
  cardsSection: {
    marginTop: 6,
    marginBottom: 18,
  },
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
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "#0b4d91",
  },
  iconGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 18,
  },
  iconCircle: {
    width: (width - 72) / 4,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 28,
    backgroundColor: "#f1f5ff",
    padding: 14,
    borderRadius: 40,
  },
  iconLabel: {
    marginTop: 6,
    fontSize: 12,
    textAlign: "center",
  },
  recentHeaderRow: {
    marginTop: 6,
    marginBottom: 6,
  },
  recentTitle: { fontSize: 18, fontWeight: "800" },
  recentCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
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
  recentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  recentAmount: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
  },
  recentMeta: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  recentName: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 3,
  },
  modalSafe: { flex: 1, backgroundColor: "#fff" },
  cardModalContainer: {
    flex: 1,
    padding: 20,
  },
  cardModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  cardModalSubtitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0b4d91",
    marginBottom: 10,
  },
  cardModalDescription: {
    fontSize: 15,
    color: "#333",
  },
  modalCloseBtn: {
    marginTop: 20,
    backgroundColor: "#0b4d91",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  expiryModalContainer: {
    flex: 1,
    padding: 20,
  },
  expiryModalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  expiryModalSubtitle: {
    fontSize: 16,
    marginTop: 6,
    color: "#333",
  },
  expiryListItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  expiryThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  billModalContainer: {
    padding: 20,
  },
  billModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  billImage: {
    width: "100%",
    height: 220,
    resizeMode: "cover",
    borderRadius: 12,
    marginBottom: 16,
  },
  billInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  billInfoLabel: { fontWeight: "700" },
  billInfoValue: { fontSize: 16 },
});
