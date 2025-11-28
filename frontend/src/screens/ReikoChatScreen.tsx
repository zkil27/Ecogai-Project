/**
 * REIKO CHAT SCREEN
 * Voice-based conversational AI assistant with TTS integration
 * 
 * Features:
 * - Real-time voice input
 * - AI-powered responses
 * - Text-to-Speech for Reiko's voice
 * - Quick question options
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { reikoStyles as styles } from "../styles/reikoStyles";
import { colors } from "../styles/theme";
import voiceAI from "../services/voiceAI";

// Preset conversation options
const CONVERSATION_OPTIONS = [
  { id: "1", text: "What's the air quality today?", icon: "🌬️" },
  { id: "2", text: "Tips to reduce pollution", icon: "💡" },
  { id: "3", text: "Nearby pollution hotspots", icon: "📍" },
  { id: "4", text: "How can I help the environment?", icon: "🌱" },
  { id: "5", text: "Explain my health risks", icon: "❤️" },
];

interface Message {
  id: string;
  type: 'user' | 'reiko';
  text: string;
  timestamp: Date;
}

export default function ReikoChatScreen() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Animation for mic button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Subscribe to voice AI state changes
  useEffect(() => {
    const unsubscribe = voiceAI.subscribe((state) => {
      setIsListening(state.isListening);
      setIsProcessing(state.isProcessing);
      setIsSpeaking(state.isSpeaking);
    });

    return () => {
      unsubscribe();
      voiceAI.cleanup();
    };
  }, []);

  // Pulse animation when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handleBack = () => {
    voiceAI.cleanup();
    router.back();
  };

  const addMessage = (type: 'user' | 'reiko', text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleMicPress = async () => {
    if (isListening) {
      // Stop listening and process
      const { transcript, response } = await voiceAI.processVoiceConversation();
      
      if (transcript) {
        addMessage('user', transcript);
      }
      if (response) {
        addMessage('reiko', response);
      }
    } else {
      // Start listening
      await voiceAI.startListening();
    }
  };

  const handleOptionPress = async (option: { id: string; text: string }) => {
    console.log('🎯 Quick option pressed:', option.text);
    setSelectedOption(option.id);
    
    // Add user message
    addMessage('user', option.text);
    
    try {
      // Get AI response and speak it
      console.log('🤖 Getting AI response...');
      const response = await voiceAI.processTextInput(option.text);
      console.log('📝 Got response:', response);
      addMessage('reiko', response);
    } catch (error) {
      console.error('❌ Error getting response:', error);
      addMessage('reiko', "Sorry, I couldn't process that. Please try again.");
    }
    
    setSelectedOption(null);
  };

  const handleStopSpeaking = async () => {
    await voiceAI.stopSpeaking();
  };

  const getStatusText = () => {
    if (isListening) return "Listening... Tap to stop";
    if (isProcessing) return "Processing...";
    if (isSpeaking) return "Speaking... Tap to stop";
    return "Tap to speak";
  };

  const getMicIcon = () => {
    if (isListening) return "🔴";
    if (isProcessing) return "⏳";
    if (isSpeaking) return "🔊";
    return "🎤";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>ReikoAI</Text>
          <Text style={styles.headerSubtitle}>Your environmental assistant</Text>
        </View>
        <View style={voiceStyles.statusIndicator}>
          <View style={[
            voiceStyles.statusDot,
            isSpeaking && voiceStyles.statusDotActive,
          ]} />
          <Text style={voiceStyles.statusText}>
            {isSpeaking ? 'Speaking' : 'Ready'}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={voiceStyles.content} 
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Reiko Avatar */}
        <View style={voiceStyles.avatarContainer}>
          <Animated.View 
            style={[
              voiceStyles.avatar, 
              isListening && voiceStyles.avatarListening,
              isSpeaking && voiceStyles.avatarSpeaking,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <Text style={{ fontSize: 60 }}>🤖</Text>
          </Animated.View>
          <Text style={voiceStyles.avatarName}>Reiko</Text>
        </View>

        {/* Messages or Greeting */}
        {messages.length === 0 ? (
          <View style={voiceStyles.greetingContainer}>
            <Text style={voiceStyles.greetingTitle}>Hi there! 👋</Text>
            <Text style={voiceStyles.greetingText}>
              I'm Reiko, your AI environmental assistant. I can help you understand air quality, find pollution hotspots, and give you tips to protect the environment.
            </Text>
            <Text style={voiceStyles.greetingHint}>
              🎤 Tap the mic button to talk, or choose a quick question below
            </Text>
          </View>
        ) : (
          <View style={voiceStyles.messagesContainer}>
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  voiceStyles.messageBubble,
                  msg.type === 'user' ? voiceStyles.userBubble : voiceStyles.reikoBubble,
                ]}
              >
                {msg.type === 'reiko' && (
                  <Text style={voiceStyles.messageAvatar}>🤖</Text>
                )}
                <View style={[
                  voiceStyles.messageContent,
                  msg.type === 'user' ? voiceStyles.userContent : voiceStyles.reikoContent,
                ]}>
                  <Text style={[
                    voiceStyles.messageText,
                    msg.type === 'user' && voiceStyles.userText,
                  ]}>
                    {msg.text}
                  </Text>
                </View>
                {msg.type === 'user' && (
                  <Text style={voiceStyles.messageAvatar}>👤</Text>
                )}
              </View>
            ))}
            
            {/* Processing indicator */}
            {isProcessing && (
              <View style={[voiceStyles.messageBubble, voiceStyles.reikoBubble]}>
                <Text style={voiceStyles.messageAvatar}>🤖</Text>
                <View style={voiceStyles.reikoContent}>
                  <Text style={voiceStyles.processingText}>Thinking...</Text>
                </View>
              </View>
            )}
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
              disabled={isProcessing || isSpeaking}
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
          style={[
            voiceStyles.micButton, 
            isListening && voiceStyles.micButtonListening,
            isSpeaking && voiceStyles.micButtonSpeaking,
            isProcessing && voiceStyles.micButtonProcessing,
          ]}
          onPress={isSpeaking ? handleStopSpeaking : handleMicPress}
          disabled={isProcessing}
        >
          <Text style={{ fontSize: 32 }}>{getMicIcon()}</Text>
        </TouchableOpacity>
        <Text style={voiceStyles.micHint}>{getStatusText()}</Text>
      </View>
    </View>
  );
}

// Voice UI specific styles
const voiceStyles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingRight: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral.gray,
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: colors.primary.green,
  },
  statusText: {
    fontSize: 12,
    color: colors.text.secondary,
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
    backgroundColor: '#FFE0E0',
    borderWidth: 3,
    borderColor: '#FF4444',
  },
  avatarSpeaking: {
    backgroundColor: colors.primary.green,
    shadowColor: colors.primary.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
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
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  greetingHint: {
    fontSize: 14,
    color: colors.primary.green,
    textAlign: "center",
    fontStyle: 'italic',
  },
  messagesContainer: {
    marginBottom: 20,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  reikoBubble: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  messageContent: {
    maxWidth: '75%',
    padding: 14,
    borderRadius: 18,
  },
  userContent: {
    backgroundColor: colors.primary.green,
    borderBottomRightRadius: 4,
  },
  reikoContent: {
    backgroundColor: colors.neutral.white,
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 22,
  },
  userText: {
    color: colors.neutral.white,
  },
  processingText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontStyle: 'italic',
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
    paddingBottom: 40,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: colors.primary.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  micButtonListening: {
    backgroundColor: '#FF4444',
    shadowColor: '#FF4444',
  },
  micButtonSpeaking: {
    backgroundColor: '#4CAF50',
  },
  micButtonProcessing: {
    backgroundColor: colors.neutral.gray,
    opacity: 0.7,
  },
  micHint: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
});
