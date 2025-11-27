# Ecogai - Health and Safety Pollution Mapping Platform

**Your Health and Safety, Mapped in Real-Time**

Ecogai is a full-stack mobile application that helps users monitor pollution levels, receive AI-powered health recommendations, and navigate away from polluted zones.

## Project Structure

```
Ecogai/
├── frontend/        # React Native mobile app (Expo)
├── backend/         # AWS serverless backend
└── README.md        # This file
```

## Frontend

The frontend is a React Native mobile application built with Expo.

**Location:** `./frontend/`

**Features:**

- Authentication (email, social login)
- Interactive pollution map
- AI assistant (Reiko)
- User profiles
- Real-time notifications

**Tech Stack:**

- React Native + Expo
- TypeScript
- Expo Router
- React Native Maps

[See frontend README](./frontend/README.md)

## Backend

The backend provides REST/GraphQL APIs and integrates with AWS services.

**Location:** `./backend/`

**Services:**

- User authentication (AWS Cognito)
- Pollution data management
- AI assistant (AWS Bedrock)
- File storage (AWS S3)
- Real-time updates

**Tech Stack:**

- AWS Lambda
- AWS API Gateway
- AWS DynamoDB
- AWS S3
- AWS Bedrock
- Node.js/TypeScript

[See backend README](./backend/README.md)

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
# Setup instructions coming soon
```

## Development Workflow

1. **Frontend Development**: Run the mobile app locally with Expo
2. **Backend Development**: Deploy to AWS or use local testing
3. **Integration**: Connect frontend to backend APIs

## Environment Variables

### Frontend

See `frontend/.env.example`

### Backend

See `backend/.env.example` (to be created)

## Documentation

- [API Documentation](./frontend/API_DOCUMENTATION.md)
- [Frontend Setup Guide](./frontend/SETUP_GUIDE.md)
- [Implementation Summary](./frontend/IMPLEMENTATION_SUMMARY.md)

## License

MIT License

---

**Made with 💚 by the Ecogai Team**
