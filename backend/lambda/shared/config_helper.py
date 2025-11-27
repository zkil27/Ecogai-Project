import os
from urllib import response
import boto3  # type: ignore
from botocore.exceptions import ClientError  # type: ignore

# Initialize SSM client for configuration management
class ConfigHelper:

    def __init__(self):
        self.ssm_client = boto3.client('ssm')
        self.cache = {} # Cache to avoid repeated API calls

    def get(self, key, ssm_path=None, required=True):

        # First, check environment variables (for local devvelop)
        value = os.environ.get(key)
        if value:
            return value
        
        # Check cache
        if key in self.cache:
            return self.cache[key]
        
        # Fetch from AWS Parameter Store
        if ssm_path:

            try:
                response = self.ssm_client.get_parameter(
                    Name=ssm_path,
                    WithDecryption=True # Decrypt secure strings
                )
                self.cache[key] = response['Parameter'] ['Value']
                return self.cache[key]
            
            except ClientError as e:
                print(f"Failed to retrieve {key} from SSM: {e}")
                if required:
                    raise ValueError(f"Configuration {key} not found")
                return None
        
        if required:
            raise ValueError(f"Configuration {key} not found in environment or SSM")
       
        return None
    
    def get_multiple(self, configs):

        results = {}

        for config in configs:
            key = config['key']
            ssm_path = config.get('ssm_path')
            required = config.get('required', True)
            results[key] = self.get(key, ssm_path, required)

        return results

# Global instance for easy import
config = ConfigHelper()

# Example usage in lambda functions:
def get_app_config():
    
    return config.get_multiple([
        {
            'key': 'BEDROCK_MODEL_ID',
            'ssm_path': '/pollution-app/bedrock/model-id',
            'required': True
        },

        {
            'key': 'SAGEMAKER_ENDPOINT_NAME',
            'ssm_path': '/pollution-app/sagemaker/endpoint',
            'required': True
        },

        {
            'key': 'AGORA_APP_ID',
            'ssm_path': '/pollution-app/agora/app-id',
            'required': True
        },

        {
            'key': 'AGORA_APP_CERTIFICATE',
            'ssm_path': '/pollution-app/agora/certificate',
            'required': True
        },

        {
            'key': 'GOOGLE_MAPS_API_KEY',
            'ssm_path': '/pollution-app/google/maps-api-key',
            'required': True
        },

        {
            'key': 'AWS_REGION',
            'ssmn_path': None,
            'required': True
        }
    ])