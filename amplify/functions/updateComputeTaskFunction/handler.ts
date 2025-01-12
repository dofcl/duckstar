import { defineFunction } from '@aws-amplify/backend';

interface UpdateTaskInput {
  taskId: string;
  status?: string;
  failed?: boolean;
  failedReason?: string;
  finished?: boolean;
  finishedAt?: string;
}

export const handler = async (event: {
  version: string;
  body: string;
  [key: string]: any;
}) => {
  console.log('Raw event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse the request body - note that it comes as a JSON string
    const { arguments: args } = JSON.parse(event.body);
    
    // Get required fields
    const updateData: UpdateTaskInput = {
      taskId: args.taskId,
      ...(args.status !== undefined && { status: args.status }),
      ...(args.failed !== undefined && { failed: args.failed }),
      ...(args.failedReason !== undefined && { failedReason: args.failedReason }),
      ...(args.finished !== undefined && { finished: args.finished }),
      ...(args.finishedAt !== undefined && { finishedAt: args.finishedAt })
    };

    // Make the update
    const result = await event.data.ComputeTasks.update(updateData);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        data: result
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