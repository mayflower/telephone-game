import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSRecord } from 'aws-lambda';
import { SQSClient, SendMessageRequest, SendMessageCommand, MessageSystemAttributeNameForSends, MessageSystemAttributeValue } from "@aws-sdk/client-sqs";
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

export const handler = async (event: SQSRecord): Promise<string> => {

      const message = JSON.parse(event.body);
      if (message.count > 0) {
        return JSON.stringify({count: message.count -1, message: message.message})
      } else {
        throw new Error("Messages empty");
        
      }
    
};
