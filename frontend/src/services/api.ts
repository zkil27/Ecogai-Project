import { API_URL, CONFIG } from "../constants/config";
import { 
  User, 
  PollutionSpot, 
  CreateSpotRequest, 
  SearchResult,
  ChatResponse 
} from "../types";

class ApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = API_URL;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, data: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  async signup(data: {
    email: string;
    password: string;
    phoneNumber: string;
    medicalCondition?: string;
    medicalProofUrl?: string;
  }) {
    const response = await this.post<{ token: string; user: User }>("/auth/signup", data);
    this.setAuthToken(response.token);
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.post<{ token: string; user: User }>("/auth/login", { email, password });
    this.setAuthToken(response.token);
    return response;
  }

  async logout() {
    this.setAuthToken(null);
    return this.post("/auth/logout", {});
  }

  // ============================================
  // OTP ENDPOINTS
  // ============================================
  async sendOTP(phoneNumber: string) {
    return this.post("/auth/send-otp", { phoneNumber });
  }

  async verifyOTP(phoneNumber: string, otp: string) {
    return this.post("/auth/verify-otp", { phoneNumber, otp });
  }

  // ============================================
  // USER PROFILE ENDPOINTS
  // ============================================
  async getProfile(): Promise<User> {
    return this.get<User>("/user/profile");
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.put<User>("/user/profile", data);
  }

  // ============================================
  // POLLUTION SPOTS ENDPOINTS
  // ============================================
  async getPollutionSpots(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<PollutionSpot[]> {
    return this.get<PollutionSpot[]>(
      `/pollution/spots?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`
    );
  }

  async getSpotById(spotId: string): Promise<PollutionSpot> {
    return this.get<PollutionSpot>(`/pollution/spots/${spotId}`);
  }

  async createSpot(data: CreateSpotRequest): Promise<PollutionSpot> {
    return this.post<PollutionSpot>("/pollution/spots", data);
  }

  async getUserSpots(): Promise<PollutionSpot[]> {
    return this.get<PollutionSpot[]>("/pollution/spots/user");
  }

  async uploadSpotImage(imageUri: string): Promise<{ url: string }> {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";
    
    formData.append("image", {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await fetch(`${this.baseURL}/upload/image`, {
      method: "POST",
      headers: {
        ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    return response.json();
  }

  // ============================================
  // LOCATION SEARCH ENDPOINTS
  // ============================================
  async searchLocation(query: string): Promise<SearchResult[]> {
    return this.get<SearchResult[]>(`/location/search?q=${encodeURIComponent(query)}`);
  }

  // ============================================
  // AI CHAT ENDPOINTS (ReikoAI)
  // ============================================
  async sendChatMessage(message: string, context?: string): Promise<ChatResponse> {
    return this.post<ChatResponse>("/ai/chat", { message, context });
  }

  // ============================================
  // FILE UPLOAD (Legacy)
  // ============================================
  async uploadFile(file: any) {
    const formData = new FormData();
    formData.append("file", file);

    return this.request("/upload", {
      method: "POST",
      body: formData,
      headers: {
        // Content-Type will be set automatically for FormData
      },
    });
  }
}

export default new ApiService();
