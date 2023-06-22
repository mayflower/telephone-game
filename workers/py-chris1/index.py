import os
import logging
import json
import boto3

from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all


logger = logging.getLogger()
logger.setLevel(logging.INFO)

patch_all()

def change_order(inputstr):
    out = []
    for index in range(len(inputstr),0,-1):
        out.append(inputstr[index])
    return out



def lambda_handler(event, context):
    # Retrieve the message payload
    message_body = event['Records'][0]['body']

    
    # Print the message payload to CloudWatch Logs
    print(f"Received message: {message_body}")
    
    message_body = change_order(message_body)
    message_body.replace(" ","-")
    message_body += " .this message was not generated by an ai "
    message_body += ""

    # Process the message payload
    # ...
    client = boto3.client('sqs')
    queue_url = os.environ["QUEUE_URL"]
    response = client.send_message(QueueUrl=queue_url, MessageBody=message_body)
                                  
    return {
        'statusCode': 200,
        'body': json.dumps(response)
    }
