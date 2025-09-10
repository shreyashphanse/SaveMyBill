import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import ProfileScreen from "./src/(mainScreens)/ProfileScreen";
import CategoryScreen from "./src/(mainScreens)/CategoryScreen";
import UploadScreen from "./src/(mainScreens)/UploadScreen";
import HomeScreen from "./src/(mainScreens)/HomeScreen";
import BillScreen from "./src/(mainScreens)/BillScreen";
import { ThemeProvider } from "./src/(extraScreens)/ThemeContext";
import Report from "./src/(extraScreens)/Report";

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Bill" component={BillScreen} />
          <Stack.Screen name="Upload" component={UploadScreen} />
          <Stack.Screen name="Category" component={CategoryScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Report" component={Report} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
