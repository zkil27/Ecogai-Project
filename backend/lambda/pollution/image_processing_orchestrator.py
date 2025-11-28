import json
import boto3  # type: ignore
import os
from datetime import datetime
from botocore.exceptions import ClientError  # type: ignore

# Initialize AWS services
lambda_client = boto3.client('lambda')
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')
cloudwatch = boto3.client('cloudwatch')

# Environment variables
REPORTS_TABLE = os.environ.get('REPORTS_TABLE', 'PollutionApp-Reports')
SAGEMAKER_FUNCTION = os.environ.get('SAGEMAKER_FUNCTION', 'PollutionApp-SageMakerPredictor')
HEALTH_ADVISOR_FUNCTION = os.environ.get('HEALTH_ADVISOR_FUNCTION', 'PollutionApp-HealthAdvisor')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')

reports_table = dynamodb.Table(REPORTS_TABLE)

def lambda_handler(event, context):
    """
    Main orchestration handler
    Triggered by EventBridge when new pollution report is created
    
    Architecture Flow:
    EventBridge → Orchestrator → [Image Processing, SageMaker, Health Advisor]
                                           ↓
                                    Update DynamoDB with results
    
    Expected EventBridge event:
    {
        "detail": {
            "reportId": "uuid",
            "userId": "uuid",
            "location": {...},
            "pollutionType": "gas_emission",
            "severity": "high",
            "imageUrl": "s3://...",
            "timestamp": 1234567890
        }
    }
    """
    
    try:
        # Extract event details
        detail = event.get('detail', {})
        report_id = detail.get('reportId')
        
        if not report_id:
            print("No reportId in event")
            return {'statusCode': 400, 'body': 'Missing reportId'}
        
        print(f"Processing report: {report_id}")
        
        # Update report status
        update_report_status(report_id, 'processing')
        
        # Initialize processing results
        processing_results = {
            'reportId': report_id,
            'startTime': datetime.now().isoformat(),
            'steps': {}
        }
        
        # Step 1: Invoke Image Processing (if image exists)
        if detail.get('imageUrl'):
            try:
                image_result = invoke_image_processing(detail)
                processing_results['steps']['imageProcessing'] = {
                    'status': 'completed',
                    'result': image_result
                }
                log_metric('ImageProcessingSuccess', 1)
            except Exception as e:
                print(f"Image processing failed: {e}")
                processing_results['steps']['imageProcessing'] = {
                    'status': 'failed',
                    'error': str(e)
                }
                log_metric('ImageProcessingFailure', 1)
        
        # Step 2: Invoke SageMaker Predictor (ML hotspot analysis)
        try:
            ml_result = invoke_sagemaker_predictor(detail)
            processing_results['steps']['mlPrediction'] = {
                'status': 'completed',
                'result': ml_result
            }
            log_metric('MLPredictionSuccess', 1)
        except Exception as e:
            print(f"ML prediction failed: {e}")
            processing_results['steps']['mlPrediction'] = {
                'status': 'failed',
                'error': str(e)
            }
            log_metric('MLPredictionFailure', 1)
        
        # Step 3: Invoke Health Advisor (if high severity)
        if detail.get('severity') in ['high', 'critical']:
            try:
                health_result = invoke_health_advisor(detail)
                processing_results['steps']['healthAdvisor'] = {
                    'status': 'completed',
                    'result': health_result
                }
                log_metric('HealthAdvisorSuccess', 1)
            except Exception as e:
                print(f"Health advisor failed: {e}")
                processing_results['steps']['healthAdvisor'] = {
                    'status': 'failed',
                    'error': str(e)
                }
                log_metric('HealthAdvisorFailure', 1)
        
        # Step 4: Update final status
        processing_results['endTime'] = datetime.now().isoformat()
        processing_results['overallStatus'] = determine_overall_status(processing_results)
        
        # Update report with processing results
        update_report_with_results(report_id, processing_results)
        
        # Send notification if critical
        if detail.get('severity') == 'critical':
            send_critical_alert(detail, processing_results)
        
        print(f"Orchestration completed for report: {report_id}")
        log_metric('OrchestrationCompleted', 1)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Processing completed',
                'reportId': report_id,
                'results': processing_results
            })
        }
        
    except Exception as e:
        print(f"Orchestration error: {e}")
        log_metric('OrchestrationError', 1)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


def invoke_image_processing(detail):
    """
    Invoke Image Processing Lambda (Rekognition analysis)
    This processes the uploaded image to verify it shows actual pollution
    """
    # Image processing is triggered automatically by S3 event
    # Here we just track that it should happen
    return {
        'triggered': True,
        'imageUrl': detail.get('imageUrl'),
        'note': 'Processing via S3 trigger'
    }


def invoke_sagemaker_predictor(detail):
    """
    Invoke SageMaker Predictor Lambda for ML hotspot analysis
    Architecture: Orchestrator → Lambda → SageMaker Endpoint
    """
    try:
        payload = {
            'detail': detail
        }
        
        response = lambda_client.invoke(
            FunctionName=SAGEMAKER_FUNCTION,
            InvocationType='RequestResponse',  # Synchronous
            Payload=json.dumps(payload)
        )
        
        result = json.loads(response['Payload'].read())
        print(f"SageMaker prediction result: {result}")
        
        return result
        
    except Exception as e:
        print(f"SageMaker invocation error: {e}")
        raise


def invoke_health_advisor(detail):
    """
    Invoke Health Advisor Lambda (Bedrock AI analysis)
    Architecture: Orchestrator → Lambda → Bedrock (Claude)
    """
    try:
        # Prepare payload for health advisor
        payload = {
            'body': json.dumps({
                'userId': detail.get('userId'),
                'location': detail.get('location'),
                'nearbyPollution': [
                    {
                        'reportId': detail.get('reportId'),
                        'type': detail.get('pollutionType'),
                        'severity': detail.get('severity'),
                        'distance_km': 0  # Same location
                    }
                ]
            })
        }
        
        response = lambda_client.invoke(
            FunctionName=HEALTH_ADVISOR_FUNCTION,
            InvocationType='Event',  # Asynchronous - don't wait
            Payload=json.dumps(payload)
        )
        
        return {
            'triggered': True,
            'status': 'processing'
        }
        
    except Exception as e:
        print(f"Health advisor invocation error: {e}")
        raise


def update_report_status(report_id, status):
    """
    Update report processing status in DynamoDB
    """
    try:
        reports_table.update_item(
            Key={'reportId': report_id},
            UpdateExpression='SET #status = :status, processingStartedAt = :timestamp',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': status,
                ':timestamp': datetime.now().isoformat()
            }
        )
    except ClientError as e:
        print(f"Failed to update status: {e}")


def update_report_with_results(report_id, results):
    """
    Update report with all processing results
    """
    try:
        reports_table.update_item(
            Key={'reportId': report_id},
            UpdateExpression='SET processingResults = :results, #status = :status, processedAt = :timestamp',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':results': results,
                ':status': results['overallStatus'],
                ':timestamp': datetime.now().isoformat()
            }
        )
        print(f"Updated report {report_id} with results")
    except ClientError as e:
        print(f"Failed to update results: {e}")


def determine_overall_status(processing_results):
    """Determine overall processing status based on individual step results"""
    steps = processing_results.get('steps', {})
    
    # Check if any critical steps failed
    failed_steps = [step for step, result in steps.items() if result.get('status') == 'failed']
    
    if failed_steps:
        return 'partially_processed'
    
    # Check if all steps completed
    completed_steps = [step for step, result in steps.items() if result.get('status') == 'completed']
    
    if len(completed_steps) == len(steps):
        return 'processed'
    
    return 'processing'


def send_critical_alert(detail, processing_results):
    """Send critical pollution alert via SNS"""
    if not SNS_TOPIC_ARN:
        print("SNS_TOPIC_ARN not configured")
        return
    
    try:
        message = {
            'alertType': 'CRITICAL_POLLUTION',
            'reportId': detail.get('reportId'),
            'location': detail.get('location'),
            'pollutionType': detail.get('pollutionType'),
            'severity': detail.get('severity'),
            'timestamp': detail.get('timestamp'),
            'processingResults': processing_results
        }
        
        sns.publish(
            TopicArn=SNS_TOPIC_ARN,
            Message=json.dumps(message),
            Subject='Critical Pollution Alert'
        )
        
        print(f"Critical alert sent for report: {detail.get('reportId')}")
        
    except Exception as e:
        print(f"Failed to send critical alert: {e}")


def log_metric(metric_name, value):
    """Log custom metric to CloudWatch"""
    try:
        cloudwatch.put_metric_data(
            Namespace='PollutionApp/Orchestrator',
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