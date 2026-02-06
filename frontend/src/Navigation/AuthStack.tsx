import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../(authScreens)/Login";
import Signup from "../(authScreens)/Signup";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
}
