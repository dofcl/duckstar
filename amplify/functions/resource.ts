// amplify/functions/updateComputeTaskFunction.ts
import { defineFunction } from '@aws-amplify/backend';

interface UpdateComputeTaskEvent {
  data: {
    taskId: string;
    status?: string;
    failed?: boolean;
    failedReason?: string;
    finished?: boolean;
    finishedAt?: string;
  };
}

interface Context {
  data: {
    ComputeTasks: {
      update: (input: {
        taskId: string;
        [key: string]: any;
      }) => Promise<any>;
    };
  };
}

export const updateComputeTaskFunction = defineFunction((scope) => {
  return {
    entry: async (event: UpdateComputeTaskEvent, context: Context) => {
      const { data } = event;

      if (!data.taskId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'taskId is required' })
        };
      }

      try {
        const updateFields = {
          updatedAt: new Date().toISOString(),
          ...(data.status && { status: data.status }),
          ...(data.failed !== undefined && { failed: data.failed }),
          ...(data.failedReason && { failedReason: data.failedReason }),
          ...(data.finished !== undefined && { finished: data.finished }),
          ...(data.finishedAt && { finishedAt: data.finishedAt })
        };

        const result = await context.data.ComputeTasks.update({
          taskId: data.taskId,
          ...updateFields
        });

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Task updated successfully',
            task: result
          })
        };
      } catch (error) {
        console.error('Error updating task:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: 'Error updating task',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        };
      }
    }
  };
});
