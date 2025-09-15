import React, { useState } from "react";
import { View, TextInput, Button, Text, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "src/firebaseConfig";

export default function Signup({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setMessage("Account created! You can now log in.");
      navigation.navigate("Login");
    } catch (err: any) {
      let errorMsg = "Something went wrong. Please try again.";

      switch (err.code) {
        case "auth/invalid-email":
          errorMsg = "Invalid email format. Please check again.";
          break;
        case "auth/user-not-found":
          errorMsg = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMsg = "Incorrect password. Try again.";
          break;
        case "auth/too-many-requests":
          errorMsg =
            "Too many failed attempts. Please wait and try again later.";
          break;
        case "auth/missing-password":
          errorMsg = "password field empty. Please enter password.";
          break;
        case "auth/invalid-credential":
          errorMsg = "password is wrong. Please check password.";
          break;
        default:
          errorMsg = err.message; // fallback to Firebase’s default msg
      }

      setMessage(errorMsg);
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 2,
          borderRadius: 10,
          marginBottom: 20,
          paddingHorizontal: 10,
        }}
      >
        <TextInput
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={{
            flex: 1,
            paddingVertical: 10,
          }}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={{ color: "#003366", fontWeight: "600", marginLeft: 10 }}>
            {showPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

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
