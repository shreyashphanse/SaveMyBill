import React, { useState } from "react";
import { View, TextInput, Button, Text, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "src/firebaseConfig";

export default function Signup({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Account created! You can now log in.");
      navigation.navigate("Login");
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
      <Text style={{ fontSize: 45, fontWeight: "bold", color: "#003366" }}>
        Sign-Up
      </Text>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 2,
          borderRadius: 10,
          padding: 10,
          marginBottom: 10,
          width: "100%",
        }}
      />
      <TextInput
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 2,
          borderRadius: 10,
          padding: 10,
          marginBottom: 20,
          width: "100%",
        }}
      />
      <TouchableOpacity
        style={{
          width: "50%",
          height: 50, // better to use fixed height instead of %
          backgroundColor: "#003366",
          borderRadius: 13,
          justifyContent: "center", // centers vertically
          alignItems: "center", // centers horizontally
        }}
        onPress={handleSignup}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          Sign Up
        </Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 10, color: "red" }}>{message}</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={{ marginTop: 20, color: "#003366" }}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
