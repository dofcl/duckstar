import { defineFunction } from '@aws-amplify/backend';
import { type Schema } from '../../../amplify/data/resource';

export const handler = async (event: any) => {
  console.log('Raw event:', JSON.stringify(event, null, 2));
  
  try {
    const body = JSON.parse(event.body);
    console.log('Parsed body:', JSON.stringify(body, null, 2));
    
    const taskId = body.arguments.taskId;
    console.log('Looking for taskId:', taskId);

    // Use event.data to access the data layer directly
    const task = await event.data.ComputeTasks.get({
      taskId: taskId
    });
    
    console.log('Task response:', JSON.stringify(task, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: task
      })
    };
    
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Failed to get compute task',
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    };
  }
};