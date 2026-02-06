import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function Signup({ navigation }: any) {
  const [name, setName] = useState(""); // 👈 new state for name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      setMessage("Account created! You can now log in.");
      navigation.navigate("Login");
    } catch (err: any) {
      let errorMsg = "Something went wrong. Please try again.";

      switch (err.code) {
        case "auth/invalid-email":
          errorMsg = "Invalid email format. Please check again.";
          break;
        case "auth/missing-password":
          errorMsg = "Password field empty. Please enter password.";
          break;
        case "auth/email-already-in-use":
          errorMsg = "This email is already registered.";
          break;
        default:
          errorMsg = err.message;
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

      {/*  Name input */}
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 2,
          borderRadius: 10,
          padding: 10,
          marginBottom: 10,
          width: "100%",
        }}
      />

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
          height: 50,
          backgroundColor: "#003366",
          borderRadius: 13,
          justifyContent: "center",
          alignItems: "center",
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
