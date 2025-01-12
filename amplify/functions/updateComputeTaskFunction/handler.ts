import { defineFunction } from '@aws-amplify/backend';

interface EventType {
  body: string;  // Lambda Function URL sends the body as a string
  data: {
    ComputeTasks: {
      update: (input: Record<string, any>) => Promise<any>;
    };
  };
}

export const handler = async (event: EventType) => {
  console.log('Raw event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse the body from the Lambda Function URL event
    const body = JSON.parse(event.body);
    const { taskId, status, failed, failedReason, finished, finishedAt } = body.arguments;

    const updateData = {
      taskId,
      ...(status !== undefined && { status }),
      ...(failed !== undefined && { failed }),
      ...(failedReason !== undefined && { failedReason }),
      ...(finished !== undefined && { finished }),
      ...(finished && finishedAt && { finishedAt })
    };

    const response = await event.data.ComputeTasks.update(updateData);
    return {
      statusCode: 200,
      body: JSON.stringify(response)
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to update compute task',
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    };
  }
};