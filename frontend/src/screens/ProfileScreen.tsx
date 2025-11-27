/**
 * PROFILE SCREEN
 * User profile and settings - matches UI mockup
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { colors, fontFamily, fontSize, spacing, borderRadius, shadows } from "../styles/theme";
import { User } from "../types";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // Demo mode - use mock data
    setUser({
      id: "1",
      name: "Reika",
      email: "Reika@pcu.edu.ph",
    });
    setLoading(false);
  }, []);

  const handlePickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library to upload a profile picture.");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
      Alert.alert("Success", "Profile picture updated!");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            router.replace("/welcome");
          },
        },
      ]
    );
  };

  const handleMenuPress = (item: string) => {
    Alert.alert(item, `${item} feature coming soon!`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>
          <Text style={styles.titleGreen}>Pro</Text>
          <Text style={styles.titleBlack}>file</Text>
        </Text>

        {/* Top Row: Stats Card & Profile Photo */}
        <View style={styles.topRow}>
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Spots</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumberGray}>5</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>

          {/* Profile Photo Section */}
          <View style={styles.profilePhotoSection}>
            <Text style={styles.userEmail}>{user?.email || "user@email.com"}</Text>
            <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarIcon}>📷</Text>
                  <Text style={styles.avatarText}>Tap to upload</Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>✏️</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Middle Row: Preference & Account */}
        <View style={styles.middleRow}>
          {/* Preference Card */}
          <View style={styles.preferenceCard}>
            <Text style={styles.cardTitle}>Preference</Text>
            
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Push Notification</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.lightGreen }}
                thumbColor={notifications ? colors.primary.green : colors.neutral.gray}
                style={styles.switch}
              />
            </View>
            
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: colors.neutral.lightGray, true: colors.primary.lightGreen }}
                thumbColor={darkMode ? colors.primary.green : colors.neutral.gray}
                style={styles.switch}
              />
            </View>
          </View>

          {/* Account Card */}
          <View style={styles.accountCard}>
            <Text style={styles.cardTitle}>Account</Text>
            
            <TouchableOpacity onPress={() => handleMenuPress("Medical Condition")}>
              <Text style={styles.menuItemText}>Medical Condition</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleMenuPress("My Spots")}>
              <Text style={styles.menuItemText}>My Spots</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => handleMenuPress("Saved Location")}>
              <Text style={styles.menuItemText}>Saved Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Card */}
        <View style={styles.supportCard}>
          <Text style={styles.cardTitle}>Support</Text>
          
          <TouchableOpacity onPress={() => handleMenuPress("Help Center")}>
            <Text style={styles.menuItemText}>Help Center</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleMenuPress("Privacy Policy")}>
            <Text style={styles.menuItemText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleMenuPress("Terms of Service")}>
            <Text style={styles.menuItemText}>Terms of Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleMenuPress("Bug Report")}>
            <Text style={styles.menuItemText}>Bug Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleMenuPress("About us")}>
            <Text style={styles.menuItemText}>About us</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: 120,
  },

  // Title
  title: {
    fontSize: 32,
    fontFamily: fontFamily.headingBold,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  titleGreen: {
    color: colors.primary.green,
  },
  titleBlack: {
    color: colors.text.primary,
  },

  // Top Row
  topRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  statsCard: {
    flex: 1,
    backgroundColor: colors.neutral.offWhite,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: colors.neutral.darkGray,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 36,
    fontFamily: fontFamily.headingBold,
    color: colors.primary.green,
    fontStyle: "italic",
  },
  statNumberGray: {
    fontSize: 36,
    fontFamily: fontFamily.headingBold,
    color: colors.neutral.gray,
    fontStyle: "italic",
  },
  statLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Profile Photo
  profilePhotoSection: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.neutral.offWhite,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.darkGray,
  },
  userEmail: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    fontStyle: "italic",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    backgroundColor: colors.neutral.lightGray,
    position: "relative",
    borderWidth: 1,
    borderColor: colors.neutral.darkGray,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: borderRadius.xl,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral.offWhite,
  },
  avatarIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  avatarText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  editBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral.white,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sm,
  },
  editBadgeText: {
    fontSize: 14,
  },

  // Middle Row
  middleRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  preferenceCard: {
    flex: 1,
    backgroundColor: colors.neutral.offWhite,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.darkGray,
  },
  accountCard: {
    flex: 1,
    backgroundColor: colors.neutral.offWhite,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral.darkGray,
  },
  cardTitle: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.headingSemiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  toggleLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
    color: colors.text.secondary,
    flex: 1,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  menuItemText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.body,
    color: colors.text.secondary,
    paddingVertical: spacing.xs,
  },

  // Support Card
  supportCard: {
    backgroundColor: colors.neutral.offWhite,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    width: "60%",
    borderWidth: 1,
    borderColor: colors.neutral.darkGray,
  },

  // Logout Button
  logoutButton: {
    backgroundColor: "rgba(229, 57, 53, 0.08)",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.neutral.darkGray,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  logoutButtonText: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.bodySemiBold,
    color: "#E53935",
  },
});
