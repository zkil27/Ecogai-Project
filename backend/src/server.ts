import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// HEALTH CHECK
// ============================================
app.get("/health", (req, res) => {
  console.log("📡 Health check requested");
  res.json({ status: "ok", message: "Server is running", timestamp: new Date().toISOString() });
});

// ============================================
// AUTH ROUTES
// ============================================
app.post("/auth/signup", (req, res) => {
  console.log("📝 Signup request:", req.body);
  const { email, password, phoneNumber } = req.body;
  
  // TODO: Add real database logic
  res.json({
    token: "mock-jwt-token-" + Date.now(),
    user: {
      id: "user-" + Date.now(),
      email,
      phoneNumber,
      createdAt: new Date().toISOString(),
    },
  });
});

app.post("/auth/login", (req, res) => {
  console.log("🔐 Login request:", req.body);
  const { email, password } = req.body;
  
  // TODO: Add real authentication
  res.json({
    token: "mock-jwt-token-" + Date.now(),
    user: {
      id: "user-123",
      email,
      createdAt: new Date().toISOString(),
    },
  });
});

app.post("/auth/logout", (req, res) => {
  console.log("👋 Logout request");
  res.json({ success: true, message: "Logged out successfully" });
});

app.post("/auth/send-otp", (req, res) => {
  console.log("📱 Send OTP request:", req.body);
  res.json({ success: true, message: "OTP sent successfully" });
});

app.post("/auth/verify-otp", (req, res) => {
  console.log("✅ Verify OTP request:", req.body);
  res.json({ success: true, verified: true });
});

// ============================================
// USER PROFILE ROUTES
// ============================================
app.get("/user/profile", (req, res) => {
  console.log("👤 Get profile request");
  res.json({
    id: "user-123",
    email: "user@example.com",
    phoneNumber: "+1234567890",
    createdAt: new Date().toISOString(),
  });
});

app.put("/user/profile", (req, res) => {
  console.log("✏️ Update profile request:", req.body);
  res.json({
    id: "user-123",
    ...req.body,
    updatedAt: new Date().toISOString(),
  });
});

// ============================================
// POLLUTION SPOTS ROUTES
// ============================================
const mockSpots = [
  {
    id: "spot-1",
    type: "air",
    severity: "high",
    latitude: 14.5995,
    longitude: 120.9842,
    description: "Heavy smoke from factory",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    userId: "user-123",
  },
  {
    id: "spot-2",
    type: "land",
    severity: "medium",
    latitude: 14.6010,
    longitude: 120.9860,
    description: "Garbage dumping site",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    userId: "user-123",
  },
];

app.get("/pollution/spots", (req, res) => {
  console.log("🗺️ Get pollution spots:", req.query);
  const { lat, lng, radius } = req.query;
  res.json(mockSpots);
});

app.get("/pollution/spots/user", (req, res) => {
  console.log("📍 Get user spots");
  res.json(mockSpots);
});

app.get("/pollution/spots/:id", (req, res) => {
  console.log("📍 Get spot by ID:", req.params.id);
  const spot = mockSpots.find((s) => s.id === req.params.id);
  if (spot) {
    res.json(spot);
  } else {
    res.status(404).json({ error: "Spot not found" });
  }
});

app.post("/pollution/spots", (req, res) => {
  console.log("➕ Create pollution spot:", req.body);
  const newSpot = {
    id: "spot-" + Date.now(),
    ...req.body,
    createdAt: new Date().toISOString(),
    userId: "user-123",
  };
  mockSpots.push(newSpot);
  res.status(201).json(newSpot);
});

// ============================================
// IMAGE UPLOAD ROUTE
// ============================================
app.post("/upload/image", (req, res) => {
  console.log("📷 Image upload request");
  // TODO: Add real file upload logic (S3, etc.)
  res.json({
    url: "https://placeholder.com/uploaded-image-" + Date.now() + ".jpg",
  });
});

// ============================================
// LOCATION ROUTES
// ============================================
app.get("/location/search", (req, res) => {
  console.log("🔍 Location search:", req.query);
  res.json([
    { id: "loc-1", name: "Manila", latitude: 14.5995, longitude: 120.9842 },
  ]);
});

app.get("/location/places/search", (req, res) => {
  console.log("🔍 Places search:", req.query);
  res.json({
    results: [
      { placeId: "place-1", name: "Sample Place", latitude: 14.5995, longitude: 120.9842 },
    ],
  });
});

app.get("/location/places/suggest", (req, res) => {
  console.log("💡 Place suggestions:", req.query);
  res.json({
    suggestions: [
      { placeId: "place-1", name: "Suggested Place", latitude: 14.5995, longitude: 120.9842 },
    ],
  });
});

app.get("/location/geocode/reverse", (req, res) => {
  console.log("📍 Reverse geocode:", req.query);
  res.json({
    address: "Sample Address, City",
    latitude: parseFloat(req.query.lat as string) || 0,
    longitude: parseFloat(req.query.lng as string) || 0,
  });
});

app.get("/location/places/:id", (req, res) => {
  console.log("📍 Get place details:", req.params.id);
  res.json({
    place: {
      placeId: req.params.id,
      name: "Sample Place",
      address: "123 Sample St",
      latitude: 14.5995,
      longitude: 120.9842,
    },
  });
});

app.post("/location/route", (req, res) => {
  console.log("🛣️ Calculate route:", req.body);
  res.json({
    distance: 5.2,
    duration: 15,
    steps: [],
  });
});

// ============================================
// AI CHAT ROUTE (Reiko)
// ============================================
app.post("/ai/chat", (req, res) => {
  console.log("🤖 AI Chat request:", req.body);
  const { message } = req.body;
  
  // Simple mock response - TODO: integrate with real AI
  const responses = [
    "Hello! I'm Reiko, your eco-assistant. How can I help you today?",
    "That's a great question about the environment!",
    "I can help you report pollution spots in your area.",
    "Climate change is a serious issue. Let's work together to make a difference!",
  ];
  
  res.json({
    message: responses[Math.floor(Math.random() * responses.length)],
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  console.log("❓ Unknown route:", req.method, req.path);
  res.status(404).json({ error: "Route not found", path: req.path });
});

// ============================================
// START SERVER - Listen on all interfaces (0.0.0.0)
// ============================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
  console.log(`\n💡 Endpoints available:`);
  console.log(`   GET  /health`);
  console.log(`   POST /auth/signup, /auth/login, /auth/logout`);
  console.log(`   GET  /pollution/spots`);
  console.log(`   POST /pollution/spots`);
  console.log(`   POST /ai/chat`);
  console.log(`\n✅ Backend ready to accept connections!\n`);
});

export default app;
