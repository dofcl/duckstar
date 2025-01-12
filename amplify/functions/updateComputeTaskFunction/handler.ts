import { defineFunction } from '@aws-amplify/backend';

interface UpdateTaskInput {
  taskId: string;
  status?: string;
  failed?: boolean;
  failedReason?: string;
  finished?: boolean;
  finishedAt?: string;
}

export const handler = async (event: any) => {  // Use any for Lambda URL event
  console.log('Raw event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    
    // Access the database through context instead of event
    const result = await event.data.ComputeTasks.update(requestBody.arguments);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    };
    
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Failed to update compute task',
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    };
  }
};