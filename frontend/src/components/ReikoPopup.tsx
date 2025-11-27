/**
 * REIKO AI POPUP
 * AI assistant greeting popup in bottom nav
 */

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { reikoStyles as styles } from "../styles/reikoStyles";

interface ReikoPopupProps {
  onClose: () => void;
}

export default function ReikoPopup({ onClose }: ReikoPopupProps) {
  const router = useRouter();

  const handleOpenChat = () => {
    router.push("/chat");
  };

  return (
    <TouchableOpacity
      style={styles.popupHeader}
      onPress={handleOpenChat}
      activeOpacity={0.8}
    >
      <Text style={styles.popupTitle}>ReikoAI</Text>
      <Text style={styles.popupMessage}>
        Hello! I'm Reiko, your AI assistant. How can I help you today?
      </Text>
    </TouchableOpacity>
  );
}
