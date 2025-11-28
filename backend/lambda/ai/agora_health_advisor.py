import json
import boto3  # type: ignore
import os
import time
import hashlib
import hmac
from datetime import datetime
from decimal import Decimal
from botocore.exceptions import ClientError  # type: ignore
import requests  # type: ignore

# Import config helper
import sys
sys.path.append('/opt/python')
try:
    from config_helper import config  # type: ignore
except:
    config = None

# Initialize AWS services
dynamodb = boto3.resource('dynamodb')
bedrock = boto3.client('bedrock-runtime')
polly = boto3.client('polly')  # AWS Polly for TTS
s3 = boto3.client('s3')
cloudwatch = boto3.client('cloudwatch')

# Environment variables
USERS_TABLE = os.environ.get('USERS_TABLE', 'PollutionApp-Users')
REPORTS_TABLE = os.environ.get('REPORTS_TABLE', 'PollutionApp-Reports')
ALERTS_TABLE = os.environ.get('ALERTS_TABLE', 'PollutionApp-HealthAlerts')
MEDIA_BUCKET = os.environ.get('MEDIA_BUCKET', 'pollution-app-media-uploads')

users_table = dynamodb.Table(USERS_TABLE)
reports_table = dynamodb.Table(REPORTS_TABLE)
alerts_table = dynamodb.Table(ALERTS_TABLE)

def lambda_handler(event, context):
    """
    Main handler for Agora voice health advisory
    
    Endpoints:
    1. POST /health/voice-session - Start Agora voice health consultation
    2. POST /health/generate-advice - Generate and speak health advice
    3. POST /health/emergency-alert - Emergency pollution alert via voice
    
    Flow:
    User → Agora Voice Channel → Lambda → Bedrock (generate tips) → 
    AWS Polly (text-to-speech) → Agora Cloud Player → User hears tips
    """
    
    try:
        http_method = event.get('httpMethod', 'POST')
        path = event.get('path', '')
        
        if '/health/voice-session' in path:
            # Start Agora voice consultation
            body = json.loads(event.get('body', '{}'))
            return start_voice_health_session(body)
        
        elif '/health/generate-advice' in path:
            # Generate and speak health advice
            body = json.loads(event.get('body', '{}'))
            return generate_and_speak_advice(body)
        
        elif '/health/emergency-alert' in path:
            # Emergency voice alert
            body = json.loads(event.get('body', '{}'))
            return send_emergency_voice_alert(body)
        
        else:
            return error_response(404, 'Endpoint not found')
    
    except Exception as e:
        print(f"Error: {e}")
        return error_response(500, str(e))


def start_voice_health_session(data):
    """
    Start Agora voice session for health consultation
    
    Input:
    {
        "userId": "user-123",
        "location": {
            "latitude": 14.5995,
            "longitude": 120.9842,
            "barangay": "San Jose"
        },
        "triggerReason": "high_pollution" | "user_request" | "emergency"
    }
    
    Returns Agora token and starts voice assistant
    """
    try:
        user_id = data.get('userId')
        location = data.get('location', {})
        trigger_reason = data.get('triggerReason', 'user_request')
        
        if not user_id:
            return error_response(400, 'userId is required')
        
        print(f"Starting voice health session for user {user_id}")
        
        # Get user profile with health conditions
        user_profile = get_user_profile(user_id)
        
        if not user_profile:
            return error_response(404, 'User not found')
        
        # Generate Agora token
        agora_credentials = generate_agora_token_for_health(user_id)
        
        # Get nearby pollution data
        nearby_pollution = get_nearby_pollution(location)
        
        # Generate initial health advice using Bedrock
        health_advice = generate_health_advice_bedrock(
            user_profile,
            location,
            nearby_pollution,
            trigger_reason
        )
        
        # Convert text to speech using AWS Polly
        audio_url = text_to_speech_polly(
            health_advice['spokenText'],
            user_id,
            'initial_advice'
        )
        
        # Store health alert
        alert_id = store_health_alert(
            user_id,
            health_advice,
            location,
            'voice_session',
            agora_credentials['channelName']
        )
        
        # Start Agora Cloud Player to speak advice
        agora_playback_info = start_agora_cloud_player(
            agora_credentials['channelName'],
            audio_url
        )
        
        log_metric('VoiceHealthSessionStarted', 1)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'data': {
                    'alertId': alert_id,
                    'agoraToken': agora_credentials['token'],
                    'agoraAppId': agora_credentials['appId'],
                    'channelName': agora_credentials['channelName'],
                    'healthAdvice': health_advice,
                    'audioUrl': audio_url,
                    'playbackInfo': agora_playback_info,
                    'nearbyPollution': nearby_pollution
                }
            })
        }
        
    except Exception as e:
        print(f"Voice session error: {e}")
        return error_response(500, str(e))


def generate_and_speak_advice(data):
    """
    Generate health advice and speak it via Agora during active call
    Used for real-time updates during ongoing voice session
    
    Input:
    {
        "userId": "user-123",
        "channelName": "health-channel-123",
        "location": {...},
        "query": "What should I do about the smoke?"
    }
    """
    try:
        user_id = data.get('userId')
        channel_name = data.get('channelName')
        location = data.get('location', {})
        user_query = data.get('query', '')
        
        if not all([user_id, channel_name]):
            return error_response(400, 'userId and channelName required')
        
        # Get user profile
        user_profile = get_user_profile(user_id)
        
        # Get nearby pollution
        nearby_pollution = get_nearby_pollution(location)
        
        # Generate contextual response using Bedrock
        response_text = generate_contextual_response(
            user_profile,
            location,
            nearby_pollution,
            user_query
        )
        
        # Convert to speech
        audio_url = text_to_speech_polly(
            response_text,
            user_id,
            f'response_{int(time.time())}'
        )
        
        # Play in Agora channel
        playback_info = start_agora_cloud_player(
            channel_name,
            audio_url
        )
        
        log_metric('VoiceAdviceGenerated', 1)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'data': {
                    'spokenText': response_text,
                    'audioUrl': audio_url,
                    'playbackInfo': playback_info
                }
            })
        }
        
    except Exception as e:
        print(f"Generate advice error: {e}")
        return error_response(500, str(e))


def send_emergency_voice_alert(data):
    """
    Send emergency voice alert to user via Agora
    Used when critical pollution detected near user's location
    
    Input:
    {
        "userId": "user-123",
        "location": {...},
        "pollutionReport": {
            "type": "gas_emission",
            "severity": "critical",
            "distance_km": 0.3
        }
    }
    """
    try:
        user_id = data.get('userId')
        location = data.get('location', {})
        pollution_report = data.get('pollutionReport', {})
        
        if not user_id:
            return error_response(400, 'userId required')
        
        # Get user profile
        user_profile = get_user_profile(user_id)
        
        # Generate emergency message
        emergency_message = generate_emergency_message(
            user_profile,
            location,
            pollution_report
        )
        
        # Convert to speech with urgent tone
        audio_url = text_to_speech_polly(
            emergency_message,
            user_id,
            'emergency_alert',
            voice_id='Joanna',
            engine='neural',
            # Use SSML for emphasis
            use_ssml=True
        )
        
        # Create Agora channel for alert
        agora_credentials = generate_agora_token_for_health(user_id)
        
        # Start playback
        playback_info = start_agora_cloud_player(
            agora_credentials['channelName'],
            audio_url
        )
        
        # Store emergency alert
        store_health_alert(
            user_id,
            {'spokenText': emergency_message, 'severity': 'critical'},
            location,
            'emergency_alert',
            agora_credentials['channelName']
        )
        
        log_metric('EmergencyVoiceAlertSent', 1)
        
        # TODO: Also send push notification to ensure user gets alert
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'data': {
                    'message': emergency_message,
                    'audioUrl': audio_url,
                    'channelName': agora_credentials['channelName'],
                    'agoraToken': agora_credentials['token']
                }
            })
        }
        
    except Exception as e:
        print(f"Emergency alert error: {e}")
        return error_response(500, str(e))


def generate_health_advice_bedrock(user_profile, location, nearby_pollution, trigger_reason):
    """
    Generate health advice using Bedrock Claude
    Optimized for VOICE delivery - conversational and clear
    """
    try:
        # Extract user info
        name = user_profile.get('name', 'User').split()[0]  # First name only
        health_conditions = user_profile.get('healthConditions', [])
        barangay = location.get('barangay', 'your area')
        
        # Build context
        conditions_str = ', '.join(health_conditions) if health_conditions else 'no specific health conditions'
        
        pollution_context = ""
        if nearby_pollution:
            critical = sum(1 for p in nearby_pollution if p.get('severity') == 'critical')
            high = sum(1 for p in nearby_pollution if p.get('severity') == 'high')
            pollution_context = f"{critical} critical and {high} high severity pollution reports nearby. "
        
        urgency = "URGENT" if trigger_reason == 'emergency' else "IMPORTANT" if any(
            p.get('severity') in ['critical', 'high'] for p in nearby_pollution
        ) else "ADVISORY"
        
        # Prompt for voice-optimized advice
        prompt = f"""You are a voice health assistant speaking to {name} via Agora voice call about pollution in {barangay}.

CONTEXT:
- User has: {conditions_str}
- Nearby pollution: {pollution_context}
- Urgency level: {urgency}

Generate health advice that will be SPOKEN to the user. Requirements:

1. Start with greeting: "Hello {name},"
2. State the situation clearly and urgently if needed
3. Give 3-4 SHORT, ACTIONABLE steps (each under 20 words)
4. End with reassurance or warning
5. Use conversational tone - this will be SPOKEN, not read
6. Total length: 150-200 words maximum
7. Use simple language, avoid medical jargon

Format for voice:
- Short sentences
- Clear pauses (use periods)
- Emphasize key words naturally
- Sound calm but urgent if critical

Generate the health advisory now:"""

        # Get Bedrock model
        model_id = get_config_value(
            'BEDROCK_MODEL_ID',
            '/pollution-app/bedrock/model-id',
            'anthropic.claude-v2'
        )
        
        # Call Bedrock
        response = bedrock.invoke_model(
            modelId=model_id,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 500,
                'temperature': 0.7,
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            })
        )
        
        response_body = json.loads(response['body'].read())
        spoken_text = response_body['content'][0]['text'].strip()
        
        # Determine severity
        severity = 'critical' if trigger_reason == 'emergency' else determine_severity(nearby_pollution)
        
        log_metric('BedrockHealthAdviceGenerated', 1)
        
        return {
            'spokenText': spoken_text,
            'severity': severity,
            'generatedBy': 'bedrock',
            'deliveryMethod': 'agora_voice',
            'generatedAt': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Bedrock error: {e}")
        return get_fallback_voice_advice(user_profile.get('name', 'User'), nearby_pollution)


def generate_contextual_response(user_profile, location, nearby_pollution, user_query):
    """
    Generate contextual response to user's question during voice call
    """
    try:
        name = user_profile.get('name', 'User').split()[0]
        health_conditions = user_profile.get('healthConditions', [])
        
        prompt = f"""You are a voice health assistant in an active Agora call with {name}.

User's health conditions: {', '.join(health_conditions) if health_conditions else 'none'}

Their question: "{user_query}"

Nearby pollution: {len(nearby_pollution)} reports

Respond naturally in 30-50 words. Be conversational, helpful, and direct. This will be SPOKEN."""

        model_id = get_config_value('BEDROCK_MODEL_ID', '/pollution-app/bedrock/model-id', 'anthropic.claude-v2')
        
        response = bedrock.invoke_model(
            modelId=model_id,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 200,
                'temperature': 0.7,
                'messages': [{'role': 'user', 'content': prompt}]
            })
        )
        
        response_body = json.loads(response['body'].read())
        return response_body['content'][0]['text'].strip()
        
    except Exception as e:
        print(f"Contextual response error: {e}")
        return f"I understand your concern about {user_query}. Stay indoors and monitor the situation. I'll keep you updated."


def generate_emergency_message(user_profile, location, pollution_report):
    """Generate urgent emergency message"""
    name = user_profile.get('name', 'User').split()[0]
    pollution_type = pollution_report.get('type', 'pollution')
    distance = pollution_report.get('distance_km', 0)
    
    message = f"""<speak>
<prosody rate="medium" pitch="medium">
<emphasis level="strong">URGENT ALERT</emphasis> for {name}.
</prosody>

<break time="300ms"/>

<prosody rate="slow">
Critical {pollution_type} detected <emphasis level="strong">{distance} kilometers</emphasis> from your location.
</prosody>

<break time="500ms"/>

Take <emphasis level="strong">immediate action</emphasis>:

<break time="300ms"/>

Move indoors NOW.

<break time="200ms"/>

Close all windows and doors.

<break time="200ms"/>

Stay inside until you receive the all-clear notification.

<break time="500ms"/>

Your safety is our priority. We'll monitor the situation and keep you updated.
</speak>"""
    
    return message


def text_to_speech_polly(text, user_id, audio_id, voice_id='Joanna', engine='standard', use_ssml=False):
    """
    Convert text to speech using AWS Polly
    Upload to S3 and return URL for Agora playback
    
    Args:
        text: Text to convert
        user_id: User ID
        audio_id: Unique audio identifier
        voice_id: Polly voice (Joanna, Matthew, etc.)
        engine: standard or neural
        use_ssml: Whether text contains SSML markup
    """
    try:
        # Call Polly
        polly_params = {
            'Text': text,
            'OutputFormat': 'mp3',
            'VoiceId': voice_id,
            'Engine': engine
        }
        
        if use_ssml:
            polly_params['TextType'] = 'ssml'
        
        response = polly.synthesize_speech(**polly_params)
        
        # Read audio stream
        audio_stream = response['AudioStream'].read()
        
        # Upload to S3
        s3_key = f"health-audio/{user_id}/{audio_id}_{int(time.time())}.mp3"
        
        s3.put_object(
            Bucket=MEDIA_BUCKET,
            Key=s3_key,
            Body=audio_stream,
            ContentType='audio/mpeg',
            ACL='public-read'  # Make publicly accessible for Agora
        )
        
        # Generate public URL
        audio_url = f"https://{MEDIA_BUCKET}.s3.amazonaws.com/{s3_key}"
        
        log_metric('PollyTTSGenerated', 1)
        print(f"Generated audio: {audio_url}")
        
        return audio_url
        
    except Exception as e:
        print(f"Polly TTS error: {e}")
        raise


def start_agora_cloud_player(channel_name, audio_url):
    """
    Start Agora Cloud Player to play audio in channel
    This makes the health advice "speak" in the Agora voice call
    
    Uses Agora RESTful API to inject audio into channel
    """
    try:
        # Get Agora credentials
        app_id = get_config_value('AGORA_APP_ID', '/pollution-app/agora/app-id')
        
        # Agora RESTful API endpoint for Cloud Player
        # Note: This is simplified - actual implementation needs Agora API credentials
        
        # In production, you would:
        # 1. Use Agora Cloud Recording API
        # 2. Start a "player" bot that joins channel
        # 3. Bot plays the audio file
        
        # For now, return the audio URL for client-side playback
        playback_info = {
            'method': 'client_playback',  # Client will play audio
            'audioUrl': audio_url,
            'channelName': channel_name,
            'instruction': 'Client should play audio in Agora channel'
        }
        
        # TODO: Implement Agora Cloud Player API integration
        # See: https://docs.agora.io/en/cloud-recording/develop/rest-api
        
        log_metric('AgoraCloudPlayerStarted', 1)
        
        return playback_info
        
    except Exception as e:
        print(f"Agora Cloud Player error: {e}")
        return {
            'method': 'fallback',
            'audioUrl': audio_url,
            'error': str(e)
        }


def generate_agora_token_for_health(user_id):
    """Generate Agora token for health consultation channel"""
    app_id = get_config_value('AGORA_APP_ID', '/pollution-app/agora/app-id')
    app_certificate = get_config_value('AGORA_APP_CERTIFICATE', '/pollution-app/agora/certificate')
    
    channel_name = f"health-{user_id}-{int(time.time())}"
    expiration_time = int(time.time()) + 3600  # 1 hour
    
    # Build token (simplified - use Agora SDK in production)
    token_string = f"{app_id}:{channel_name}:{user_id}:publisher:{expiration_time}"
    token = hashlib.sha256(token_string.encode()).hexdigest()
    
    return {
        'token': token,
        'appId': app_id,
        'channelName': channel_name,
        'expiresAt': expiration_time
    }


def get_user_profile(user_id):
    """Get user profile from DynamoDB"""
    try:
        response = users_table.get_item(Key={'userId': user_id})
        return response.get('Item')
    except:
        return None


def get_nearby_pollution(location, radius_km=5):
    """Get nearby pollution reports"""
    try:
        if not location or 'latitude' not in location:
            return []
        
        response = reports_table.scan(Limit=100)
        reports = response.get('Items', [])
        
        nearby = []
        user_lat = float(location.get('latitude', 0))
        user_lng = float(location.get('longitude', 0))
        
        for report in reports:
            report_location = report.get('location', {})
            report_lat = float(report_location.get('latitude', 0))
            report_lng = float(report_location.get('longitude', 0))
            
            # Simple distance calculation
            distance = ((user_lat - report_lat) ** 2 + (user_lng - report_lng) ** 2) ** 0.5
            distance_km = distance * 111
            
            if distance_km <= radius_km:
                nearby.append({
                    'type': report.get('pollutionType'),
                    'severity': report.get('severity'),
                    'distance_km': round(distance_km, 2)
                })
        
        return sorted(nearby, key=lambda x: x['distance_km'])
        
    except Exception as e:
        print(f"Error getting nearby pollution: {e}")
        return []


def store_health_alert(user_id, advice, location, alert_type, channel_name):
    """Store health alert in DynamoDB"""
    import uuid
    
    alert_id = str(uuid.uuid4())
    
    try:
        alerts_table.put_item(Item={
            'alertId': alert_id,
            'userId': user_id,
            'advice': advice,
            'location': location,
            'alertType': alert_type,
            'channelName': channel_name,
            'deliveryMethod': 'agora_voice',
            'createdAt': datetime.now().isoformat(),
            'isHeard': False,
            'expiresAt': int((datetime.now().timestamp() + 86400 * 7))
        })
        
        return alert_id
    except Exception as e:
        print(f"Failed to store alert: {e}")
        return None


def determine_severity(nearby_pollution):
    """Determine overall severity"""
    if not nearby_pollution:
        return 'low'
    
    critical = sum(1 for p in nearby_pollution if p.get('severity') == 'critical')
    high = sum(1 for p in nearby_pollution if p.get('severity') == 'high')
    
    if critical > 0:
        return 'critical'
    elif high > 0:
        return 'high'
    else:
        return 'medium'


def get_fallback_voice_advice(name, nearby_pollution):
    """Fallback advice if Bedrock fails"""
    first_name = name.split()[0] if name else 'User'
    
    if nearby_pollution and len(nearby_pollution) > 0:
        text = f"Hello {first_name}. There are pollution reports in your area. Please stay indoors, close your windows, and monitor air quality. Stay safe."
    else:
        text = f"Hello {first_name}. Air quality appears normal in your area. Continue to monitor for any changes."
    
    return {
        'spokenText': text,
        'severity': 'medium',
        'generatedBy': 'fallback',
        'deliveryMethod': 'agora_voice'
    }


def get_config_value(key, ssm_path, default=None):
    """Get config value"""
    if config:
        return config.get(key, ssm_path)
    return os.environ.get(key, default)


def log_metric(metric_name, value):
    """Log CloudWatch metric"""
    try:
        cloudwatch.put_metric_data(
            Namespace='PollutionApp/VoiceHealth',
            MetricData=[{
                'MetricName': metric_name,
                'Value': value,
                'Unit': 'Count',
                'Timestamp': datetime.now()
            }]
        )
    except Exception as e:
        print(f"Metric logging failed: {e}")


def get_cors_headers():
    """CORS headers"""
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }


def error_response(status_code, message):
    """Error response"""
    return {
        'statusCode': status_code,
        'headers': get_cors_headers(),
        'body': json.dumps({
            'success': False,
            'error': message
        })
    }