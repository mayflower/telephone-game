import * as cdk from 'aws-cdk-lib';
import { Handler, Tracing } from 'aws-cdk-lib/aws-lambda';
import { PythonFunction } from '@aws-cdk/aws-lambda-python'

import { Construct } from 'constructs';

import { readdirSync} from 'fs'
import * as path from 'path'

export class TelephoneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
          QUEUE_URL: workerQueue.queueUrl
        } 
      }
    )
    entryQueue.grantConsumeMessages(managerFunction)
    workerQueue.grantSendMessages(managerFunction)
    managerFunction.addEventSource(new cdk.aws_lambda_event_sources.SqsEventSource(entryQueue, {
      maxConcurrency: 2,
      batchSize: 1
    }))

    const workerDir = 'workers';

    for (const subdir in readdirSync(workerDir)) {
      const subpath = path.join(workerDir, subdir)
      const entry_file = path.join(subpath, 'index.js')
      var myFunc
      if (subdir.includes('py')) {
        myFunc = new cdk.aws_lambda.Function(this, subdir, {
          runtime: cdk.aws_lambda.Runtime.PYTHON_3_10,
          code: cdk.aws_lambda.Code.fromAsset(entry_file),
          handler: 'lambda_handler'
        })
      } else {
        myFunc = new cdk.aws_lambda_nodejs.NodejsFunction(this, subdir, {
          runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
          tracing: Tracing.ACTIVE,
          handler: 'example.main',
          entry: entry_file
        })
      }
      workerQueue.grantConsumeMessages(myFunc)
      entryQueue.grantSendMessages(myFunc)
      myFunc.addEventSource(new cdk.aws_lambda_event_sources.SqsEventSource(
        workerQueue, {
          maxConcurrency: 2, batchSize: 1
        }
      ))
    }

    const api = new cdk.aws_apigateway.RestApi(this, "telephone-game-api", {
      restApiName: 'Telephone game',
      description: "This api handles strings like the children game telephone",
      deployOptions: { tracingEnabled: true}
    })

    const entrypoint_integration = new cdk.aws_apigateway.LambdaIntegration(entryFunction)
    api.root.addMethod("GET", entrypoint_integration)
    api.root.addMethod("POST", entrypoint_integration)




  }
}
