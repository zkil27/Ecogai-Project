/**
 * SPOT SCREEN
 * Camera screen for capturing pollution spots
 * Uses expo-image-picker for camera/gallery access
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { spotStyles as styles } from "../styles/spotStyles";
import { colors } from "../styles/theme";
import { PollutionType, CreateSpotRequest } from "../types";
import api from "../services/api";

type SpotStep = "capture" | "form";
type Severity = "low" | "medium" | "high";

const POLLUTION_TYPES: { value: PollutionType; label: string }[] = [
  { value: "air", label: "Air Pollution" },
  { value: "land", label: "Land Pollution" },
];

const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function SpotScreen() {
  const router = useRouter();
  
  const [step, setStep] = useState<SpotStep>("capture");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [pollutionType, setPollutionType] = useState<PollutionType>("air");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [description, setDescription] = useState("");

  // Get location when component mounts
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    })();
  }, []);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      setStep("form");
    }
  };

  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Gallery access is needed to select photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      setStep("form");
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setStep("capture");
  };

  const handleSubmit = async () => {
    if (!capturedImage || !location) {
      Alert.alert("Error", "Missing photo or location data");
      return;
    }

    setLoading(true);

    try {
      // Upload image first
      const uploadResult = await api.uploadSpotImage(capturedImage);
      
      // Create spot
      const spotData: CreateSpotRequest = {
        latitude: location.latitude,
        longitude: location.longitude,
        imageUrl: uploadResult.url,
        pollutionType,
        severity,
        description: description.trim() || undefined,
      };

      await api.createSpot(spotData);
      
      setLoading(false);
      Alert.alert("Success", "Pollution spot reported successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      setLoading(false);
      console.error("Error submitting spot:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    }
  };

  const handleClose = () => {
    router.back();
  };

  // Form step
  if (step === "form" && capturedImage) {
    return (
      <ScrollView style={styles.formContainer}>
        {/* Close button */}
        <TouchableOpacity 
          style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}
          onPress={handleClose}
        >
          <Text style={{ fontSize: 24 }}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.formTitle}>Report Pollution</Text>

        {/* Image Preview */}
        <TouchableOpacity onPress={handleRetake}>
          <Image source={{ uri: capturedImage }} style={styles.formImagePreview} />
          <Text style={{ textAlign: "center", color: colors.text.secondary, marginTop: -12, marginBottom: 16 }}>
            Tap to retake
          </Text>
        </TouchableOpacity>

        {/* Pollution Type */}
        <Text style={styles.formLabel}>Pollution Type</Text>
        <View style={styles.typeSelector}>
          {POLLUTION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeOption,
                pollutionType === type.value && styles.typeOptionActive,
              ]}
              onPress={() => setPollutionType(type.value)}
            >
              <Text
                style={[
                  styles.typeOptionText,
                  pollutionType === type.value && styles.typeOptionTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Severity */}
        <Text style={styles.formLabel}>Severity</Text>
        <View style={styles.severitySelector}>
          {SEVERITY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.severityOption,
                severity === option.value && styles.severityOptionActive,
              ]}
              onPress={() => setSeverity(option.value)}
            >
              <Text
                style={[
                  styles.severityOptionText,
                  severity === option.value && styles.severityOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.formLabel}>Description (Optional)</Text>
        <TextInput
          style={[styles.formInput, styles.formTextArea]}
          placeholder="Describe the pollution..."
          placeholderTextColor={colors.neutral.gray}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Location Info */}
        {location && (
          <Text style={{ color: colors.text.secondary, marginBottom: 16, textAlign: "center" }}>
            📍 Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Capture step
  return (
    <View style={styles.cameraPlaceholder}>
      {/* Close button */}
      <TouchableOpacity 
        style={{ position: "absolute", top: 50, left: 20 }}
        onPress={handleClose}
      >
        <Text style={{ fontSize: 28, color: colors.neutral.white }}>✕</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 48, marginBottom: 20 }}>📷</Text>
      <Text style={[styles.cameraPlaceholderText, { marginBottom: 40 }]}>
        Capture Pollution Spot
      </Text>

      {/* Camera Button */}
      <TouchableOpacity
        style={[styles.submitButton, { marginBottom: 16, paddingHorizontal: 40 }]}
        onPress={handleTakePhoto}
      >
        <Text style={styles.submitButtonText}>📸 Take Photo</Text>
      </TouchableOpacity>

      {/* Gallery Button */}
      <TouchableOpacity
        style={[styles.retakeButton, { paddingHorizontal: 40, paddingVertical: 16 }]}
        onPress={handlePickFromGallery}
      >
        <Text style={styles.retakeButtonText}>🖼️ Choose from Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}
