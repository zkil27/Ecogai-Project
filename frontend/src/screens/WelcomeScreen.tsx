import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { welcomeStyles as styles } from "../styles/welcomeStyles";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo and Title */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>

        <Text style={styles.title}>
          <Text style={styles.titleGreen}>ECOG</Text>
          <Text style={styles.titleBlack}>AI</Text>
        </Text>

        <Text style={styles.subtitle}>
          <Text style={styles.subtitleGreen}>
            Your Health and Safety,{"\n"}
          </Text>
          <Text style={styles.subtitleGreen}>Mapped in </Text>
          <Text style={styles.subtitleBlack}>Real-Time</Text>
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.primaryButtonText}>Join the Community</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.secondaryButtonText}>
            I already have an account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
