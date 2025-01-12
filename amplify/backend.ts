import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { updateComputeTaskFunction } from './functions/updateComputeTaskFunction/resource';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  storage,
  updateComputeTaskFunction
});

// Now you can access the Lambda resources
const functionUrl = backend.updateComputeTaskFunction.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE
});

backend.addOutput({
  custom: {
    updateComputeTaskFunction: {
      functionUrl: functionUrl.url
    }
  },
})
backend.updateComputeTaskFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:UpdateItem'],
    resources: ['*']
  })
);

export default backend;