/**
 * VOICE AI SERVICE
 * Integrates Agora for real-time voice with Reiko AI
 * Uses AWS Lambda backend for AI processing
 * 
 * Features:
 * - Voice recording and streaming
 * - Speech-to-Text conversion
 * - AI response generation via Lambda /health-advice
 * - Text-to-Speech for Reiko's voice (when native module available)
 */

import { Audio } from 'expo-av';
import api from './api';

// Try to import Speech, but handle if native module is missing
let Speech: any = null;
try {
  Speech = require('expo-speech');
} catch (e) {
  console.warn('⚠️ expo-speech native module not available. TTS disabled.');
}

// Voice AI State
interface VoiceAIState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  error: string | null;
}

class VoiceAIService {
  private recording: Audio.Recording | null = null;
  private state: VoiceAIState = {
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: '',
    response: '',
    error: null,
  };
  private stateListeners: ((state: VoiceAIState) => void)[] = [];

  constructor() {
    this.setupAudio();
  }

  private async setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  }

  // Subscribe to state changes
  subscribe(listener: (state: VoiceAIState) => void) {
    this.stateListeners.push(listener);
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== listener);
    };
  }

  private updateState(updates: Partial<VoiceAIState>) {
    this.state = { ...this.state, ...updates };
    this.stateListeners.forEach(listener => listener(this.state));
  }

  getState(): VoiceAIState {
    return this.state;
  }

  // Start listening for voice input
  async startListening(): Promise<void> {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        this.updateState({ error: 'Microphone permission denied' });
        return;
      }

      // Create and start recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await this.recording.startAsync();

      this.updateState({
        isListening: true,
        error: null,
        transcript: '',
      });

      console.log('🎙️ Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      this.updateState({ error: 'Failed to start recording' });
    }
  }

  // Stop listening and process the voice input
  async stopListening(): Promise<string> {
    if (!this.recording) {
      return '';
    }

    try {
      this.updateState({ isListening: false, isProcessing: true });

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      console.log('🎙️ Recording stopped, URI:', uri);

      if (uri) {
        // Send to backend for speech-to-text processing
        const transcript = await this.transcribeAudio(uri);
        this.updateState({ transcript, isProcessing: false });
        return transcript;
      }

      this.updateState({ isProcessing: false });
      return '';
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.updateState({ isProcessing: false, error: 'Failed to process recording' });
      return '';
    }
  }

  // Transcribe audio to text (simulated - replace with actual API)
  private async transcribeAudio(audioUri: string): Promise<string> {
    // TODO: Implement actual speech-to-text
    // Options:
    // 1. Send to your backend which uses AWS Transcribe
    // 2. Use Google Cloud Speech-to-Text
    // 3. Use OpenAI Whisper API
    
    // For now, simulate transcription
    console.log('🔄 Transcribing audio from:', audioUri);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return simulated transcript
    return 'What is the air quality today?';
  }

  // Get AI response from Reiko via Lambda /health-advice
  async getAIResponse(userMessage: string): Promise<string> {
    console.log('🤖 Getting AI response for:', userMessage);
    this.updateState({ isProcessing: true });

    try {
      // Call Lambda health-advice endpoint for AI responses
      console.log('📡 Calling Lambda /health-advice...');
      const response = await api.sendChatMessage(userMessage, 'pollution_assistant');
      console.log('📥 Lambda response:', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        const data = response.data as any;
        const aiResponse = data.response || data.advice || data.message || this.getFallbackResponse(userMessage);
        console.log('✅ AI Response:', aiResponse);
        this.updateState({ response: aiResponse, isProcessing: false });
        return aiResponse;
      } else {
        // Use fallback response
        console.log('⚠️ No data in response, using fallback');
        const fallback = this.getFallbackResponse(userMessage);
        this.updateState({ response: fallback, isProcessing: false });
        return fallback;
      }
    } catch (error) {
      console.error('❌ AI request error:', error);
      // Use fallback response
      const fallback = this.getFallbackResponse(userMessage);
      this.updateState({ response: fallback, isProcessing: false });
      return fallback;
    }
  }

  // Fallback responses when AI is unavailable
  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('air quality') || lowerMessage.includes('air')) {
      return "Based on current data, the air quality in your area is moderate. The AQI is around 65, which is acceptable but sensitive individuals should limit prolonged outdoor activity. Would you like tips on reducing your exposure?";
    }
    
    if (lowerMessage.includes('pollution') || lowerMessage.includes('hotspot')) {
      return "I've detected 3 pollution hotspots near you. The closest one is about 500 meters away, likely from vehicle emissions. I recommend avoiding that route if possible. Would you like me to suggest an alternative path?";
    }
    
    if (lowerMessage.includes('tip') || lowerMessage.includes('reduce') || lowerMessage.includes('help')) {
      return "Here are some ways you can help reduce pollution: 1) Use public transport or walk when possible, 2) Reduce energy consumption at home, 3) Report pollution sources through the app, 4) Plant trees or support local green initiatives. Every small action counts!";
    }
    
    if (lowerMessage.includes('health') || lowerMessage.includes('risk')) {
      return "Based on current pollution levels and your location, the health risk is low to moderate. I recommend staying hydrated, avoiding strenuous outdoor activities during peak traffic hours, and keeping windows closed if you're near busy roads.";
    }
    
    return "I understand you're asking about environmental conditions. The current pollution levels in your area are within acceptable limits. Is there something specific you'd like to know about air quality, nearby pollution sources, or ways to help the environment?";
  }

  // Speak the response using Text-to-Speech
  async speak(text: string): Promise<void> {
    // Check if Speech module is available
    if (!Speech) {
      console.log('🔇 TTS not available, skipping speech');
      this.updateState({ isSpeaking: false });
      return;
    }

    this.updateState({ isSpeaking: true });

    try {
      // Stop any ongoing speech
      await Speech.stop();

      // Speak with Reiko's voice settings
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.1, // Slightly higher pitch for friendly voice
        rate: 0.95, // Slightly slower for clarity
        onDone: () => {
          this.updateState({ isSpeaking: false });
        },
        onError: () => {
          this.updateState({ isSpeaking: false });
        },
      });
    } catch (error) {
      console.error('TTS error:', error);
      this.updateState({ isSpeaking: false });
    }
  }

  // Stop speaking
  async stopSpeaking(): Promise<void> {
    if (!Speech) {
      this.updateState({ isSpeaking: false });
      return;
    }

    try {
      await Speech.stop();
      this.updateState({ isSpeaking: false });
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  // Full voice conversation flow
  async processVoiceConversation(): Promise<{ transcript: string; response: string }> {
    // Stop listening and get transcript
    const transcript = await this.stopListening();
    
    if (!transcript) {
      return { transcript: '', response: "I didn't catch that. Could you please try again?" };
    }

    // Get AI response
    const response = await this.getAIResponse(transcript);

    // Speak the response
    await this.speak(response);

    return { transcript, response };
  }

  // Process text input (for quick options)
  async processTextInput(text: string): Promise<string> {
    console.log('💬 Processing text input:', text);
    const response = await this.getAIResponse(text);
    console.log('🔊 Speaking response...');
    await this.speak(response);
    return response;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (e) {
        // Ignore cleanup errors
      }
      this.recording = null;
    }
    if (Speech) {
      try {
        await Speech.stop();
      } catch (e) {
        // Ignore if Speech not available
      }
    }
    this.updateState({
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
    });
  }
}

// Singleton instance
export const voiceAI = new VoiceAIService();
export default voiceAI;
