import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSRecord, SQSEvent } from 'aws-lambda';
import { SQSClient, SendMessageRequest, SendMessageCommand, SendMessageBatchCommandInput, MessageSystemAttributeNameForSends, MessageSystemAttributeValue } from "@aws-sdk/client-sqs";
import { Tracer } from '@aws-lambda-powertools/tracer';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
const tracer = new Tracer({serviceName: 'TelephoneGame'});

const client = tracer.captureAWSv3Client(new SQSClient({region: 'eu-central-1'}))

export const handler = async (event: SQSEvent): Promise<any> => {
  console.log(event)
  const message = JSON.parse(event.Records[0].body)
  if (message) {
      console.log("sending message to queue: " + message)
       const input = {
          MessageBody: JSON.stringify({message: message.message, count: message.count -1}),
          QueueUrl: process.env.QUEUE_URL,
          DelaySeconds: 1
       }
       const result = await client.send(new SendMessageCommand(input))
       console.log(result)
       return {
          statusCode: 200,
          body: JSON.stringify(result)
       }
      }
};
