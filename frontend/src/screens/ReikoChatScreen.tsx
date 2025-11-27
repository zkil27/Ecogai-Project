/**
 * REIKO CHAT SCREEN
 * Voice-based conversational AI assistant (no text input)
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { reikoStyles as styles } from "../styles/reikoStyles";
import { colors } from "../styles/theme";

// Preset conversation options
const CONVERSATION_OPTIONS = [
  { id: "1", text: "What's the air quality today?", icon: "" },
  { id: "2", text: "Tips to reduce pollution", icon: "" },
  { id: "3", text: "Nearby pollution hotspots", icon: "" },
  { id: "4", text: "How can I help the environment?", icon: "" },
  { id: "5", text: "Explain my health risks", icon: "" },
];

export default function ReikoChatScreen() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleMicPress = () => {
    setIsListening(!isListening);
    // TODO: Integrate with AWS Transcribe for voice input
    if (!isListening) {
      // Simulate listening
      setTimeout(() => {
        setIsListening(false);
        setCurrentResponse("I heard you! Voice recognition will be integrated with AWS Transcribe.");
      }, 2000);
    }
  };

  const handleOptionPress = (option: { id: string; text: string }) => {
    setSelectedOption(option.id);
    // Simulate AI response (will be replaced with AWS Bedrock)
    setCurrentResponse("Processing: \"" + option.text + "\"\n\nThis feature will connect to AWS Bedrock for AI responses.");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={{ fontSize: 24 }}></Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>ReikoAI</Text>
          <Text style={styles.headerSubtitle}>Your environmental assistant</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={voiceStyles.content} contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}>
        {/* Reiko Avatar */}
        <View style={voiceStyles.avatarContainer}>
          <View style={[voiceStyles.avatar, isListening && voiceStyles.avatarListening]}>
            <Text style={{ fontSize: 60 }}></Text>
          </View>
          {isListening && (
            <Text style={voiceStyles.listeningText}>Listening...</Text>
          )}
        </View>

        {/* Response Area */}
        {currentResponse && (
          <View style={voiceStyles.responseContainer}>
            <Text style={voiceStyles.responseText}>{currentResponse}</Text>
          </View>
        )}

        {/* Greeting */}
        {!currentResponse && (
          <View style={voiceStyles.greetingContainer}>
            <Text style={voiceStyles.greetingTitle}>Hi there! </Text>
            <Text style={voiceStyles.greetingText}>
              I'm Reiko, your AI environmental assistant. Tap the mic to talk, or choose a topic below.
            </Text>
          </View>
        )}

        {/* Quick Options */}
        <View style={voiceStyles.optionsContainer}>
          <Text style={voiceStyles.optionsTitle}>Quick Questions</Text>
          {CONVERSATION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                voiceStyles.optionButton,
                selectedOption === option.id && voiceStyles.optionButtonActive,
              ]}
              onPress={() => handleOptionPress(option)}
            >
              <Text style={voiceStyles.optionIcon}>{option.icon}</Text>
              <Text style={[
                voiceStyles.optionText,
                selectedOption === option.id && voiceStyles.optionTextActive,
              ]}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Mic Button */}
      <View style={voiceStyles.micContainer}>
        <TouchableOpacity
          style={[voiceStyles.micButton, isListening && voiceStyles.micButtonActive]}
          onPress={handleMicPress}
        >
          <Text style={{ fontSize: 32 }}>{isListening ? "" : ""}</Text>
        </TouchableOpacity>
        <Text style={voiceStyles.micHint}>
          {isListening ? "Tap to stop" : "Tap to speak"}
        </Text>
      </View>
    </View>
  );
}

// Voice UI specific styles
import { StyleSheet } from "react-native";

const voiceStyles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary.lightGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarListening: {
    backgroundColor: colors.primary.green,
    shadowColor: colors.primary.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  listeningText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.primary.green,
    fontWeight: "600",
  },
  greetingContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  responseContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  responseText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  optionsContainer: {
    width: "100%",
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  optionButtonActive: {
    backgroundColor: colors.primary.lightGreen,
    borderColor: colors.primary.green,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  optionTextActive: {
    fontWeight: "600",
    color: colors.primary.green,
  },
  micContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  micButtonActive: {
    backgroundColor: colors.status.error,
  },
  micHint: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});
