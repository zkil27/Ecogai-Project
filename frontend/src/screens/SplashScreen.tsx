import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { splashStyles as styles } from "../styles/splashStyles";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to welcome after 3 seconds
    const timer = setTimeout(() => {
      router.replace("/welcome");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>🌿</Text>
      </View>

      <Text style={styles.title}>
        <Text style={styles.titleWhite}>ECOG</Text>
        <Text style={styles.titleBlack}>AI</Text>
      </Text>
    </View>
  );
}
