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
// Matches Lambda report_handler.py
// ============================================
export interface PollutionSpot {
  id: string;
  userId?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  description?: string;
  pollutionType: PollutionType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'verified' | 'resolved';
  createdAt?: string;
  updatedAt?: string;
}

// Pollution types from Lambda report_handler.py
export type PollutionType = 'air' | 'water' | 'noise' | 'waste' | 'soil';

export interface CreateSpotRequest {
  latitude?: number;
  longitude?: number;
  location?: string;
  imageUrl?: string;
  description?: string;
  type?: PollutionType;
  pollutionType?: PollutionType;
  severity?: 'low' | 'medium' | 'high' | 'critical';
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
// AWS LOCATION SERVICE TYPES
// ============================================
export interface PlaceResult {
  placeId: string;
  label: string;
  addressNumber?: string;
  street?: string;
  municipality?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  location: Location;
  relevance?: number;
}

export interface SearchPlaceRequest {
  query: string;
  biasPosition?: Location;
  maxResults?: number;
}

export interface SearchPlaceResponse {
  success: boolean;
  results: PlaceResult[];
}

export interface ReverseGeocodeRequest {
  latitude: number;
  longitude: number;
}

export interface ReverseGeocodeResponse {
  success: boolean;
  results: PlaceResult[];
}

export interface RouteRequest {
  origin: Location;
  destination: Location;
  travelMode?: 'Car' | 'Walking' | 'Truck';
}

export interface RouteLeg {
  distance: number;       // in meters
  durationSeconds: number;
  startPosition: Location;
  endPosition: Location;
  geometry: Location[];   // polyline points
}

export interface RouteResponse {
  success: boolean;
  legs: RouteLeg[];
  summary: {
    distance: number;
    durationSeconds: number;
  };
}

// Map marker types for pollution display
export interface MapMarker {
  id: string;
  coordinate: Location;
  title: string;
  description?: string;
  type: 'pollution' | 'user' | 'search';
  severity?: 'low' | 'medium' | 'high';
  pollutionType?: PollutionType;
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
