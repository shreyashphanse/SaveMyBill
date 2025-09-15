import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "src/firebaseConfig";
import { useUser } from "../(extraScreens)/UserContext"; // 👈 import context

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { setUser } = useUser(); // 👈 get setUser from context

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const loggedInUser = userCredential.user;

      // 👇 update global user context
      setUser({ uid: loggedInUser.uid, email: loggedInUser.email });

      setMessage("Login successful!");
      Alert.alert("Success", "You are now logged in.");
      // No need for navigation.replace("MainStack") – MainNavigator will switch automatically
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10, width: "100%" }}
      />
      <TextInput
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 20, width: "100%" }}
      />
      <Button title="Login" onPress={handleLogin} />
      <Text style={{ marginTop: 10 }}>{message}</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={{ marginTop: 20, color: "blue" }}>
          Don’t have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}
