import * as cdk from 'aws-cdk-lib';
import { Handler, Tracing } from 'aws-cdk-lib/aws-lambda';
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha'

import { Construct } from 'constructs';

import { readdirSync} from 'fs'
import * as path from 'path'
export class TelephoneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new cdk.aws_dynamodb.Table(this, "messages", {
      partitionKey: { name: 'traceId', type: cdk.aws_dynamodb.AttributeType.STRING},
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    const workerQueue = new cdk.aws_sqs.Queue(this, 'worker-queue')
    const entryQueue = new cdk.aws_sqs.Queue(this, 'entry-queue')

    const entryFunction = new cdk.aws_lambda_nodejs.NodejsFunction(
      this, 'entrypoint', {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        tracing: Tracing.ACTIVE,
        environment: {
          QUEUE_URL: entryQueue.queueUrl
        }
      }
    )
    entryQueue.grantSendMessages(entryFunction);

    const managerFunction = new cdk.aws_lambda_nodejs.NodejsFunction(
      this, 'manager', {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        tracing: Tracing.ACTIVE,
        environment:{
          QUEUE_URL: workerQueue.queueUrl,
          TABLE_NAME: table.tableName
        } 
      }
    )
    table.grantReadWriteData(managerFunction)
    entryQueue.grantConsumeMessages(managerFunction)
    workerQueue.grantSendMessages(managerFunction)
    managerFunction.addEventSource(new cdk.aws_lambda_event_sources.SqsEventSource(entryQueue, {
      maxConcurrency: 2,
      batchSize: 1
    }))

    const workerDir = 'workers';
    const subdirs = readdirSync(workerDir)
    subdirs.forEach(subdir => {
      const subpath = path.join(workerDir, subdir)
      var myFunc
      if (subdir.startsWith('d')) {
        return
      }
      if (subdir.includes('py')) {
        const entry_file = path.join(subpath, 'index.py')
        myFunc = new PythonFunction(this, subdir, {
          runtime: cdk.aws_lambda.Runtime.PYTHON_3_10,
          tracing: Tracing.ACTIVE,
          entry: subpath,
          handler: "lambda_handler",
          environment:{
            QUEUE_URL: entryQueue.queueUrl,
            OPENAI_API_KEY: process.env.OPENAI_API_KEY ??= "no key"
          } 
        })
      } else {
        const entry_file = path.join(subpath, 'index.js')
        myFunc = new cdk.aws_lambda_nodejs.NodejsFunction(this, subdir, {
          runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
          tracing: Tracing.ACTIVE,
          handler: 'index.main',
          entry: entry_file,
          environment:{
            QUEUE_URL: entryQueue.queueUrl
          } 
        })
      }
      workerQueue.grantConsumeMessages(myFunc)
      entryQueue.grantSendMessages(myFunc)
      myFunc.addEventSource(new cdk.aws_lambda_event_sources.SqsEventSource(
        workerQueue, {
          maxConcurrency: 2, batchSize: 1
        }
      ))
    });
  

    const api = new cdk.aws_apigateway.RestApi(this, "telephone-game-api", {
      restApiName: 'Telephone game',
      description: "This api handles strings like the children game telephone",
      deployOptions: { tracingEnabled: true}
    })

    const entrypoint_integration = new cdk.aws_apigateway.LambdaIntegration(entryFunction)
    api.root.addMethod("GET", entrypoint_integration)
    api.root.addMethod("POST", entrypoint_integration)

    // const zone = cdk.aws_route53.HostedZone.fromHostedZoneId(this, 'workshop-zone', 'Z08129792BHCO0BDI7RZR')
    // const domain = new cdk.aws_route53.ARecord(this, 'domain', {
    //   target: new cdk.aws_route53.RecordTarget.fromAlias(new cdk.aws_route53.t)
    // })
  }
}
