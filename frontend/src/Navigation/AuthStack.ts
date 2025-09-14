import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "src/(authScreens)/Login";
import Signup from "src/(authScreens)/Signup";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
}
