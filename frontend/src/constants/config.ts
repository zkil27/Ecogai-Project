// ============================================
// ECOGAI APP CONFIGURATION
// ============================================

// AWS API Gateway URL (Deployed!)
export const API_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  "https://a4yk5jzovb.execute-api.ap-southeast-2.amazonaws.com/Prod";

export const API_BASE_URL = API_URL;

export const CONFIG = {
  API_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  AWS_REGION: "ap-southeast-2",
};

// AWS Cognito Configuration (From deployment)
export const COGNITO_CONFIG = {
  USER_POOL_ID: "ap-southeast-2_oNpwlGuic",
  USER_POOL_CLIENT_ID: "5qrosffospjlolqmus6pab7ooa",
  REGION: "ap-southeast-2",
};

// Agora Configuration (for voice/video)
export const AGORA_CONFIG = {
  APP_ID: "52ef1602046f4d84892f4aa02b8c2afd",
};

// Log configuration on load
console.log('📱 Ecogai App Configuration loaded');
console.log('☁️ AWS API URL:', API_URL);
console.log('🔐 Cognito Pool:', COGNITO_CONFIG.USER_POOL_ID);
