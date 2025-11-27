/**
 * HOME SCREEN
 * Main map view with search bar and pollution spots
 * NOTE: Using placeholder until AWS Maps is integrated
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import * as Location from "expo-location";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { PollutionSpot, MapRegion, Location as LocationType } from "../types";
import api from "../services/api";

// Default region (can be changed to any location)
const DEFAULT_REGION: MapRegion = {
  latitude: 40.6892,
  longitude: -73.9442,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function HomeScreen() {
  const [region, setRegion] = useState<MapRegion>(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [pollutionSpots, setPollutionSpots] = useState<PollutionSpot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Location permission denied");
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        
        setUserLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error getting location:", error);
        setLocationError("Could not get your location");
        setLoading(false);
      }
    })();
  }, []);

  // Fetch pollution spots when region changes
  useEffect(() => {
    fetchPollutionSpots();
  }, [region]);

  const fetchPollutionSpots = async () => {
    try {
      const spots = await api.getPollutionSpots(
        region.latitude,
        region.longitude,
        5 // radius in km
      );
      setPollutionSpots(spots);
    } catch (error) {
      // Silently fail for now - spots will be empty
      console.log("Spots not available yet");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    // TODO: Implement search with AWS Location Service
    Alert.alert("Search", `Searching for: ${searchQuery}`);
  };

  const goToCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch (error) {
      Alert.alert("Error", "Could not get current location");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.green} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{locationError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setLoading(true)}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Placeholder - Replace with AWS Maps */}
      <View style={styles.mapContainer}>
        <View style={placeholderStyles.mapPlaceholder}>
          <Text style={placeholderStyles.mapPlaceholderTitle}>
            🗺️ Map View
          </Text>
          <Text style={placeholderStyles.mapPlaceholderText}>
            AWS Maps will be integrated here
          </Text>
          <Text style={placeholderStyles.mapCoords}>
            📍 {userLocation?.latitude.toFixed(4)}, {userLocation?.longitude.toFixed(4)}
          </Text>
          {pollutionSpots.length > 0 && (
            <Text style={placeholderStyles.spotCount}>
              {pollutionSpots.length} pollution spots nearby
            </Text>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={{ marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search location..."
            placeholderTextColor={colors.neutral.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={goToCurrentLocation}
      >
        <Text style={{ fontSize: 20 }}>📍</Text>
      </TouchableOpacity>
    </View>
  );
}

// Placeholder styles for map
const placeholderStyles = StyleSheet.create({
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  mapPlaceholderTitle: {
    fontSize: 32,
    marginBottom: 12,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  mapCoords: {
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  spotCount: {
    fontSize: 14,
    color: colors.primary.green,
    fontWeight: "600",
  },
});
