import { API_URL, CONFIG, COGNITO_CONFIG } from "../constants/config";
import { 
  User, 
  PollutionSpot, 
  CreateSpotRequest, 
  SearchResult,
  ChatResponse,
  PlaceResult,
  SearchPlaceResponse,
  ReverseGeocodeResponse,
  RouteResponse,
  Location,
} from "../types";

/**
 * API Service for Ecogai App
 * Connects to AWS Lambda functions via API Gateway
 * 
 * Lambda Endpoints (from template.yaml):
 * - POST /signup - User registration (Cognito + DynamoDB)
 * - GET/PUT /profile/{userId} - Profile management
 * - GET/POST /reports - Pollution reports with image upload
 * - POST /agora/token - Agora RTC token generation
 * - POST /agora/report - Voice report processing via Bedrock
 * - POST /agora/location-tips - Location-based health tips
 * - POST /health-advice - AI health advisor
 * 
 * Lambda Response Format: { success: boolean, data?: {...}, error?: string }
 */

// Lambda response wrapper types
interface LambdaResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth response types
interface SignupResponse {
  userId: string;
  email: string;
  name: string;
  profileComplete: boolean;
}

interface LoginResponse {
  userId: string;
  email: string;
  name: string;
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

// Profile types
interface ProfileData {
  userId: string;
  email: string;
  name: string;
  healthConditions: string[];
  barangay: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

// Report types
interface ReportData {
  reportId: string;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  pollutionType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  imageUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Agora types
interface AgoraTokenResponse {
  token: string;
  channelName: string;
  uid: number;
  expiresIn: number;
}

interface VoiceReportResponse {
  reportId: string;
  analysis: {
    pollutionType: string;
    severity: string;
    description: string;
    healthImpact: string;
    recommendations: string[];
  };
}

interface LocationTipsResponse {
  tips: string[];
  pollutionLevel: string;
  healthRecommendations: string[];
}

// Health advice types
interface HealthAdviceResponse {
  advice: string;
  recommendations: string[];
  riskLevel: string;
}

class ApiService {
  private baseURL: string;
  private authToken: string | null = null;
  private userId: string | null = null;
  private userEmail: string | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.baseURL = API_URL;
    console.log('🔌 API Service initialized');
    console.log('☁️ AWS API Gateway:', this.baseURL);
    this.checkConnection();
  }

  // Check if AWS API Gateway is reachable
  async checkConnection(): Promise<boolean> {
    try {
      console.log('🔄 Checking AWS Lambda connection...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for Lambda cold start
      
      // Try to hit the reports endpoint as a health check
      const response = await fetch(`${this.baseURL}/reports`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        this.isConnected = true;
        console.log('✅ AWS Lambda connected!');
        console.log('📊 Response:', data.success ? 'Success' : 'Error');
        return true;
      } else if (response.status === 401 || response.status === 403) {
        // Auth required but Lambda is responding
        this.isConnected = true;
        console.log('✅ AWS Lambda connected (auth required)');
        return true;
      } else {
        this.isConnected = false;
        console.log('⚠️ AWS Lambda responded with status:', response.status);
        return false;
      }
    } catch (error: any) {
      this.isConnected = false;
      if (error.name === 'AbortError') {
        console.log('❌ AWS Lambda timeout - Lambda may be cold starting');
      } else {
        console.log('❌ AWS Lambda connection failed:', error.message);
      }
      return false;
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Set user ID after login
  setUserId(userId: string | null) {
    this.userId = userId;
  }

  setUserEmail(email: string | null) {
    this.userEmail = email;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Generic request handler that processes Lambda response format
   * Lambda returns: { success: boolean, data?: T, error?: string }
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<LambdaResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.authToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      console.log(`📡 API ${options.method || 'GET'}: ${endpoint}`);
      const response = await fetch(url, config);
      const jsonData = await response.json();

      if (!response.ok) {
        console.error(`❌ API Error [${response.status}]:`, jsonData.error || jsonData.message);
        return {
          success: false,
          error: jsonData.error || jsonData.message || `HTTP error! status: ${response.status}`,
        };
      }

      // Lambda already returns { success, data/error } format
      if (typeof jsonData.success === 'boolean') {
        if (jsonData.success) {
          console.log(`✅ API Success: ${endpoint}`);
        } else {
          console.log(`⚠️ API Failed: ${jsonData.error}`);
        }
        return jsonData as LambdaResponse<T>;
      }

      // Wrap non-Lambda responses
      return { success: true, data: jsonData };
    } catch (error: any) {
      console.error("❌ API request failed:", error.message);
      return { success: false, error: error.message };
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<LambdaResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(endpoint: string, data: any, options?: RequestInit): Promise<LambdaResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any, options?: RequestInit): Promise<LambdaResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<LambdaResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  // ============================================
  // AUTH ENDPOINTS (AWS Cognito via Lambda)
  // Lambda: POST /signup
  // Request: { email, password, name, healthConditions[], barangay, city }
  // Response: { success, data: { userId, email, name, profileComplete } }
  // ============================================
  async signup(data: {
    email: string;
    password: string;
    name: string;
    healthConditions?: string[];
    barangay?: string;
    city?: string;
  }): Promise<LambdaResponse<SignupResponse>> {
    const response = await this.post<SignupResponse>("/signup", {
      email: data.email,
      password: data.password,
      name: data.name,
      healthConditions: data.healthConditions || [],
      barangay: data.barangay || '',
      city: data.city || 'Manila',
    });

    if (response.success && response.data) {
      this.setUserId(response.data.userId);
      this.setUserEmail(response.data.email);
      console.log('👤 User registered:', response.data.userId);
    }

    return response;
  }

  async login(email: string, password: string): Promise<LambdaResponse<LoginResponse>> {
    // Lambda: POST /login (if exists) or use Cognito SDK directly
    const response = await this.post<LoginResponse>("/login", { email, password });

    if (response.success && response.data) {
      this.setUserId(response.data.userId);
      this.setUserEmail(response.data.email);
      this.setAuthToken(response.data.accessToken);
      console.log('🔓 User logged in:', response.data.userId);
    }

    return response;
  }

  async logout(): Promise<void> {
    console.log('🔒 User logged out');
    this.setAuthToken(null);
    this.setUserId(null);
    this.setUserEmail(null);
  }

  // ============================================
  // USER PROFILE ENDPOINTS
  // Lambda: GET /profile/{userId} - Get profile
  // Lambda: PUT /profile/{userId} - Update profile
  // Request: { name?, healthConditions[]?, barangay?, city? }
  // Response: { success, data: ProfileData }
  // ============================================
  async getProfile(userId?: string): Promise<LambdaResponse<ProfileData>> {
    const id = userId || this.userId;
    if (!id) {
      return { success: false, error: "User not logged in" };
    }
    return this.get<ProfileData>(`/profile/${id}`);
  }

  async updateProfile(data: {
    name?: string;
    healthConditions?: string[];
    barangay?: string;
    city?: string;
  }): Promise<LambdaResponse<ProfileData>> {
    if (!this.userId) {
      return { success: false, error: "User not logged in" };
    }
    return this.put<ProfileData>(`/profile/${this.userId}`, data);
  }

  // ============================================
  // POLLUTION REPORTS ENDPOINTS
  // Lambda: GET /reports - Get reports with filters
  // Query params: ?barangay=xxx&pollutionType=xxx&severity=xxx
  // Lambda: POST /reports - Create new report
  // Request: { userId, location: {lat, lng, address?}, pollutionType, severity, description?, imageBase64? }
  // Response: { success, data: ReportData | ReportData[] }
  // ============================================
  async getPollutionReports(filters?: {
    barangay?: string;
    pollutionType?: string;
    severity?: string;
  }): Promise<LambdaResponse<ReportData[]>> {
    let url = "/reports";
    const params = new URLSearchParams();
    
    if (filters?.barangay) params.append('barangay', filters.barangay);
    if (filters?.pollutionType) params.append('pollutionType', filters.pollutionType);
    if (filters?.severity) params.append('severity', filters.severity);
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    return this.get<ReportData[]>(url);
  }

  // Alias for backward compatibility
  async getPollutionSpots(
    latitude?: number,
    longitude?: number,
    radiusKm: number = 5
  ): Promise<LambdaResponse<ReportData[]>> {
    // Current Lambda doesn't support geo queries, just return all reports
    return this.getPollutionReports();
  }

  async getReportById(reportId: string): Promise<LambdaResponse<ReportData>> {
    return this.get<ReportData>(`/reports/${reportId}`);
  }

  async createReport(data: {
    location: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    pollutionType: 'air' | 'water' | 'noise' | 'waste' | 'soil';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description?: string;
    imageBase64?: string; // Base64 encoded image for S3 upload
  }): Promise<LambdaResponse<ReportData>> {
    if (!this.userId) {
      return { success: false, error: "User not logged in" };
    }

    return this.post<ReportData>("/reports", {
      userId: this.userId,
      location: data.location,
      pollutionType: data.pollutionType,
      severity: data.severity,
      description: data.description,
      imageBase64: data.imageBase64,
    });
  }

  // Alias for backward compatibility
  async createSpot(data: CreateSpotRequest): Promise<LambdaResponse<ReportData>> {
    return this.createReport({
      location: {
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        address: data.location,
      },
      pollutionType: (data.type as any) || 'air',
      severity: (data.severity as any) || 'medium',
      description: data.description,
    });
  }

  async getUserReports(): Promise<LambdaResponse<ReportData[]>> {
    if (!this.userId) {
      return { success: false, error: "User not logged in" };
    }
    // Filter by userId if supported, otherwise get all
    return this.getPollutionReports();
  }

  /**
   * Convert image URI to base64 for Lambda upload
   */
  async imageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      throw error;
    }
  }

  // ============================================
  // AGORA ENDPOINTS (Voice/Video AI)
  // Lambda: POST /agora/token - Generate RTC token
  // Request: { userId, channelName, role? }
  // Lambda: POST /agora/report - Process voice report via Bedrock
  // Request: { userId, location: {lat, lng}, voiceTranscription }
  // Lambda: POST /agora/location-tips - Get location-based tips
  // Request: { userId, latitude, longitude }
  // ============================================
  async getAgoraToken(channelName: string, role: 'publisher' | 'subscriber' = 'publisher'): Promise<LambdaResponse<AgoraTokenResponse>> {
    if (!this.userId) {
      return { success: false, error: "User not logged in" };
    }

    return this.post<AgoraTokenResponse>("/agora/token", {
      userId: this.userId,
      channelName,
      role,
    });
  }

  async submitVoiceReport(data: {
    location: {
      latitude: number;
      longitude: number;
    };
    voiceTranscription: string;
  }): Promise<LambdaResponse<VoiceReportResponse>> {
    if (!this.userId) {
      return { success: false, error: "User not logged in" };
    }

    return this.post<VoiceReportResponse>("/agora/report", {
      userId: this.userId,
      location: data.location,
      voiceTranscription: data.voiceTranscription,
    });
  }

  async getLocationTips(location: {
    latitude: number;
    longitude: number;
  }): Promise<LambdaResponse<LocationTipsResponse>> {
    return this.post<LocationTipsResponse>("/agora/location-tips", {
      userId: this.userId || 'anonymous',
      latitude: location.latitude,
      longitude: location.longitude,
    });
  }

  // ============================================
  // HEALTH ADVISOR (AI via Bedrock)
  // Lambda: POST /health-advice
  // Request: { userId?, location?, pollutionLevel?, symptoms?[] }
  // Response: { success, data: { advice, recommendations[], riskLevel } }
  // ============================================
  async getHealthAdvice(data: {
    location?: { latitude: number; longitude: number };
    pollutionLevel?: string;
    symptoms?: string[];
  }): Promise<LambdaResponse<HealthAdviceResponse>> {
    return this.post<HealthAdviceResponse>("/health-advice", {
      userId: this.userId,
      location: data.location,
      pollutionLevel: data.pollutionLevel,
      symptoms: data.symptoms,
    });
  }

  // ============================================
  // AI CHAT ENDPOINTS (ReikoAI via Health Advisor)
  // Uses /health-advice endpoint for AI responses
  // ============================================
  async sendChatMessage(message: string, context?: string): Promise<LambdaResponse<ChatResponse>> {
    return this.post<ChatResponse>("/health-advice", { 
      message, 
      context,
      userId: this.userId,
      type: 'chat',
    });
  }
}

export default new ApiService();
