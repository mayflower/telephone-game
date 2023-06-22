import os
import logging
import json
import boto3
import openai

from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all


logger = logging.getLogger()
logger.setLevel(logging.INFO)

patch_all()

def lambda_handler(event, context):
    # Retrieve the message payload
    message_body = event['Records'][0]['body']
    openai.api_key = os.environ["OPENAI_API_KEY"]
    
    # Print the message payload to CloudWatch Logs
    print(f"Received message: {message_body}")
    prompt = "Formuliere den folgenden Satz im Stil von Goethe um: "

    question = prompt + message_body
    
    chat_completion = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=[{"role": "user", "content": question}])

    # Process the message payload
    # ...
    client = boto3.client('sqs')

    queue_url = os.environ["QUEUE_URL"]
    response = client.send_message(QueueUrl=queue_url, MessageBody=chat_completion.choices[0].message.content)

    return {
        'statusCode': 200,
        'body': json.dumps(response)
    }
