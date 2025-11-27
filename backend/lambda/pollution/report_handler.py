import json
import boto3  # type: ignore
import uuid
import base64
from datetime import datetime
from decimal import Decimal
from botocore.exceptions import ClientError  # type: ignore
import os

# Initialize AWS services
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
events = boto3.client('events')
cloudwatch = boto3.client('cloudwatch')

# Environment variables
REPORTS_TABLE = os.environ.get('REPORTS_TABLE', 'PollutionApp-Reports')
MEDIA_BUCKET = os.environ.get('MEDIA_BUCKET', 'pollution-app-media-uploads')

reports_table = dynamodb.Table(REPORTS_TABLE)

def lambda_handler(event, context):
    """
    Main Lambda handler for pollution reporting
    Architecture: API Gateway → Lambda → [DynamoDB, S3, EventBridge]
    """
    
    try:
        http_method = event.get('httpMethod', 'GET')
        
        # Log request
        log_metric('ReportRequest', 1)
        
        if http_method == 'POST':
            body = json.loads(event.get('body', '{}'))
            return create_report(body)
        elif http_method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            return get_reports(params)
        else:
            return error_response(405, f'Method {http_method} not allowed')
    
    except Exception as e:
        log_metric('ReportError', 1)
        print(f"Error: {e}")
        return error_response(500, str(e))


def create_report(data):
    """
    Create a new pollution report with optional image
    Enhanced with image upload to S3 and event orchestration
    """
    try:
        # Validate required fields
        required = ['userId', 'location', 'pollutionType', 'severity']
        for field in required:
            if field not in data:
                return error_response(400, f'Missing required field: {field}')
        
        # Validate location data
        location = data['location']
        if 'latitude' not in location or 'longitude' not in location:
            return error_response(400, 'Location must include latitude and longitude')
        
        # Generate report ID and timestamp
        report_id = str(uuid.uuid4())
        timestamp = int(datetime.now().timestamp() * 1000)
        
        # Handle image upload if provided
        image_url = None
        if 'imageBase64' in data:
            try:
                image_url = upload_image_to_s3(report_id, data['imageBase64'])
                log_metric('ImageUploaded', 1)
            except Exception as e:
                print(f"Image upload failed: {e}")
                # Continue without image
        
        # Prepare report data
        report = {
            'reportId': report_id,
            'timestamp': timestamp,
            'userId': data['userId'],
            'location': {
                'latitude': Decimal(str(location['latitude'])),
                'longitude': Decimal(str(location['longitude'])),
                'address': location.get('address', ''),
                'barangay': location.get('barangay', ''),
                'city': location.get('city', '')
            },
            'pollutionType': data['pollutionType'],
            'severity': data['severity'],
            'description': data.get('description', ''),
            'imageUrl': image_url or '',
            'status': 'pending',
            'isVerified': False,
            'createdAt': datetime.now().isoformat(),
            'metadata': {
                'source': data.get('source', 'mobile_app'),
                'deviceInfo': data.get('deviceInfo', {}),
                'reportedVia': data.get('reportedVia', 'manual')
            }
        }
        
        # Save to DynamoDB
        reports_table.put_item(Item=report)
        log_metric('ReportCreated', 1)
        
        # Trigger orchestration workflow
        trigger_pollution_orchestration(report)
        
        # Return success response
        return {
            'statusCode': 201,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'message': 'Report created successfully',
                'data': {
                    'reportId': report_id,
                    'timestamp': timestamp,
                    'imageUrl': image_url,
                    'status': 'pending'
                }
            })
        }
    
    except ClientError as e:
        log_metric('DynamoDBError', 1)
        print(f"DynamoDB Error: {e}")
        return error_response(500, 'Failed to create report')


def upload_image_to_s3(report_id, image_base64):
    """
    Upload pollution image to S3
    Architecture: Lambda → S3 → (triggers Image Processing Lambda)
    
    Args:
        report_id (str): Report ID
        image_base64 (str): Base64 encoded image
        
    Returns:
        str: S3 URL of uploaded image
    """
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        
        # Generate S3 key
        s3_key = f"pollution-images/{report_id}.jpg"
        
        # Upload to S3
        s3.put_object(
            Bucket=MEDIA_BUCKET,
            Key=s3_key,
            Body=image_data,
            ContentType='image/jpeg',
            Metadata={
                'reportId': report_id,
                'uploadedAt': datetime.now().isoformat()
            }
        )
        
        # Generate public URL (if bucket is public) or signed URL
        image_url = f"https://{MEDIA_BUCKET}.s3.amazonaws.com/{s3_key}"
        
        print(f"Image uploaded to S3: {image_url}")
        return image_url
        
    except Exception as e:
        print(f"S3 upload error: {e}")
        raise


def trigger_pollution_orchestration(report):
    """
    Trigger EventBridge orchestration workflow
    Architecture: Lambda → EventBridge → [SageMaker, Rekognition, Health Advisor]
    
    This triggers multiple Lambda functions in parallel:
    1. Image Processing (Rekognition)
    2. SageMaker Predictor (ML hotspot analysis)
    3. Health Advisor (if high severity)
    """
    try:
        event_detail = {
            'reportId': report['reportId'],
            'userId': report['userId'],
            'location': {
                'latitude': float(report['location']['latitude']),
                'longitude': float(report['location']['longitude']),
                'barangay': report['location'].get('barangay', ''),
                'city': report['location'].get('city', '')
            },
            'pollutionType': report['pollutionType'],
            'severity': report['severity'],
            'imageUrl': report.get('imageUrl', ''),
            'timestamp': report['timestamp']
        }
        
        # Send event to EventBridge
        events.put_events(
            Entries=[
                {
                    'Source': 'pollution.app',
                    'DetailType': 'NewPollutionReport',
                    'Detail': json.dumps(event_detail),
                    'EventBusName': 'default'
                }
            ]
        )
        
        log_metric('OrchestrationTriggered', 1)
        print(f"Orchestration triggered for report: {report['reportId']}")
        
    except Exception as e:
        print(f"Failed to trigger orchestration: {e}")
        # Don't fail the request if orchestration fails


def get_reports(query_params):
    """
    Get pollution reports with filters
    Enhanced with pagination and better filtering
    """
    try:
        # Get filter parameters
        barangay = query_params.get('barangay')
        pollution_type = query_params.get('pollutionType')
        severity = query_params.get('severity')
        limit = int(query_params.get('limit', 100))
        last_evaluated_key = query_params.get('lastKey')
        
        # Build scan parameters
        scan_params = {
            'Limit': limit
        }
        
        # Add pagination
        if last_evaluated_key:
            scan_params['ExclusiveStartKey'] = json.loads(last_evaluated_key)
        
        # Scan table
        response = reports_table.scan(**scan_params)
        reports = response.get('Items', [])
        
        # Apply filters
        if barangay:
            reports = [r for r in reports if r.get('location', {}).get('barangay') == barangay]
        
        if pollution_type:
            reports = [r for r in reports if r.get('pollutionType') == pollution_type]
        
        if severity:
            reports = [r for r in reports if r.get('severity') == severity]
        
        # Sort by timestamp (newest first)
        reports.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
        
        # Convert Decimal to float for JSON
        reports = convert_decimals(reports)
        
        # Build response
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'data': {
                    'reports': reports,
                    'count': len(reports) if isinstance(reports, list) else 0,
                    'lastEvaluatedKey': response.get('LastEvaluatedKey')
                }
            })
        }
        
    except ClientError as e:
        log_metric('DynamoDBError', 1)
        print(f"DynamoDB Error: {e}")
        return error_response(500, 'Failed to retrieve reports')


def convert_decimals(obj):
    """Convert Decimal objects to float for JSON serialization"""
    if isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_decimals(value) for key, value in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj


def log_metric(metric_name, value):
    """Log custom metric to CloudWatch"""
    try:
        cloudwatch.put_metric_data(
            Namespace='PollutionApp/Reports',
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
    """CORS headers for API Gateway"""
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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