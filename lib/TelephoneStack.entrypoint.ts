import { APIGatewayProxyEvent, APIGatewayProxyResult, Callback, Context } from 'aws-lambda';
import {SQSClient, SendMessageCommand, SendMessageCommandInput } from '@aws-sdk/client-sqs' 
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

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.httpMethod === "POST" ) {
        const message = event.body

        if (message) {
            console.log("sending message to queue: " + message)
             const input: SendMessageCommandInput = {
                MessageBody: JSON.stringify({message: message, count: 10}),
                QueueUrl: process.env.QUEUE_URL,
                DelaySeconds: 1
             }
             const result = await client.send(new SendMessageCommand(input))
             return {
                statusCode: 200,
                body: JSON.stringify(result)
             }
        }
    }
    throw new Error("Couldn't read message body");
};
