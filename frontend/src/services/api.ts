import { API_URL, CONFIG } from "../constants/config";
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
  // AWS LOCATION SERVICE ENDPOINTS
  // Backend should use AWS Location Service for these
  // ============================================
  
  /**
   * Search for places by text query
   * Backend: Use AWS Location Service SearchPlaceIndexForText API
   * Required AWS Resources:
   *   - Place Index (e.g., "ecogai-place-index")
   * 
   * @param query - Search text (e.g., "coffee shop", "123 Main St")
   * @param biasPosition - Optional location to bias results toward
   * @param maxResults - Maximum number of results (default: 10)
   */
  async searchPlaces(
    query: string,
    biasPosition?: Location,
    maxResults: number = 10
  ): Promise<SearchPlaceResponse> {
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
    });
    
    if (biasPosition) {
      params.append('lat', biasPosition.latitude.toString());
      params.append('lng', biasPosition.longitude.toString());
    }
    
    return this.get<SearchPlaceResponse>(`/location/places/search?${params.toString()}`);
  }

  /**
   * Get place suggestions as user types (autocomplete)
   * Backend: Use AWS Location Service SearchPlaceIndexForSuggestions API
   * Required AWS Resources:
   *   - Place Index (e.g., "ecogai-place-index")
   * 
   * @param text - Partial text input from user
   * @param biasPosition - Optional location to bias results toward
   */
  async getPlaceSuggestions(
    text: string,
    biasPosition?: Location
  ): Promise<{ suggestions: PlaceResult[] }> {
    const params = new URLSearchParams({ text });
    
    if (biasPosition) {
      params.append('lat', biasPosition.latitude.toString());
      params.append('lng', biasPosition.longitude.toString());
    }
    
    return this.get<{ suggestions: PlaceResult[] }>(`/location/places/suggest?${params.toString()}`);
  }

  /**
   * Reverse geocode - get address from coordinates
   * Backend: Use AWS Location Service SearchPlaceIndexForPosition API
   * Required AWS Resources:
   *   - Place Index (e.g., "ecogai-place-index")
   * 
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<ReverseGeocodeResponse> {
    return this.get<ReverseGeocodeResponse>(
      `/location/geocode/reverse?lat=${latitude}&lng=${longitude}`
    );
  }

  /**
   * Get place details by Place ID
   * Backend: Use AWS Location Service GetPlace API
   * Required AWS Resources:
   *   - Place Index (e.g., "ecogai-place-index")
   * 
   * @param placeId - The Place ID from a search result
   */
  async getPlaceDetails(placeId: string): Promise<{ place: PlaceResult }> {
    return this.get<{ place: PlaceResult }>(
      `/location/places/${encodeURIComponent(placeId)}`
    );
  }

  /**
   * Calculate route between two points
   * Backend: Use AWS Location Service CalculateRoute API
   * Required AWS Resources:
   *   - Route Calculator (e.g., "ecogai-route-calculator")
   * 
   * @param origin - Starting location
   * @param destination - Ending location
   * @param travelMode - Mode of travel (default: 'Car')
   */
  async calculateRoute(
    origin: Location,
    destination: Location,
    travelMode: 'Car' | 'Walking' | 'Truck' = 'Car'
  ): Promise<RouteResponse> {
    return this.post<RouteResponse>('/location/route', {
      originLatitude: origin.latitude,
      originLongitude: origin.longitude,
      destinationLatitude: destination.latitude,
      destinationLongitude: destination.longitude,
      travelMode,
    });
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
