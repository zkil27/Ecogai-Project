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
  Animated,
} from "react-native";
import { bottomNavStyles as styles } from "../styles/bottomNavStyles";
import { TabName } from "../types";
import ReikoPopup from "./ReikoPopup";

interface BottomNavBarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export default function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const [showReikoPopup, setShowReikoPopup] = useState(false);

  const handleTabPress = (tab: TabName) => {
    if (tab === "reico") {
      setShowReikoPopup(!showReikoPopup);
    } else {
      setShowReikoPopup(false);
      onTabChange(tab);
    }
  };

  const tabs: { name: TabName; label: string; icon: any }[] = [
    {
      name: "info",
      label: "Info",
      icon: require("../../assets/images/icon.png"), // Replace with actual icon
    },
    {
      name: "profile",
      label: "",
      icon: require("../../assets/images/icon.png"), // Replace with actual icon
    },
    {
      name: "reico",
      label: "Reico",
      icon: require("../../assets/images/icon.png"), // Replace with actual icon
    },
    {
      name: "spot",
      label: "Spot",
      icon: require("../../assets/images/icon.png"), // Replace with actual icon
    },
  ];

  // If Reiko is active, show expanded container with popup
  if (showReikoPopup || activeTab === "reico") {
    return (
      <View style={styles.expandedContainer}>
        {/* ReikoAI Popup Content */}
        <ReikoPopup onClose={() => setShowReikoPopup(false)} />

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
                  source={tab.icon}
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
              source={tab.icon}
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
