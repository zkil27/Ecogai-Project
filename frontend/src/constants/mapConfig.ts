/**
 * MAP CONFIGURATION
 * Configuration for AWS Location Service and map display
 * Backend team: Update these values after setting up AWS Location Service
 */

// Default map region (New York - can be changed to any default location)
export const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.0060,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Map zoom levels for different scenarios
export const ZOOM_LEVELS = {
  CITY: { latitudeDelta: 0.1, longitudeDelta: 0.1 },
  NEIGHBORHOOD: { latitudeDelta: 0.02, longitudeDelta: 0.02 },
  STREET: { latitudeDelta: 0.005, longitudeDelta: 0.005 },
  BUILDING: { latitudeDelta: 0.001, longitudeDelta: 0.001 },
};

// Marker colors based on pollution severity
export const POLLUTION_MARKER_COLORS = {
  low: '#4CAF50',      // Green
  medium: '#FF9800',   // Orange  
  high: '#F44336',     // Red
};

// Pollution type icons (emoji for now, can be replaced with custom images)
export const POLLUTION_TYPE_ICONS = {
  air: '💨',
  land: '🗑️',
};

// Search configuration
export const SEARCH_CONFIG = {
  DEBOUNCE_MS: 300,           // Delay before triggering search
  MAX_SUGGESTIONS: 5,         // Max autocomplete suggestions
  MAX_SEARCH_RESULTS: 10,     // Max search results
  MIN_QUERY_LENGTH: 2,        // Minimum characters to trigger search
};

// Map animation configuration
export const MAP_ANIMATION = {
  DURATION_MS: 500,           // Animation duration for map movements
};
