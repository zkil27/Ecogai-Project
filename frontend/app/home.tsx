/**
 * MAIN APP SCREEN
 * Home screen with map, bottom navigation, and tab content
 */

import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import HomeScreen from "../src/screens/HomeScreen";
import ProfileScreen from "../src/screens/ProfileScreen";
import SpotScreen from "../src/screens/SpotScreen";
import BottomNavBar from "../src/components/BottomNavBar";
import { TabName } from "../src/types";

export default function MainApp() {
  const [activeTab, setActiveTab] = useState<TabName>("info");

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return <HomeScreen />;
      case "profile":
        return <ProfileScreen />;
      case "spot":
        return <SpotScreen />;
      case "reico":
        // Reico is handled by the BottomNavBar popup
        return <HomeScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
