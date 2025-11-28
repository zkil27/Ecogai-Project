import json
import boto3  # type: ignore
import os
import time
import hmac
import hashlib
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
    print("Config helper not available")
    config = None

# Initialize AWS services
dynamodb = boto3.resource('dynamodb')
bedrock = boto3.client('bedrock-runtime')
cloudwatch = boto3.client('cloudwatch')
lambda_client = boto3.client('lambda')

# Environment variables
REPORTS_TABLE = os.environ.get('REPORTS_TABLE', 'PollutionApp-Reports')
USERS_TABLE = os.environ.get('USERS_TABLE', 'PollutionApp-Users')

reports_table = dynamodb.Table(REPORTS_TABLE)
users_table = dynamodb.Table(USERS_TABLE)

def lambda_handler(event, context):
    """
    Main handler for Agora voice/video pollution reporting
    
    Endpoints:
    1. POST /agora/token - Generate Agora access token
    2. POST /agora/report - Process voice/video pollution report with location
    3. POST /agora/location-tips - Get real-time tips for a location
    
    Architecture Flow:
    User speaks → Agora captures → Send location → Lambda → Google Maps 
    → Get nearby pollution → Bedrock generates tips → Return to user
    """
    
    try:
        http_method = event.get('httpMethod', 'POST')
        path = event.get('path', '')
        
        if '/agora/token' in path:
            # Generate Agora token for voice/video session
            body = json.loads(event.get('body', '{}'))
            return generate_agora_token(body)
        
        elif '/agora/report' in path:
            # Process voice/video pollution report
            body = json.loads(event.get('body', '{}'))
            return process_agora_report(body)
        
        elif '/agora/location-tips' in path:
            # Get real-time tips for current location
            body = json.loads(event.get('body', '{}'))
            return get_location_tips(body)
        
        else:
            return error_response(404, 'Endpoint not found')
    
    except Exception as e:
        print(f"Error: {e}")
        return error_response(500, str(e))


def generate_agora_token(data):
    """
    Generate Agora RTC token for voice/video session
    
    Input:
    {
        "userId": "user-123",
        "channelName": "pollution-report-channel",
        "role": "publisher" or "subscriber"
    }
    
    Returns Agora token for joining voice/video channel
    """
    try:
        # Get Agora credentials
        app_id = get_config_value(
            'AGORA_APP_ID',
            '/pollution-app/agora/app-id'
        )
        
        app_certificate = get_config_value(
            'AGORA_APP_CERTIFICATE',
            '/pollution-app/agora/certificate'
        )
        
        user_id = data.get('userId')
        channel_name = data.get('channelName', f'pollution-{user_id}')
        role = data.get('role', 'publisher')  # publisher or subscriber
        
        if not user_id:
            return error_response(400, 'userId is required')
        
        # Generate token (valid for 24 hours)
        expiration_time = int(time.time()) + 86400
        
        # Agora token generation
        token = build_agora_token(
            app_id,
            app_certificate,
            channel_name,
            user_id,
            role,
            expiration_time
        )
        
        log_metric('AgoraTokenGenerated', 1)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'data': {
                    'token': token,
                    'appId': app_id,
                    'channelName': channel_name,
                    'userId': user_id,
                    'expiresAt': expiration_time
                }
            })
        }
        
    except Exception as e:
        print(f"Token generation error: {e}")
        return error_response(500, f'Failed to generate token: {str(e)}')


def process_agora_report(data):
    """
    Process pollution report from Agora voice/video call
    
    Input:
    {
        "userId": "user-123",
        "location": {
            "latitude": 14.5995,
            "longitude": 120.9842
        },
        "voiceTranscription": "Heavy smoke from factory on Main Street",
        "pollutionType": "gas_emission", (optional, can be detected from voice)
        "severity": "high", (optional, can be detected from voice)
        "agoraSessionId": "session-123",
        "recordingUrl": "s3://recordings/..."
    }
    """
    
    try:
        user_id = data.get('userId')
        location = data.get('location', {})
        voice_transcription = data.get('voiceTranscription', '')
        agora_session_id = data.get('agoraSessionId')
        recording_url = data.get('recordingUrl')
        
        if not user_id or not location:
            return error_response(400, 'userId and location are required')
        
        latitude = location.get('latitude')
        longitude = location.get('longitude')
        
        if not latitude or not longitude:
            return error_response(400, 'Valid GPS coordinates required')
        
        print(f"Processing Agora report from user {user_id} at ({latitude}, {longitude})")
        
        # Step 1: Reverse geocode location using Google Maps
        location_details = reverse_geocode_location(latitude, longitude)
        
        # Step 2: Analyze voice transcription to detect pollution type/severity
        pollution_analysis = analyze_voice_transcription(voice_transcription)
        
        # Step 3: Get nearby pollution data
        nearby_pollution = get_nearby_pollution_from_location(latitude, longitude)
        
        # Step 4: Generate real-time tips using Bedrock
        real_time_tips = generate_real_time_tips(
            user_id,
            location_details,
            pollution_analysis,
            nearby_pollution
        )
        
        # Step 5: Create pollution report
        report_id = create_pollution_report_from_agora(
            user_id,
            location_details,
            pollution_analysis,
            voice_transcription,
            agora_session_id,
            recording_url,
            real_time_tips
        )
        
        log_metric('AgoraReportProcessed', 1)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'data': {
                    'reportId': report_id,
                    'location': location_details,
                    'pollutionAnalysis': pollution_analysis,
                    'realTimeTips': real_time_tips,
                    'nearbyPollution': nearby_pollution
                }
            })
        }
        
    except Exception as e:
        print(f"Agora report processing error: {e}")
        return error_response(500, str(e))


def get_location_tips(data):
    """
    Get real-time pollution tips for current location
    Used during active Agora voice call to provide live updates
    
    Input:
    {
        "userId": "user-123",
        "latitude": 14.5995,
        "longitude": 120.9842
    }
    """
    
    try:
        user_id = data.get('userId')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if not all([user_id, latitude, longitude]):
            return error_response(400, 'userId, latitude, and longitude required')
        
        # Get location details from Google Maps
        location_details = reverse_geocode_location(latitude, longitude)
        
        # Get nearby pollution
        nearby_pollution = get_nearby_pollution_from_location(latitude, longitude)
        
        # Generate tips
        tips = generate_real_time_tips(
            user_id,
            location_details,
            None,
            nearby_pollution
        )
        
        log_metric('LocationTipsProvided', 1)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'data': {
                    'location': location_details,
                    'nearbyPollution': nearby_pollution,
                    'tips': tips
                }
            })
        }
        
    except Exception as e:
        print(f"Location tips error: {e}")
        return error_response(500, str(e))


def reverse_geocode_location(latitude, longitude):
    """
    Use Google Maps Geocoding API to get location details
    
    Returns:
    {
        "address": "123 Rizal Ave, Manila, Metro Manila",
        "barangay": "San Jose",
        "city": "Manila",
        "province": "Metro Manila",
        "country": "Philippines",
        "formattedAddress": "Full address string"
    }
    """
    try:
        # Get Google Maps API key
        google_maps_key = get_config_value(
            'GOOGLE_MAPS_API_KEY',
            '/pollution-app/google/maps-api-key'
        )
        
        # Call Google Maps Geocoding API
        url = f"https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            'latlng': f"{latitude},{longitude}",
            'key': google_maps_key,
            'language': 'en'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data['status'] != 'OK' or not data.get('results'):
            print(f"Google Maps API error: {data.get('status')}")
            return get_fallback_location(latitude, longitude)
        
        # Parse address components
        result = data['results'][0]
        address_components = result.get('address_components', [])
        
        location_details = {
            'latitude': latitude,
            'longitude': longitude,
            'formattedAddress': result.get('formatted_address', ''),
            'barangay': '',
            'city': '',
            'province': '',
            'country': '',
            'placeId': result.get('place_id', '')
        }
        
        # Extract components
        for component in address_components:
            types = component.get('types', [])
            
            if 'neighborhood' in types or 'sublocality' in types:
                location_details['barangay'] = component.get('long_name', '')
            elif 'locality' in types:
                location_details['city'] = component.get('long_name', '')
            elif 'administrative_area_level_1' in types:
                location_details['province'] = component.get('long_name', '')
            elif 'country' in types:
                location_details['country'] = component.get('long_name', '')
        
        log_metric('GoogleMapsGeocodeSuccess', 1)
        print(f"Geocoded location: {location_details['formattedAddress']}")
        
        return location_details
        
    except requests.exceptions.RequestException as e:
        print(f"Google Maps API error: {e}")
        log_metric('GoogleMapsGeocodeError', 1)
        return get_fallback_location(latitude, longitude)
    
    except Exception as e:
        print(f"Geocoding error: {e}")
        return get_fallback_location(latitude, longitude)


def get_nearby_pollution_from_location(latitude, longitude, radius_km=5):
    """
    Query nearby pollution reports from DynamoDB
    Uses simple distance calculation (in production, use geospatial index)
    
    Returns list of nearby pollution reports
    """
    try:
        # Scan reports (in production, use GSI with geohash for efficiency)
        response = reports_table.scan(Limit=100)
        reports = response.get('Items', [])
        
        nearby = []
        
        for report in reports:
            report_location = report.get('location', {})
            report_lat = float(report_location.get('latitude', 0))
            report_lng = float(report_location.get('longitude', 0))
            
            # Calculate distance using Haversine formula
            distance_km = calculate_distance(
                latitude, longitude,
                report_lat, report_lng
            )
            
            if distance_km <= radius_km:
                nearby.append({
                    'reportId': report.get('reportId'),
                    'type': report.get('pollutionType'),
                    'severity': report.get('severity'),
                    'distance_km': round(distance_km, 2),
                    'barangay': report_location.get('barangay', ''),
                    'description': report.get('description', '')[:100]
                })
        
        # Sort by distance
        nearby.sort(key=lambda x: x['distance_km'])
        
        print(f"Found {len(nearby)} nearby pollution reports")
        return nearby[:10]  # Return top 10 closest
        
    except Exception as e:
        print(f"Error getting nearby pollution: {e}")
        return []


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two points using Haversine formula
    Returns distance in kilometers
    """
    from math import radians, sin, cos, sqrt, atan2
    
    # Radius of Earth in kilometers
    R = 6371.0
    
    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)
    
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad
    
    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    distance = R * c
    return distance


def analyze_voice_transcription(transcription):
    """
    Analyze voice transcription to detect pollution type and severity
    Uses Bedrock to understand natural language
    
    Returns:
    {
        "pollutionType": "gas_emission",
        "severity": "high",
        "keywords": ["smoke", "factory", "heavy"],
        "confidence": 0.85
    }
    """
    if not transcription:
        return {
            'pollutionType': 'unknown',
            'severity': 'medium',
            'keywords': [],
            'confidence': 0.0
        }
    
    try:
        # Get Bedrock model ID
        model_id = get_config_value(
            'BEDROCK_MODEL_ID',
            '/pollution-app/bedrock/model-id',
            'anthropic.claude-v2'
        )
        
        # Prompt for Claude to analyze transcription
        prompt = f"""Analyze this pollution report and extract key information:

"{transcription}"

Return ONLY a JSON object with this exact format:
{{
    "pollutionType": "gas_emission|air_quality|waste|water_pollution|fire|noise|other",
    "severity": "low|medium|high|critical",
    "keywords": ["keyword1", "keyword2"],
    "confidence": 0.0-1.0
}}

Rules:
- Choose the most appropriate pollutionType
- Assess severity based on description
- Extract 3-5 relevant keywords
- Confidence: how certain you are (0.0 to 1.0)

JSON only, no explanation:"""

        # Call Bedrock
        response = bedrock.invoke_model(
            modelId=model_id,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 300,
                'temperature': 0.3,
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            })
        )
        
        response_body = json.loads(response['body'].read())
        analysis_text = response_body['content'][0]['text'].strip()
        
        # Parse JSON response
        # Remove markdown code blocks if present
        analysis_text = analysis_text.replace('```json', '').replace('```', '').strip()
        analysis = json.loads(analysis_text)
        
        log_metric('VoiceAnalysisSuccess', 1)
        return analysis
        
    except Exception as e:
        print(f"Voice analysis error: {e}")
        log_metric('VoiceAnalysisError', 1)
        
        # Fallback: simple keyword matching
        return simple_keyword_analysis(transcription)


def simple_keyword_analysis(text):
    """Fallback analysis using keyword matching"""
    text_lower = text.lower()
    
    # Pollution type keywords
    if any(word in text_lower for word in ['smoke', 'gas', 'fumes', 'emission']):
        pollution_type = 'gas_emission'
    elif any(word in text_lower for word in ['trash', 'garbage', 'waste', 'dump']):
        pollution_type = 'waste'
    elif any(word in text_lower for word in ['water', 'river', 'sewage']):
        pollution_type = 'water_pollution'
    elif any(word in text_lower for word in ['fire', 'burning', 'flame']):
        pollution_type = 'fire'
    else:
        pollution_type = 'air_quality'
    
    # Severity keywords
    if any(word in text_lower for word in ['severe', 'critical', 'heavy', 'dangerous']):
        severity = 'high'
    elif any(word in text_lower for word in ['moderate', 'some', 'noticeable']):
        severity = 'medium'
    else:
        severity = 'low'
    
    return {
        'pollutionType': pollution_type,
        'severity': severity,
        'keywords': text_lower.split()[:5],
        'confidence': 0.6
    }


def generate_real_time_tips(user_id, location_details, pollution_analysis, nearby_pollution):
    """
    Generate real-time pollution tips using Bedrock
    Optimized for voice delivery (short, actionable)
    
    Returns tips that can be spoken by Agora voice assistant
    """
    try:
        # Get user health conditions
        user_profile = get_user_profile(user_id)
        health_conditions = user_profile.get('healthConditions', []) if user_profile else []
        
        # Build context for Bedrock
        location_name = location_details.get('barangay') or location_details.get('city') or 'your location'
        
        nearby_desc = ""
        if nearby_pollution:
            nearby_desc = f"\nNearby pollution reports ({len(nearby_pollution)}):\n"
            for p in nearby_pollution[:3]:
                nearby_desc += f"- {p['type']} ({p['severity']}) at {p['distance_km']} km\n"
        
        current_pollution = ""
        if pollution_analysis:
            current_pollution = f"\nCurrent report: {pollution_analysis.get('pollutionType')} ({pollution_analysis.get('severity')} severity)"
        
        health_context = ""
        if health_conditions:
            health_context = f"\nUser has: {', '.join(health_conditions)}"
        
        # Prompt for voice-optimized tips
        prompt = f"""You are a voice assistant providing real-time pollution tips via Agora voice call.

Location: {location_name}
{current_pollution}
{nearby_desc}
{health_context}

Generate SHORT, ACTIONABLE tips for voice delivery. Format:

1. IMMEDIATE STATUS (1 sentence - is it safe or dangerous?)
2. QUICK ACTIONS (3-4 bullet points, each under 15 words)
3. KEY WARNING (1 sentence if needed)

Keep it conversational and urgent where needed. This will be SPOKEN to the user.

Example:
"Your area has moderate air pollution. Here's what to do:
- Close windows if you're indoors
- Wear a mask if going outside
- Avoid heavy exercise for the next few hours
Stay safe!"

Now generate tips for the current situation:"""

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
                'max_tokens': 400,
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
        tips_text = response_body['content'][0]['text'].strip()
        
        log_metric('RealTimeTipsGenerated', 1)
        
        return {
            'spokenText': tips_text,
            'severity': determine_overall_severity(pollution_analysis, nearby_pollution),
            'actionable': True,
            'generatedAt': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Tips generation error: {e}")
        return get_fallback_tips(location_details, nearby_pollution)


def determine_overall_severity(current_analysis, nearby_pollution):
    """Determine overall severity level"""
    if current_analysis and current_analysis.get('severity') in ['high', 'critical']:
        return 'high'
    
    if nearby_pollution:
        high_severity_count = sum(
            1 for p in nearby_pollution 
            if p.get('severity') in ['high', 'critical'] and p.get('distance_km', 999) < 2
        )
        if high_severity_count > 0:
            return 'high'
    
    return 'medium'


def get_fallback_tips(location_details, nearby_pollution):
    """Fallback tips if Bedrock fails"""
    location_name = location_details.get('barangay') or 'your area'
    
    if nearby_pollution and len(nearby_pollution) > 0:
        tips = f"There are {len(nearby_pollution)} pollution reports near {location_name}. Stay indoors if possible and monitor the air quality."
    else:
        tips = f"Air quality in {location_name} appears normal. Continue monitoring for any changes."
    
    return {
        'spokenText': tips,
        'severity': 'medium',
        'actionable': True,
        'generatedAt': datetime.now().isoformat()
    }


def create_pollution_report_from_agora(user_id, location_details, pollution_analysis, 
                                       voice_transcription, agora_session_id, 
                                       recording_url, tips):
    """Create pollution report from Agora voice/video session"""
    import uuid
    
    report_id = str(uuid.uuid4())
    timestamp = int(datetime.now().timestamp() * 1000)
    
    try:
        report = {
            'reportId': report_id,
            'timestamp': timestamp,
            'userId': user_id,
            'location': {
                'latitude': Decimal(str(location_details['latitude'])),
                'longitude': Decimal(str(location_details['longitude'])),
                'address': location_details.get('formattedAddress', ''),
                'barangay': location_details.get('barangay', ''),
                'city': location_details.get('city', ''),
                'province': location_details.get('province', '')
            },
            'pollutionType': pollution_analysis.get('pollutionType', 'unknown'),
            'severity': pollution_analysis.get('severity', 'medium'),
            'description': voice_transcription,
            'status': 'verified',
            'isVerified': True,
            'source': 'agora_voice',
            'agoraSessionId': agora_session_id or '',
            'recordingUrl': recording_url or '',
            'voiceAnalysis': pollution_analysis,
            'realTimeTips': tips,
            'createdAt': datetime.now().isoformat()
        }
        
        reports_table.put_item(Item=report)
        log_metric('AgoraReportCreated', 1)
        
        print(f"Created Agora report: {report_id}")
        return report_id
        
    except Exception as e:
        print(f"Error creating report: {e}")
        raise


def build_agora_token(app_id, app_certificate, channel_name, uid, role, expiration_time):
    """
    Build Agora RTC token
    Simplified version - in production, use Agora's official SDK
    """
    # This is a simplified placeholder
    # In production, use: pip install agora-token-builder
    # from agora_token_builder import RtcTokenBuilder
    
    # For now, return a mock token
    # You'll need to implement actual Agora token generation
    token_string = f"{app_id}:{channel_name}:{uid}:{role}:{expiration_time}"
    token = hashlib.sha256(token_string.encode()).hexdigest()
    
    return token


def get_user_profile(user_id):
    """Get user profile from DynamoDB"""
    try:
        response = users_table.get_item(Key={'userId': user_id})
        return response.get('Item')
    except:
        return None


def get_fallback_location(latitude, longitude):
    """Fallback location if Google Maps fails"""
    return {
        'latitude': latitude,
        'longitude': longitude,
        'formattedAddress': f"{latitude}, {longitude}",
        'barangay': 'Unknown',
        'city': 'Unknown',
        'province': 'Unknown',
        'country': 'Philippines'
    }


def get_config_value(key, ssm_path, default=None):
    """Get configuration value"""
    if config:
        return config.get(key, ssm_path)
    return os.environ.get(key, default)


def log_metric(metric_name, value):
    """Log custom metric to CloudWatch"""
    try:
        cloudwatch.put_metric_data(
            Namespace='PollutionApp/Agora',
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
        print(f"Failed to log metric: {e}")


def get_cors_headers():
    """CORS headers"""
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }


def error_response(status_code, message):
    """Error response helper"""
    return {
        'statusCode': status_code,
        'headers': get_cors_headers(),
        'body': json.dumps({
            'success': False,
            'error': message
        })
    }