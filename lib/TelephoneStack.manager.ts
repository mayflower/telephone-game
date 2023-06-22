import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  SQSRecord,
  SQSEvent,
} from "aws-lambda";
import {
  SQSClient,
  SendMessageRequest,
  SendMessageCommand,
  SendMessageBatchCommandInput,
  MessageSystemAttributeNameForSends,
  MessageSystemAttributeValue,
  SendMessageCommandInput,
} from "@aws-sdk/client-sqs";

import { PutItemCommand, GetItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Tracer } from "@aws-lambda-powertools/tracer";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
const tracer = new Tracer({ serviceName: "TelephoneGame" });


const sqsClient = tracer.captureAWSv3Client(
  new SQSClient({ region: "eu-central-1" })
);
const dynoClient = tracer.captureAWSv3Client(new DynamoDBClient({
  region: "eu-central-1"
}))
const docClient = DynamoDBDocumentClient.from(dynoClient)
const tableName = process.env.TABLE_NAME

export const handler = async (event: SQSEvent): Promise<any> => {
  console.log(event);
  const message = event.Records[0]?.body;
  
  const traceId = tracer.getRootXrayTraceId() ?? "unknown trace";
  const shortId = traceId.substring(0,9)

  const get = new GetCommand({
    TableName: tableName,
    Key: {
      traceId: shortId
    },
    AttributesToGet: [
      "messages", 'traceId'
    ]
  })

  const getResponse = await docClient.send(get)

  console.log(getResponse);

  if (getResponse.Item) {
    let messages: [string] = getResponse.Item.messages
    messages.push(message)

    if (messages.length > 10) {
      return {
        statusCode: 200,
        body: `reached 10 messages ${JSON.stringify(messages)}`,
      };
    }
    const command = new PutCommand({
      TableName: tableName,
      Item: {
        traceId: shortId,
        messages: messages
      }
    })
  
    const response = await docClient.send(command);
    console.log(response);
  } else {
    const messages = [message]
    const put = new PutCommand({
      TableName: tableName,
      Item: {
        traceId: shortId,
        messages: messages
      }
    })

    const response = await docClient.send(put)
    console.log(response);
    
  }
  if (message.length < 20) {
    console.log("sending message to queue: " + message);
    const input: SendMessageCommandInput = {
      MessageBody: message,
      QueueUrl: process.env.QUEUE_URL,
      DelaySeconds: 1
    };
    const result = await sqsClient.send(new SendMessageCommand(input));
    console.log(result);
    return {
      statusCode: 200,
      body: `sqs: ${JSON.stringify(result)} dynamo: ${getResponse}`,
    };
  }
};
