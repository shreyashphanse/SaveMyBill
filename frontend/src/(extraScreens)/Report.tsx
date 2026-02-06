import React, { useEffect, useState } from "react";
import { useCategory } from "../components/categoryContext";
import { PIE_BASE_URL } from "../../config/app";

import {
  View,
  Text,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
// import { PIE_BASE_URL } from "config/app";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function Report({ navigation }: { navigation: any }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { idToCategoryDict } = useCategory();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId || Object.keys(idToCategoryDict).length === 0) return;

    const fetchChartData = async () => {
      try {
        const res = await fetch(`${PIE_BASE_URL}/piechart?userId=${userId}`);
        const data = await res.json();

        if (data.success) {
          const colors = [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#8E44AD",
            "#2ECC71",
          ];
          const chart = data.data.map((item: any, index: number) => ({
            name: item.category, // mapping id -> name
            population: item.total,
            color: colors[index % colors.length],
            legendFontColor: "#333",
            legendFontSize: 15,
          }));
          setChartData(chart);
        } else {
          console.error("Pie chart fetch error:", data.error);
        }
      } catch (err) {
        console.error("Pie chart fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [userId, idToCategoryDict]); // <- include idToCategoryDict as dependency

  const screenWidth = Dimensions.get("window").width;

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 30, marginBottom: 20 }}>Expense Report</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#003366" />
      ) : chartData.length ? (
        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 51, 102, ${opacity})`,
            strokeWidth: 2,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      ) : (
        <Text>No data available</Text>
      )}
    </ScrollView>
  );
}
