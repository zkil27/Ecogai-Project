# Ecogai - Health and Safety Pollution Mapping Platform

**Your Health and Safety, Mapped in Real-Time**

Ecogai is a full-stack mobile application that helps users monitor pollution levels, receive AI-powered health recommendations, and navigate away from polluted zones.

## Features

- 🗺️ **Pollution Mapping** - Interactive map showing pollution spots with severity levels
- 📸 **Spot Reporting** - Capture and report pollution using device camera
- 🤖 **Reiko AI** - AI health assistant for environmental health advice
- 🔍 **Location Search** - Search places using AWS Location Service
- 👤 **User Profiles** - Track health conditions and preferences
- 🔐 **Authentication** - Secure signup/login with OTP verification

## Project Structure

```
Ecogai/
├── frontend/        # React Native mobile app (Expo SDK 54)
│   ├── app/         # Expo Router screens
│   └── src/         # Components, services, styles
├── backend/         # AWS serverless backend + Express server
│   ├── src/         # Express server
│   └── lambda/      # AWS Lambda functions
└── shared/          # Shared TypeScript types
```

## Tech Stack

### Frontend
- React Native + Expo (SDK 54)
- TypeScript
- Expo Router (file-based navigation)
- react-native-maps (Google Maps)
- expo-camera, expo-location
- NativeWind (Tailwind CSS)

### Backend
- Node.js + Express
- TypeScript
- AWS Lambda (authentication)
- AWS Location Service (maps/geocoding)
- AWS Cognito (user auth)
- AWS Bedrock (AI assistant)
- AWS S3 (file storage)

## Quick Start

### Frontend

```bash
cd frontend
npm install

# Configure Google Maps API key in app.json
# Get key from https://console.cloud.google.com/apis/credentials

npx expo prebuild
npx expo run:android   # or npx expo run:ios
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## AWS Location Service Integration

The backend implements these AWS Location Service endpoints for map features:

| Frontend Endpoint | AWS API |
|-------------------|---------|
| `GET /location/places/search` | `SearchPlaceIndexForText` |
| `GET /location/places/suggest` | `SearchPlaceIndexForSuggestions` |
| `GET /location/geocode/reverse` | `SearchPlaceIndexForPosition` |
| `POST /location/route` | `CalculateRoute` |

See `frontend/src/services/api.ts` for detailed endpoint documentation.

## Running on Physical Device

1. Enable **USB Debugging** on your Android phone (Settings > Developer Options)
2. Enable **Install via USB** in Developer Options
3. Connect phone via USB and authorize debugging
4. Run `npx expo run:android`

## Documentation

- [Frontend Setup Guide](./frontend/README.md)
- [Backend Setup Guide](./backend/README.md)
- [Lambda Deployment](./backend/README-LAMBDA.md)
- [API Documentation](./frontend/API_DOCUMENTATION.md)

## Environment Variables

### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Backend
See `backend/.env.example`

## License

MIT License

---

**Made with 💚 by the Ecogai Team**
