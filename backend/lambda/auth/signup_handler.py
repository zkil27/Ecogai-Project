import json
import boto3  # type: ignore
import uuid
from datetime import datetime
from botocore.exceptions import ClientError  # type: ignore

dynamodb = boto3.resource('dynamodb')
cognito = boto3.client('cognito-idp')

#DynamoDB table
USERS_TABLE = 'Ecogai-Users'
users_table = dynamodb.Table(USERS_TABLE)

def lambda_handler(event, context):

    try:
        #Parse request body
        body = json.loads(event.get('body', '{}'))

        #Extract user data
        email = body.get('email')
        password = body.get('password')
        name = body.get('name')
        health_conditions = body.get('healthConditions', [])
        barangay = body.get('barangay')
        city = body.get('city')

        #Validate required fields
        if not all([email, password, name]):
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }, 
                'body': json.dumps({
                    'error': 'Missing required fields: email, password, name'
                })
            }

        #Generate unique user ID
        user_id = str(uuid.uuid4())


        # Create user in Cognito(authentication)
        cognito_response = create_cognito_user(email, password, name)

        # Store user profile in DynamoDB
        user_data = {
            'userId': user_id,
            'email': email,
            'name': name,
            'healthConditions': health_conditions,
            'barangay': barangay,
            'city': city,
            'createdAt': datetime.now().isoformat(),
            'isActive': True
        }
        
        users_table.put_item(Item=user_data)

        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },

            'body': json.dumps ({
                'message': 'User create successfully',
                'userId': user_id,
                'email': email
            })
        }

    except ClientError as e:
        print(f"DynamoDB Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps ({
                'error': 'Failed to create user',
                'details': str(e)
            })
        }
    
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'details': str(e)
            })
        }
def create_cognito_user(email, password, name):

    import os

    user_pool_id = os.environ.get('COGNITO_USER_POOL_ID')

    if not user_pool_id:
        print("Warning: COGNITO_USER_POOL_ID not set")
        return None
    
    try:
        response = cognito.admin_create_user(
            UserPoolId = user_pool_id,
            Username = email,
            UserAttributes = [
                {'Name': 'email', 'Value': email},
                {'Name': 'email_verified', 'Value': 'true'},
                {'Name': 'name', 'Value': name}
            ],
            TemporaryPassword=password,
            MessageAction = 'SUPPRESS' # Don't send welcome email 
        )

        # Set permanent password
        cognito.admin_set_user_password(
            UserPoolId = user_pool_id,
            Username = email,
            Password = password,
            Permanent = True
        )
        
        return response
    
    except ClientError as e:
        if e.response['Error']['Code'] == 'UsernameExistsException':
            raise Exception('User with this email already exists')
        raise e