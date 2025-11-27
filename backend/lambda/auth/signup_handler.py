import json
import boto3  # type: ignore
import uuid
from datetime import datetime
from botocore.exceptions import ClientError  # type: ignore
import os

# Initialize AWS services
dynamodb = boto3.resource('dynamodb')
cognito = boto3.client('cognito-idp')
cloudwatch = boto3.client('cloudwatch')

# Environment variables
USERS_TABLE = os.environ.get('USERS_TABLE', 'PollutionApp-Users')
COGNITO_USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')

# DynamoDB table
users_table = dynamodb.Table(USERS_TABLE)

def lambda_handler(event, context):
    """
    Main Lambda handler for user signup
    Architecture flow: Route 53 → WAF → Shield → API Gateway → Lambda
    
    Expected input from API Gateway:
    {
        "body": {
            "email": "user@example.com",
            "password": "securePassword123",
            "name": "Juan Dela Cruz",
            "healthConditions": ["asthma", "heart disease"],
            "barangay": "San Jose",
            "city": "Manila"
        }
    }
    """
    
    try:
        # Log request for CloudWatch monitoring
        log_metric('SignupAttempt', 1)
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Extract user data
        email = body.get('email', '').strip().lower()
        password = body.get('password')
        name = body.get('name', '').strip()
        health_conditions = body.get('healthConditions', [])
        barangay = body.get('barangay', '').strip()
        city = body.get('city', '').strip()
        
        # Validate required fields
        validation_error = validate_signup_data(email, password, name)
        if validation_error:
            log_metric('SignupValidationError', 1)
            return error_response(400, validation_error)
        
        # Generate unique user ID
        user_id = str(uuid.uuid4())
        
        # Step 1: Create user in Cognito (authentication)
        try:
            cognito_response = create_cognito_user(email, password, name, user_id)
            log_metric('CognitoUserCreated', 1)
        except Exception as e:
            log_metric('CognitoCreationError', 1)
            if 'UsernameExistsException' in str(e):
                return error_response(409, 'User with this email already exists')
            return error_response(500, f'Authentication service error: {str(e)}')
        
        # Step 2: Store user profile in DynamoDB
        try:
            user_data = {
                'userId': user_id,
                'email': email,
                'name': name,
                'healthConditions': health_conditions,
                'barangay': barangay,
                'city': city,
                'isActive': True,
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat(),
                'notificationPreferences': {
                    'email': True,
                    'push': True,
                    'sms': False
                },
                'profileComplete': True if health_conditions else False
            }
            
            users_table.put_item(Item=user_data)
            log_metric('UserProfileCreated', 1)
            
        except ClientError as e:
            # Rollback: Delete Cognito user if DynamoDB fails
            try:
                cognito.admin_delete_user(
                    UserPoolId=COGNITO_USER_POOL_ID,
                    Username=email
                )
            except:
                pass
            
            log_metric('DynamoDBCreationError', 1)
            return error_response(500, 'Failed to create user profile')
        
        # Success response
        log_metric('SignupSuccess', 1)
        return {
            'statusCode': 201,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': 'User created successfully',
                'data': {
                    'userId': user_id,
                    'email': email,
                    'name': name,
                    'profileComplete': user_data['profileComplete']
                }
            })
        }
        
    except json.JSONDecodeError:
        log_metric('InvalidJSON', 1)
        return error_response(400, 'Invalid JSON in request body')
    
    except Exception as e:
        log_metric('UnexpectedError', 1)
        print(f"Unexpected error: {e}")
        return error_response(500, 'Internal server error')


def validate_signup_data(email, password, name):
    """
    Validate signup data
    Returns error message if invalid, None if valid
    """
    if not email:
        return 'Email is required'
    
    if not password:
        return 'Password is required'
    
    if not name:
        return 'Name is required'
    
    # Email validation
    if '@' not in email or '.' not in email:
        return 'Invalid email format'
    
    # Password strength validation
    if len(password) < 8:
        return 'Password must be at least 8 characters long'
    
    if not any(c.isupper() for c in password):
        return 'Password must contain at least one uppercase letter'
    
    if not any(c.isdigit() for c in password):
        return 'Password must contain at least one number'
    
    return None


def create_cognito_user(email, password, name, user_id):
    """
    Create user in AWS Cognito for authentication
    Architecture: Lambda → Cognito
    
    Args:
        email (str): User email
        password (str): User password
        name (str): User full name
        user_id (str): Generated user ID
        
    Returns:
        dict: Cognito response
    """
    if not COGNITO_USER_POOL_ID:
        raise Exception('COGNITO_USER_POOL_ID not configured')
    
    try:
        # Create user
        response = cognito.admin_create_user(
            UserPoolId=COGNITO_USER_POOL_ID,
            Username=email,
            UserAttributes=[
                {'Name': 'email', 'Value': email},
                {'Name': 'email_verified', 'Value': 'true'},
                {'Name': 'name', 'Value': name},
                {'Name': 'custom:userId', 'Value': user_id}
            ],
            TemporaryPassword=password,
            MessageAction='SUPPRESS'  # Don't send welcome email
        )
        
        # Set permanent password
        cognito.admin_set_user_password(
            UserPoolId=COGNITO_USER_POOL_ID,
            Username=email,
            Password=password,
            Permanent=True
        )
        
        print(f"Cognito user created: {email}")
        return response
    
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'UsernameExistsException':
            raise Exception('UsernameExistsException')
        elif error_code == 'InvalidPasswordException':
            raise Exception('Password does not meet requirements')
        else:
            raise e


def log_metric(metric_name, value):
    """
    Log custom metric to CloudWatch
    Architecture: Lambda → CloudWatch
    """
    try:
        cloudwatch.put_metric_data(
            Namespace='PollutionApp/Signup',
            MetricData=[
                {
                    'MetricName': metric_name,
                    'Value': value,
                    'Unit': 'Count',
                    'Timestamp': datetime.now()
                }
            ]
        )
    except Exception as e:
        print(f"Failed to log metric {metric_name}: {e}")


def get_cors_headers():
    """
    CORS headers for API Gateway
    Allows frontend to call this API
    """
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '3600'
    }


def error_response(status_code, message):
    """Helper function to create error responses"""
    return {
        'statusCode': status_code,
        'headers': get_cors_headers(),
        'body': json.dumps({
            'success': False,
            'error': message
        })
    }