/**
 * BOTTOM NAVIGATION BAR
 * Floating bottom nav with 4 tabs: Info, Profile, Reico, Spot
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { bottomNavStyles as styles } from "../styles/bottomNavStyles";
import { TabName } from "../types";
import ReikoPopup from "./ReikoPopup";

interface BottomNavBarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

// Import nav icons
const NAV_ICONS = {
  info: require("../../assets/images/nav-info.png"),
  profile: require("../../assets/images/nav-profile.png"),
  reico: require("../../assets/images/nav-reico.png"),
  spot: require("../../assets/images/nav-spot.png"),
};

export default function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const [showReikoPopup, setShowReikoPopup] = useState(false);

  const handleTabPress = (tab: TabName) => {
    if (tab === "reico") {
      setShowReikoPopup(!showReikoPopup);
      onTabChange("info"); // Always go to map when Reiko is clicked
    } else {
      setShowReikoPopup(false);
      onTabChange(tab);
    }
  };

  const handleCloseReiko = () => {
    setShowReikoPopup(false);
    onTabChange("info"); // Go back to map when closing Reiko
  };

  // Order: Info, Reico, Profile, Spot (Profile & Spot next to each other)
  const tabs: { name: TabName; label: string }[] = [
    { name: "info", label: "Info" },
    { name: "reico", label: "Reico" },
    { name: "profile", label: "User" },
    { name: "spot", label: "Spot" },
  ];

  // If Reiko is active, show expanded container with popup
  if (showReikoPopup || activeTab === "reico") {
    return (
      <View style={styles.expandedContainer}>
        {/* ReikoAI Popup Content */}
        <ReikoPopup onClose={handleCloseReiko} />

        {/* Divider */}
        <View style={styles.reikoDivider} />

        {/* Tab Bar */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {tabs.map((tab) => {
            const isActive = tab.name === "reico";
            return (
              <TouchableOpacity
                key={tab.name}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => handleTabPress(tab.name)}
              >
                <Image
                  source={NAV_ICONS[tab.name]}
                  style={[
                    styles.tabIcon,
                    isActive ? styles.tabIconActive : styles.tabIconInactive,
                  ]}
                />
                {tab.label && isActive && (
                  <Text style={styles.tabLabel}>{tab.label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => handleTabPress(tab.name)}
          >
            <Image
              source={NAV_ICONS[tab.name]}
              style={[
                styles.tabIcon,
                isActive ? styles.tabIconActive : styles.tabIconInactive,
              ]}
            />
            {tab.label && isActive && (
              <Text style={styles.tabLabel}>{tab.label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
