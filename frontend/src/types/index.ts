// Add your TypeScript types and interfaces here

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  medicalCondition?: string;
  profileImage?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  phoneNumber: string;
  medicalCondition?: string;
  medicalProofUrl?: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  userId?: string;
  token?: string;
}

export interface OTPRequest {
  phoneNumber: string;
}

export interface OTPVerifyRequest {
  phoneNumber: string;
  otp: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
}

// ============================================
// POLLUTION SPOT TYPES
// ============================================
export interface PollutionSpot {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  description?: string;
  pollutionType: PollutionType;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'verified' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export type PollutionType = 'air' | 'land';

export interface CreateSpotRequest {
  latitude: number;
  longitude: number;
  imageUrl: string;
  description?: string;
  pollutionType: PollutionType;
  severity: 'low' | 'medium' | 'high';
}

export interface SpotResponse {
  success: boolean;
  message: string;
  spot?: PollutionSpot;
}

// ============================================
// MAP / LOCATION TYPES
// ============================================
export interface Location {
  latitude: number;
  longitude: number;
}

export interface MapRegion extends Location {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface SearchResult {
  id: string;
  name: string;
  address: string;
  location: Location;
}

// ============================================
// AI CHAT TYPES (ReikoAI)
// ============================================
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  reply?: string;
}

// ============================================
// NAVIGATION TYPES
// ============================================
export type TabName = 'info' | 'profile' | 'reico' | 'spot';

export interface TabItem {
  name: TabName;
  label: string;
  icon: string;
}
