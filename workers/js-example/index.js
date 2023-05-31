import { SQSClient, SendMessageCommand, SendMessageRequest} from '@aws-sdk/client-sqs'


const client = new SQSClient({region: "eu-central-1"});

exports.main = async function(event, context) {
  console.log(event.body.message);
  /** @type SendMessageRequest */
  const params = {
    DelaySeconds: 2,
    QueueUrl: process.env.ENTRY_QUEUE,
    MessageBody: "Hallo Test"
  }
  try {
    const data = await client.send(new SendMessageCommand(params));
    if (data) {
      console.log("Sent message with id: ", data.MessageId);
      return {
        statusCode: 200,
        body: JSON.stringify(data.data.MessageId),
      };
    }

  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
        body: JSON.stringify('Some error occured !!' + error)
    }
  }
  return {
    statusCode: 500,
      body: JSON.stringify('Could not send message, error occured !!')
  }
}