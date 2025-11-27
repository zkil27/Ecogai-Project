# ECOGAI Frontend Assets & Backend API Documentation

## 📁 Required Assets

All assets should be placed in `frontend/assets/images/`

### Navigation Icons (24x24px recommended, PNG with transparency)
| Filename | Description | Used In |
|----------|-------------|---------|
| `info-icon.png` | Location/Info tab icon | Bottom Navigation |
| `profile-icon.png` | User profile tab icon | Bottom Navigation |
| `reico-icon.png` | ReikoAI tab icon (plant/sprout design) | Bottom Navigation |
| `spot-icon.png` | Camera/Spot tab icon | Bottom Navigation |
| `search-icon.png` | Magnifying glass for search | Home Screen search bar |
| `location-icon.png` | GPS/Current location icon | Home Screen location button |

### Action Icons (24x24px recommended, PNG with transparency)
| Filename | Description | Used In |
|----------|-------------|---------|
| `back-icon.png` | Left arrow for navigation | All screens with back button |
| `next-icon.png` | Right arrow/forward | Signup flow |
| `close-icon.png` | X icon for closing | Camera screen, modals |
| `flash-icon.png` | Camera flash toggle | Spot/Camera screen |
| `flip-camera-icon.png` | Flip front/back camera | Spot/Camera screen |
| `send-icon.png` | Send message arrow | ReikoAI chat |
| `settings-icon.png` | Gear icon | Profile screen |
| `logout-icon.png` | Door/exit icon | Profile screen |

### Branding Assets
| Filename | Description | Size | Used In |
|----------|-------------|------|---------|
| `icon.png` | App icon | 1024x1024px | App launcher |
| `splash-icon.png` | Splash screen logo | 200x200px | Splash screen |
| `cloud-upload-icon.png` | Upload cloud icon | 48x48px | File upload in signup |
| `google-icon.png` | Google login button | 24x24px | Login/Signup |
| `facebook-icon.png` | Facebook login button | 24x24px | Login/Signup |

### Map Markers (when AWS Maps is integrated)
| Filename | Description | Size |
|----------|-------------|------|
| `marker-air.png` | Air pollution marker | 40x40px |
| `marker-land.png` | Land pollution marker | 40x40px |
| `marker-user.png` | User location marker | 40x40px |

---

## 🔌 Backend API Endpoints

Base URL: Configured in `frontend/src/constants/config.ts`

### Authentication

#### POST `/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "phoneNumber": "+1234567890",
  "medicalCondition": "asthma",        // optional
  "medicalProofUrl": "https://..."     // optional, from file upload
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "medicalCondition": "asthma"
  }
}
```

---

#### POST `/auth/login`
Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

---

#### POST `/auth/logout`
Invalidate user session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### POST `/auth/send-otp`
Send OTP code to phone number.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

#### POST `/auth/verify-otp`
Verify OTP code.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "otp": "1234"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

---

### User Profile

#### GET `/user/profile`
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "phoneNumber": "+1234567890",
  "medicalCondition": "asthma",
  "profileImage": "https://..."
}
```

---

#### PUT `/user/profile`
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New Name",
  "medicalCondition": "none",
  "profileImage": "https://..."
}
```

**Response (200):**
```json
{
  "id": "user_id",
  "name": "New Name",
  "email": "user@example.com",
  "phoneNumber": "+1234567890",
  "medicalCondition": "none",
  "profileImage": "https://..."
}
```

---

### Pollution Spots

#### GET `/pollution/spots`
Get pollution spots near a location.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude  
- `radius` (optional): Search radius in km (default: 5)

**Example:** `/pollution/spots?lat=40.6892&lng=-73.9442&radius=10`

**Response (200):**
```json
[
  {
    "id": "spot_id",
    "userId": "user_id",
    "latitude": 40.6892,
    "longitude": -73.9442,
    "imageUrl": "https://...",
    "description": "Heavy smoke from factory",
    "pollutionType": "air",
    "severity": "high",
    "status": "verified",
    "createdAt": "2025-11-28T12:00:00Z",
    "updatedAt": "2025-11-28T12:00:00Z"
  }
]
```

---

#### GET `/pollution/spots/:id`
Get a specific pollution spot.

**Response (200):**
```json
{
  "id": "spot_id",
  "userId": "user_id",
  "latitude": 40.6892,
  "longitude": -73.9442,
  "imageUrl": "https://...",
  "description": "Heavy smoke from factory",
  "pollutionType": "air",
  "severity": "high",
  "status": "verified",
  "createdAt": "2025-11-28T12:00:00Z",
  "updatedAt": "2025-11-28T12:00:00Z"
}
```

---

#### POST `/pollution/spots`
Create a new pollution spot report.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "latitude": 40.6892,
  "longitude": -73.9442,
  "imageUrl": "https://...",
  "description": "Heavy smoke from factory",
  "pollutionType": "air",
  "severity": "high"
}
```

**Pollution Types:** `air`, `land`
**Severity Levels:** `low`, `medium`, `high`

**Response (201):**
```json
{
  "id": "spot_id",
  "userId": "user_id",
  "latitude": 40.6892,
  "longitude": -73.9442,
  "imageUrl": "https://...",
  "description": "Heavy smoke from factory",
  "pollutionType": "air",
  "severity": "high",
  "status": "pending",
  "createdAt": "2025-11-28T12:00:00Z",
  "updatedAt": "2025-11-28T12:00:00Z"
}
```

---

#### GET `/pollution/spots/user`
Get all spots reported by current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "spot_id",
    "latitude": 40.6892,
    "longitude": -73.9442,
    "pollutionType": "air",
    "severity": "high",
    "status": "verified",
    "createdAt": "2025-11-28T12:00:00Z"
  }
]
```

---

### File Upload

#### POST `/upload/image`
Upload an image (for pollution spots).

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (FormData):**
- `image`: Image file (JPEG/PNG)

**Response (200):**
```json
{
  "url": "https://s3.amazonaws.com/bucket/image.jpg"
}
```

---

### Location Search (AWS Location Service)

#### GET `/location/search`
Search for a location by name.

**Query Parameters:**
- `q` (required): Search query

**Example:** `/location/search?q=Brooklyn%20Bridge`

**Response (200):**
```json
[
  {
    "id": "place_id",
    "name": "Brooklyn Bridge",
    "address": "Brooklyn Bridge, New York, NY",
    "location": {
      "latitude": 40.7061,
      "longitude": -73.9969
    }
  }
]
```

---

### AI Chat (ReikoAI)

#### POST `/ai/chat`
Send a message to the AI assistant.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "What is air pollution?",
  "context": "optional context string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Response generated",
  "reply": "Air pollution refers to the contamination of the atmosphere by harmful substances..."
}
```

---

## 📊 Data Types Reference

### PollutionType
```typescript
type PollutionType = 'air' | 'land';
```

### Severity
```typescript
type Severity = 'low' | 'medium' | 'high';
```

### SpotStatus
```typescript
type SpotStatus = 'pending' | 'verified' | 'resolved';
```

---

## 🔐 Authentication

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

Token is received from `/auth/login` or `/auth/signup` responses.

---

## ❌ Error Responses

All endpoints may return these error formats:

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "message": "Email is required"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server error",
  "message": "An unexpected error occurred"
}
```

---

## 🗺️ AWS Integration Notes

### AWS Maps (To Be Implemented)
- Use **Amazon Location Service** for maps
- Map style: Consider using a clean, minimal style
- Features needed:
  - Display map tiles
  - Show user location
  - Place custom markers for pollution spots
  - Search/geocoding functionality

### AWS S3 (For Image Uploads)
- Create bucket for user uploads
- Configure CORS for mobile app access
- Set up presigned URLs or direct upload

### AWS Lambda (AI Chat)
- Integrate with Bedrock or external AI service
- Handle chat message processing
- Return structured responses

---

## 📱 Frontend Packages Required

```bash
npx expo install expo-location expo-camera expo-image-picker
```

These are already used in the app:
- `expo-location` - For user location
- `expo-camera` - For capturing pollution spots
- `expo-image-picker` - Alternative to camera for gallery selection
