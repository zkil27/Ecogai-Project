# Ecogai Backend - AWS Lambda Functions

This directory contains AWS Lambda functions for the Ecogai backend.

## Structure

```
lambda/
├── auth/                   # Authentication handlers
│   ├── signup_handler.py
│   └── login_handler.py
├── profile/                # User profile management
│   └── profile_manager.py
├── pollution/              # Pollution data handlers
│   └── pollution_handler.py
├── ai/                     # AI assistant handlers
│   └── ai_assistant_handler.py
└── shared/                 # Shared utilities
    └── response_helper.py
```

## AWS Services Used

- **AWS Lambda**: Serverless compute
- **AWS API Gateway**: REST API endpoints
- **AWS Cognito**: User authentication
- **AWS DynamoDB**: NoSQL database
- **AWS S3**: File storage
- **AWS Bedrock**: AI/ML services (Claude 3)

## Setup

### Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Python 3.9+ installed

### Local Development

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Deployment

#### Option 1: AWS SAM (Recommended)

```bash
# Install AWS SAM CLI
# See: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

# Build
sam build

# Deploy
sam deploy --guided
```

#### Option 2: Manual Deployment

1. Create Lambda functions in AWS Console
2. Upload Python code as ZIP files
3. Configure environment variables
4. Set up API Gateway endpoints
5. Configure IAM roles and permissions

### Environment Variables

Each Lambda function requires these environment variables:

**Auth Functions:**

- `USER_POOL_ID`: Cognito User Pool ID
- `USER_POOL_CLIENT_ID`: Cognito App Client ID
- `USERS_TABLE`: DynamoDB users table name

**Profile Function:**

- `USERS_TABLE`: DynamoDB users table name

**Pollution Function:**

- `POLLUTION_TABLE`: DynamoDB pollution data table name

**AI Function:**

- `BEDROCK_MODEL_ID`: Bedrock model ID

## API Endpoints

### Authentication

#### POST /api/auth/signup

Register a new user

**Request:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "abc123..."
}
```

#### POST /api/auth/login

Authenticate user

**Request:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**

```json
{
  "success": true,
  "accessToken": "...",
  "refreshToken": "...",
  "idToken": "...",
  "expiresIn": 3600
}
```

### Profile

#### GET /api/profile/{userId}

Get user profile

#### PUT /api/profile/{userId}

Update user profile

**Request:**

```json
{
  "name": "John Doe",
  "bio": "Health enthusiast",
  "location": "San Francisco, CA",
  "preferences": {
    "notifications": true,
    "healthConditions": ["asthma"]
  }
}
```

### Pollution Data

#### GET /api/pollution?latitude={lat}&longitude={lng}&radius={km}

Get pollution data for location

**Response:**

```json
{
  "success": true,
  "data": {
    "aqi": 75,
    "pollutants": {
      "pm25": 25.5,
      "pm10": 45.2,
      "o3": 55.0
    },
    "quality": "Moderate",
    "healthRecommendations": [...]
  }
}
```

### AI Assistant

#### POST /api/ai/chat

Chat with AI assistant (Reiko)

**Request:**

```json
{
  "message": "What should I do about high pollution?",
  "context": {
    "aqi": 150,
    "location": "San Francisco",
    "userHealth": ["asthma"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "response": "Based on the current AQI of 150...",
  "assistant": "Reiko"
}
```

## IAM Permissions

Lambda functions need these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:SignUp",
        "cognito-idp:InitiateAuth",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "bedrock:InvokeModel",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## Testing

```bash
# Test locally with SAM
sam local invoke SignupFunction -e events/signup-event.json

# Or use AWS CLI
aws lambda invoke \
  --function-name ecogai-signup \
  --payload file://test-event.json \
  response.json
```

## Monitoring

- CloudWatch Logs: `/aws/lambda/ecogai-*`
- X-Ray: Enable for distributed tracing
- CloudWatch Metrics: Track invocations, errors, duration

## Cost Optimization

- Use Lambda free tier (1M requests/month)
- Enable DynamoDB on-demand pricing
- Use S3 lifecycle policies
- Set appropriate Lambda timeout and memory

## Security

- Enable encryption at rest for DynamoDB
- Use VPC endpoints for private access
- Enable CloudTrail for audit logging
- Rotate credentials regularly
- Use AWS Secrets Manager for sensitive data

## Integration with Frontend

Frontend should use these environment variables:

```env
EXPO_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
EXPO_PUBLIC_USER_POOL_ID=us-east-1_xxxxxx
EXPO_PUBLIC_USER_POOL_CLIENT_ID=xxxxxxxxx
```

Update `frontend/src/constants/config.ts` accordingly.
