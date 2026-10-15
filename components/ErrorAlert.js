import React from "react";
import { View } from "react-native";
import Text from "./AppText";

export default function ErrorAlert({ error }) {
  if (!error) return null;

  return (
    <View className="bg-red-200 border-l-4 border-red-600 px-3 py-2.5 mb-4 rounded">
      <Text className="text-red-900 font-semibold text-sm">
        ⚠️ {error}
      </Text>
    </View>
  );
}
