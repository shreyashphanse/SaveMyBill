import React from "react";
import { View, Text } from "react-native";
export default function Report({ navigation }: { navigation: any }) {
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          alignItems: "center",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        Report Screen
      </Text>
    </View>
  );
}
