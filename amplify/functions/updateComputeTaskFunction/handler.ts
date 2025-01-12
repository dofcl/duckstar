import { defineFunction } from '@aws-amplify/backend';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
const client = generateClient<Schema>();

interface LambdaFunctionUrlEvent {
  version: string;
  body: string;
  requestContext: {
    http: {
      method: string;
    };
  };
}

export const handler = async (event: LambdaFunctionUrlEvent) => {
  console.log('Raw event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse the request body
    const { arguments: args } = JSON.parse(event.body);
    
    const updateData: {
      id: any;
      status?: any;
      failed?: any;
      failedReason?: any;
      finished?: any;
      finishedAt?: string;
    } = {
      id: args.taskId,  // Note: using id instead of taskId based on your client code
      ...(args.status !== undefined && { status: args.status }),
      ...(args.failed !== undefined && { failed: args.failed }),
      ...(args.failedReason !== undefined && { failedReason: args.failedReason }),
      ...(args.finished !== undefined && { finished: args.finished })
    };

    // Add finishedAt if task is finished
    if (args.finished) {
      updateData.finishedAt = new Date().toISOString();
    }

    // Use the same update method as your client code
    // @ts-nocheck
    const response = await (client.models.ComputeTasks.update as (data: typeof updateData) => Promise<any>)(updateData);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data: response
      })
    };
    
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: 'Failed to update compute task',
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    };
  }
};