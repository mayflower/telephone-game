import os
import logging
import json
import boto3

from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all


logger = logging.getLogger()
logger.setLevel(logging.INFO)

patch_all()

def lambda_handler(event, context):
    # Retrieve the message payload
    message_body = event['Records'][0]['body']
    
    # Print the message payload to CloudWatch Logs
    print(f"Received message: {message_body}")
    
    # Process the message payload
    # ...
    sqs = boto3.resource('sqs')
    sqs.getc

    return {
        'statusCode': 200,
        'body': json.dumps('Message processed successfully')
    }

# patch_all()

# client = boto3.client('lambda')
# client.get_account_settings()

# def lambda_handler(event, context):
#     logger.info('## ENVIRONMENT VARIABLES\r' + jsonpickle.encode(dict(**os.environ)))
#     logger.info('## EVENT\r' + jsonpickle.encode(event))
#     logger.info('## CONTEXT\r' + jsonpickle.encode(context))
#     response = client.get_account_settings()
#     return response['AccountUsage']
