import json
import boto3  # type: ignore
from datetime import datetime
from botocore.exceptions import ClientError  # type: ignore

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
USERS_TABLE = 'Ecogai-Users'
users_table = dynamodb.Table(USERS_TABLE)

def lambda_handler(event, context):

    try:
        http_method = event.get('httpMethod', 'GET')
        user_id = event.get('pathParameters', {}).get('userId')

        if not user_id:
            return error_response(400, 'userId is required')
        
        if http_method == 'GET':
            return get_profile(user_id)
        elif http_method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            return update_profile(user_id, body)
        else:
            return error_response(405, f'Method {http_method} not allowed')
    
    except Exception as e:
        print(f"Error: {e}")
        return error_response(500, str(e))

def get_profile(user_id):
   
    try:
       
        response = users_table.get_item(Key={'userId': user_id})
        if 'Item' not in response:
            return error_response(404, 'User not found')
        
        user_data = response['Item']

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps ({
                'userId': user_data.get('userId'),
                'email': user_data.get('email'),
                'name': user_data.get('name'),
                'healthConditions': user_data.get('healthConditions'),
                'barangay': user_data.get('barangay'),
                'city': user_data.get('city'),
                'createdAt': user_data.get('createdAt'),
            })
        }
    except ClientError as e:
        print(f"DynamoDB Error: {e}")
        return error_response(500, 'Failed to fetch user profile')

def update_profile(user_id, updates):

    try:
        # Build update expression dynamically
        update_expression = 'SET updatedAt = :updatedAt'
        expression_values = {':updatedAt': datetime.now().isoformat()}
        expression_names = {}

        # Allowed fields to update
        allowed_fields = ['name', 'healthConditions', 'barangay', 'city']

        for field in allowed_fields:
            if field in updates:

                # Handle reserved keywords
                attr_name = f"#{field}"
                attr_value = f":{field}"

                update_expression += f", {attr_name} = {attr_value}"
                expression_names[attr_name] = field
                expression_values[attr_value] = updates[field]
        
        #Update item in DynamoDB
        response = users_table.update_item(
            Key = {'userId': user_id},
            UpdateExpression = update_expression,
            ExpressionAttributeNames = expression_names,
            ExpressionAttributeValues = expression_values,
            ReturnValues = 'ALL_NEW'
        )

        updated_user = response['Attributes']

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps ({
                'message': 'Profile updated successfully',
                'user': {
                    'userId': updated_user.get('userId'),
                    'name': updated_user.get('name'),
                    'healthConditions': updated_user.get('healthConditions', []),
                    'barangay': updated_user.get('barangay'),
                    'city': updated_user.get('city'),
                    'updatedAt': updated_user.get('updatedAt')
                }
            })
        }
    except ClientError as e:
        print(f"DynamoDB Error: {e}")
        return error_response(500, 'Failed to update user profile')

def error_response(status_code, message):

    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message})
    }