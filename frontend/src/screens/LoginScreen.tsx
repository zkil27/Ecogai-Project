import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { loginStyles as styles } from "../styles/loginStyles";
import { colors } from "../styles/theme";
import api from "../services/api";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    console.log('🔐 Login attempt started');
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);

    setLoading(true);
    try {
      console.log('📡 Calling api.login...');
      const response = await api.login(email, password);
      console.log('📥 Login response:', JSON.stringify(response, null, 2));
      setLoading(false);
      
      if (response.success) {
        console.log('✅ Login successful, navigating to home');
        router.replace("/home");
      } else {
        console.log('❌ Login failed:', response.error);
        Alert.alert("Error", response.error || "Login failed. Please try again.");
      }
    } catch (error: any) {
      console.log('💥 Login exception:', error);
      console.log('💥 Error message:', error?.message);
      setLoading(false);
      Alert.alert("Error", error?.message || "Login failed. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Image
            source={require("../../assets/images/back-icon.png")}
            style={styles.backButtonIcon}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>
          <Text style={styles.titleGreen}>LOG</Text>
          <Text style={styles.titleBlack}> IN</Text>
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === "email" && styles.inputFocused,
            ]}
            placeholder="Email"
            placeholderTextColor="#9E9E9E"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === "password" && styles.inputFocused,
            ]}
            placeholder="Password"
            placeholderTextColor="#9E9E9E"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={() => console.log("Navigate to forgot password")}
        >
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Social Login */}
        <Text style={styles.socialText}>Or log in up using</Text>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../assets/images/google-icon.png")}
              style={styles.socialIconImage}
            />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Image
              source={require("../../assets/images/facebook-icon.png")}
              style={styles.socialIconImage}
            />
            <Text style={styles.socialButtonText}>Facebook</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
