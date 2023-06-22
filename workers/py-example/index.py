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
    
    message_body += " handled"
    # Process the message payload
    # ...
    client = boto3.client('sqs')
    queue_url = os.environ["QUEUE_URL"]
    print(queue_url)
    response = client.send_message(QueueUrl=queue_url, MessageBody=message_body)
                                  
    return {
        'statusCode': 200,
        'body': json.dumps(response)
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
