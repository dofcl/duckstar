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
    // Parse and log the request body
    const body = JSON.parse(event.body);
    console.log('Parsed body:', JSON.stringify(body, null, 2));
    
    // Try to get a task
    const taskId = body.arguments.taskId;
    console.log('Attempting to get task with ID:', taskId);
    
  
    type ComputeTaskResponse = { id: string; /* add other fields as needed */ };
    type ComputeTaskData = { taskId: string; /* add other fields as needed */ };
    const response = await client.models.ComputeTasks.get({ id: taskId }).catch(err => {
      console.error('Error fetching task:', err);
      return { data: null };
    }) as { data: ComputeTaskData | null };
    const computeTaskResponse: ComputeTaskResponse = response.data ? {
      id: response.data.taskId,
      // map other fields as needed
    } : { id: '' }; // handle the case where data is null
    console.log('Get task response:', JSON.stringify(computeTaskResponse, null, 2));

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
        message: 'Failed to get compute task',
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    };
  }
};