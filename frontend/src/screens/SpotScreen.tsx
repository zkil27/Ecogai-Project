/**
 * SPOT SCREEN
 * Camera screen for capturing pollution spots
 * Uses expo-camera for live camera preview
 * Submits to Lambda POST /reports endpoint
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { colors, fontFamily, fontSize, spacing, borderRadius, shadows } from "../styles/theme";
import { PollutionType } from "../types";
import api from "../services/api";

type SpotStep = "capture" | "form";
type Severity = "low" | "medium" | "high" | "critical";

const POLLUTION_TYPES: { value: PollutionType; label: string }[] = [
  { value: "air", label: "Air Pollution" },
  { value: "water", label: "Water Pollution" },
  { value: "noise", label: "Noise Pollution" },
  { value: "waste", label: "Waste/Garbage" },
  { value: "soil", label: "Soil Pollution" },
];

const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export default function SpotScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  
  const [step, setStep] = useState<SpotStep>("capture");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lastThumbnail, setLastThumbnail] = useState<string | null>(null);
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
        try {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } catch (error) {
          console.log("Location error:", error);
        }
      }
    })();
  }, []);

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      
      if (photo?.uri) {
        setCapturedImage(photo.uri);
        setLastThumbnail(photo.uri);
        setStep("form");
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Gallery access is needed to select photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      setLastThumbnail(result.assets[0].uri);
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
      // Convert image to base64 for Lambda upload
      let imageBase64: string | undefined;
      try {
        imageBase64 = await api.imageToBase64(capturedImage);
      } catch (imgError) {
        console.log("Image conversion failed, submitting without image");
      }

      // Submit to Lambda POST /reports
      const response = await api.createReport({
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        pollutionType: pollutionType as 'air' | 'water' | 'noise' | 'waste' | 'soil',
        severity: severity,
        description: description || undefined,
        imageBase64: imageBase64,
      });

      setLoading(false);

      if (response.success) {
        Alert.alert("Success", "Pollution spot reported successfully!", [
          {
            text: "OK",
            onPress: () => {
              setCapturedImage(null);
              setStep("capture");
              setDescription("");
            },
          },
        ]);
      } else {
        Alert.alert("Error", response.error || "Failed to submit report. Please try again.");
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error?.message || "Failed to submit report. Please try again.");
    }
  };

  // Permission handling
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={colors.primary.green} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is needed to capture pollution spots</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Form step - after photo is captured
  if (step === "form" && capturedImage) {
    return (
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.formTitle}>Report Pollution</Text>

        {/* Image Preview */}
        <TouchableOpacity onPress={handleRetake}>
          <Image source={{ uri: capturedImage }} style={styles.formImagePreview} />
          <Text style={styles.retakeHint}>Tap to retake</Text>
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
          style={styles.formTextArea}
          placeholder="Describe the pollution..."
          placeholderTextColor={colors.neutral.gray}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Location Info */}
        {location && (
          <Text style={styles.locationInfo}>
            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
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

        <View style={{ height: 20 }} />
      </ScrollView>
    );
  }

  // Capture step - live camera view
  return (
    <View style={styles.container}>
      {/* Full screen camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      />

      {/* Bottom capture panel */}
      <View style={styles.capturePanel}>
        {/* Thumbnail & Capture Button Row */}
        <View style={styles.captureRow}>
          {/* Last captured thumbnail or gallery picker */}
          <TouchableOpacity style={styles.thumbnailContainer} onPress={handlePickFromGallery}>
            {lastThumbnail ? (
              <Image source={{ uri: lastThumbnail }} style={styles.thumbnail} />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Text style={styles.thumbnailIcon}>🖼️</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          {/* Flip camera button */}
          <TouchableOpacity 
            style={styles.flipButton}
            onPress={() => setFacing(facing === "back" ? "front" : "back")}
          >
            <Text style={styles.flipIcon}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.black,
  },
  camera: {
    flex: 1,
  },

  // Permission styles
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  permissionText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  permissionButton: {
    backgroundColor: colors.primary.green,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  permissionButtonText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },

  // Capture panel (bottom section)
  capturePanel: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  captureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },

  // Thumbnail
  thumbnailContainer: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.neutral.darkGray,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailIcon: {
    fontSize: 24,
  },

  // Capture button
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.green,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.neutral.white,
    ...shadows.lg,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary.green,
  },

  // Flip button
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  flipIcon: {
    fontSize: 24,
  },

  // Form styles
  formContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: 100,
  },
  formTitle: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: fontSize["2xl"],
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  formImagePreview: {
    width: "100%",
    height: 200,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  retakeHint: {
    textAlign: "center",
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  formLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  typeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.darkGray,
    backgroundColor: colors.neutral.offWhite,
  },
  typeOptionActive: {
    backgroundColor: colors.primary.green,
    borderColor: colors.primary.green,
  },
  typeOptionText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  typeOptionTextActive: {
    color: colors.text.primary,
    fontFamily: fontFamily.bodySemiBold,
  },
  severitySelector: {
    flexDirection: "row",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  severityOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.darkGray,
    backgroundColor: colors.neutral.offWhite,
    alignItems: "center",
  },
  severityOptionActive: {
    borderColor: colors.primary.green,
    backgroundColor: colors.primary.lightGreen,
  },
  severityOptionText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  severityOptionTextActive: {
    color: colors.text.primary,
  },
  formTextArea: {
    borderWidth: 1,
    borderColor: colors.neutral.darkGray,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.md,
    height: 100,
    textAlignVertical: "top",
    backgroundColor: colors.neutral.offWhite,
  },
  locationInfo: {
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: "center",
    fontSize: fontSize.sm,
  },
  submitButton: {
    backgroundColor: colors.primary.green,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    marginTop: spacing.md,
  },
  submitButtonText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.text.primary,
  },
});
