import { defineFunction } from '@aws-amplify/backend';

interface EventType {
  arguments: {
    taskId: string;
    status?: string;
    failed?: boolean;
    failedReason?: string;
    finished?: boolean;
    finishedAt?: string;
  };
  data: {
    ComputeTasks: {
      update: (input: Record<string, any>) => Promise<any>;
    };
  };
}

// Simplify to just use entry point with the function definition
export const updateComputeTaskFunction = defineFunction({
  entry: './handler.ts'
});