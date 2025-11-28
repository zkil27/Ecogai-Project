/**
 * HOME SCREEN
 * Main map view with search bar
 * Uses FREE OpenStreetMap via WebView - NO API KEY REQUIRED!
 * 
 * REQUIRES DEV BUILD: Run `npx expo prebuild` then `npx expo run:android`
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
} from "react-native";
import * as Location from "expo-location";
import OpenStreetMap from "../components/OpenStreetMap";
import { homeStyles as styles } from "../styles/homeStyles";
import { colors } from "../styles/theme";
import { 
  MapRegion, 
  Location as LocationType, 
  PollutionSpot,
  PlaceResult,
} from "../types";
import api from "../services/api";
import {
  DEFAULT_REGION,
  ZOOM_LEVELS,
  POLLUTION_MARKER_COLORS,
  POLLUTION_TYPE_ICONS,
  SEARCH_CONFIG,
  MAP_ANIMATION,
} from "../constants/mapConfig";

export default function HomeScreen() {
  // Map state
  const [region, setRegion] = useState<MapRegion>(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState<LocationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Pollution spots state
  const [pollutionSpots, setPollutionSpots] = useState<PollutionSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<PollutionSpot | null>(null);
  const [loadingSpots, setLoadingSpots] = useState(false);

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
          ...ZOOM_LEVELS.NEIGHBORHOOD,
        });
        setLoading(false);

        // Load pollution spots for current location
        loadPollutionSpots(latitude, longitude);
      } catch (error) {
        console.error("Error getting location:", error);
        setLocationError("Could not get your location");
        setLoading(false);
      }
    })();
  }, []);

  // Load pollution spots from backend
  const loadPollutionSpots = async (latitude: number, longitude: number) => {
    setLoadingSpots(true);
    try {
      const response = await api.getPollutionSpots(latitude, longitude, 10);
      if (response.success && response.data && Array.isArray(response.data)) {
        // Map Lambda response to PollutionSpot format
        const spots: PollutionSpot[] = response.data.map((report: any) => ({
          id: report.reportId,
          latitude: report.location?.latitude || 0,
          longitude: report.location?.longitude || 0,
          pollutionType: report.pollutionType || 'air',
          severity: report.severity || 'medium',
          description: report.description || '',
          imageUrl: report.imageUrl,
          createdAt: report.createdAt,
        }));
        setPollutionSpots(spots);
      }
    } catch (error) {
      console.error("Error loading pollution spots:", error);
      // Silently fail - spots will be empty
    } finally {
      setLoadingSpots(false);
    }
  };

  // Handle search input with debounce
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, SEARCH_CONFIG.DEBOUNCE_MS);
  };

  // Perform search using Nominatim (OpenStreetMap geocoding - FREE!)
  const performSearch = async (query: string) => {
    setIsSearching(true);
    setShowSearchResults(true);

    try {
      // Use Nominatim for geocoding (OpenStreetMap's free geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${SEARCH_CONFIG.MAX_SUGGESTIONS}&countrycodes=ph`
      );
      const data = await response.json();
      
      const results: PlaceResult[] = data.map((item: any) => ({
        placeId: item.place_id.toString(),
        label: item.display_name,
        location: {
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
        },
        municipality: item.address?.city || item.address?.town || item.address?.village,
        region: item.address?.state,
        country: item.address?.country,
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const handleSelectSearchResult = (place: PlaceResult) => {
    Keyboard.dismiss();
    setSearchQuery(place.label);
    setShowSearchResults(false);
    setSearchResults([]);

    // Update region to selected location
    const newRegion: MapRegion = {
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      ...ZOOM_LEVELS.STREET,
    };

    setRegion(newRegion);

    // Load pollution spots for new location
    loadPollutionSpots(place.location.latitude, place.location.longitude);
  };

  // Handle search submit (when user presses enter)
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;

    Keyboard.dismiss();
    setIsSearching(true);

    try {
      // Use Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=${SEARCH_CONFIG.MAX_SEARCH_RESULTS}&countrycodes=ph`
      );
      const data = await response.json();

      if (data.length > 0) {
        const result: PlaceResult = {
          placeId: data[0].place_id.toString(),
          label: data[0].display_name,
          location: {
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          },
        };
        handleSelectSearchResult(result);
      } else {
        Alert.alert("No Results", "No places found for your search.");
      }
    } catch (error) {
      console.error("Search submit error:", error);
      Alert.alert("Search Error", "Could not search for this location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Go to current location
  const goToCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      setUserLocation({ latitude, longitude });
      
      const newRegion: MapRegion = {
        latitude,
        longitude,
        ...ZOOM_LEVELS.NEIGHBORHOOD,
      };

      setRegion(newRegion);

      // Reload pollution spots
      loadPollutionSpots(latitude, longitude);
    } catch (error) {
      Alert.alert("Error", "Could not get current location");
    }
  };

  // Handle map region change (when user pans/zooms)
  const handleRegionChangeComplete = (newRegion: MapRegion) => {
    setRegion(newRegion);
  };

  // Handle marker press
  const handleMarkerPress = (spot: PollutionSpot) => {
    setSelectedSpot(spot);
    // Could show a bottom sheet or modal with spot details
  };

  // Get marker color based on severity
  const getMarkerColor = (severity: PollutionSpot["severity"]) => {
    return POLLUTION_MARKER_COLORS[severity] || POLLUTION_MARKER_COLORS.medium;
  };

  // Render search result item
  const renderSearchResult = ({ item }: { item: PlaceResult }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => handleSelectSearchResult(item)}
    >
      <Text style={styles.searchResultText} numberOfLines={1}>
        {item.label}
      </Text>
      {item.municipality && (
        <Text style={styles.searchResultSubtext} numberOfLines={1}>
          {[item.municipality, item.region, item.country].filter(Boolean).join(", ")}
        </Text>
      )}
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.green} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  // Error state
  if (locationError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{locationError}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            setLocationError(null);
            setLoading(true);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map - FREE OpenStreetMap! */}
      <View style={styles.mapContainer}>
        <OpenStreetMap
          latitude={region.latitude}
          longitude={region.longitude}
          zoom={15}
          showUserLocation={true}
          markers={pollutionSpots.map((spot) => ({
            id: spot.id,
            latitude: spot.latitude,
            longitude: spot.longitude,
            title: `${spot.pollutionType} - ${spot.severity}`,
            color: getMarkerColor(spot.severity),
          }))}
          onMarkerPress={(id) => {
            const spot = pollutionSpots.find((s) => s.id === id);
            if (spot) handleMarkerPress(spot);
          }}
          style={styles.map}
        />
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
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            onFocus={() => searchQuery.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH && setShowSearchResults(true)}
          />
          {isSearching && (
            <ActivityIndicator size="small" color={colors.primary.green} />
          )}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowSearchResults(false);
              }}
            >
              <Text style={{ fontSize: 16, color: colors.neutral.gray }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.placeId}
              renderItem={renderSearchResult}
              keyboardShouldPersistTaps="handled"
              style={styles.searchResultsList}
            />
          </View>
        )}
      </View>

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={goToCurrentLocation}
      >
        <Text style={{ fontSize: 20 }}>📍</Text>
      </TouchableOpacity>

      {/* Loading indicator for spots */}
      {loadingSpots && (
        <View style={styles.spotsLoadingContainer}>
          <ActivityIndicator size="small" color={colors.primary.green} />
        </View>
      )}
    </View>
  );
}
