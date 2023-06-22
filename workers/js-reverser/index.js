const { SQSClient, SendMessageCommand, SendMessageRequest} = require( '@aws-sdk/client-sqs')

const client = new SQSClient({region: "eu-central-1"});

exports.main = async function(event, context) {

  const oldMessageBody = event.Records[0].body
  console.log(event);
  /** @type string */
  const message = "🤖 " + oldMessageBody.split(" ").map(elem => elem.split("").reverse().join("")) + " 🚀"
  /** @type SendMessageRequest */
  const params = {
    DelaySeconds: 2,
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: message
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
