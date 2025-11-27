# Ecogai Frontend

A React Native mobile application for health and safety pollution mapping.

## Features

- 🗺️ **Interactive Map** - Real-time pollution map using Google Maps with AWS Location Service for search
- 📸 **Spot Reporting** - Capture and report pollution spots with live camera
- 🤖 **Reiko AI** - AI-powered health assistant
- 👤 **User Profile** - Manage account, preferences, and medical conditions
- 🔐 **Authentication** - Email/password login with OTP verification

## Tech Stack

- **React Native** + **Expo** (SDK 54)
- **TypeScript**
- **Expo Router** - File-based navigation
- **react-native-maps** - Google Maps integration
- **expo-camera** - Live camera for spot capture
- **expo-location** - GPS location services
- **NativeWind** - Tailwind CSS for React Native

## Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Physical device or emulator

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Google Maps API Key

Edit `app.json` and replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

Get your API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

### 3. Build and run (Development Build)

```bash
# Generate native projects
npx expo prebuild

# Run on Android device/emulator
npx expo run:android

# Run on iOS simulator (macOS only)
npx expo run:ios
```

### 4. Run on physical device

1. Enable **USB Debugging** on your Android phone
2. Enable **Install via USB** in Developer Options
3. Connect your phone via USB
4. Run `npx expo run:android`
5. Accept the installation prompt on your phone

## Project Structure

```
frontend/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Splash screen
│   ├── welcome.tsx         # Welcome screen
│   ├── login.tsx           # Login screen
│   ├── signup.tsx          # Signup screen
│   ├── home.tsx            # Main app (map + tabs)
│   └── chat.tsx            # Reiko AI chat
├── src/
│   ├── components/         # Reusable components
│   │   ├── BottomNavBar.tsx
│   │   └── ReikoPopup.tsx
│   ├── screens/            # Screen components
│   │   ├── HomeScreen.tsx  # Map view
│   │   ├── ProfileScreen.tsx
│   │   ├── SpotScreen.tsx  # Camera capture
│   │   └── ...
│   ├── services/
│   │   └── api.ts          # API service with all endpoints
│   ├── styles/             # Stylesheets
│   ├── constants/          # Configuration
│   │   ├── config.ts       # API URL config
│   │   └── mapConfig.ts    # Map configuration
│   └── types/
│       └── index.ts        # TypeScript types
├── assets/                 # Images, fonts
└── app.json                # Expo configuration
```

## API Endpoints (Backend Required)

The frontend expects these backend endpoints:

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP

### User Profile
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update profile

### Pollution Spots
- `GET /pollution/spots` - Get spots by location
- `POST /pollution/spots` - Create new spot
- `GET /pollution/spots/user` - Get user's spots

### AWS Location Service (Map)
- `GET /location/places/search` - Search places (SearchPlaceIndexForText)
- `GET /location/places/suggest` - Autocomplete (SearchPlaceIndexForSuggestions)
- `GET /location/geocode/reverse` - Reverse geocode (SearchPlaceIndexForPosition)
- `GET /location/places/:id` - Get place details (GetPlace)
- `POST /location/route` - Calculate route (CalculateRoute)

### AI Chat
- `POST /ai/chat` - Send message to Reiko AI

## Environment Variables

Create a `.env` file:

```env
EXPO_PUBLIC_API_URL=http://your-backend-url
```

## Scripts

```bash
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web
npm run lint        # Run ESLint
```

## Troubleshooting

### "Install canceled by user" error
Enable "Install via USB" in your phone's Developer Options.

### Location not available
Enable GPS/Location Services on your device/emulator.

### Map not showing
Ensure Google Maps API key is configured in `app.json` and has Maps SDK enabled.

## License

MIT
