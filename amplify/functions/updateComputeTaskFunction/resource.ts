import { defineFunction, defineBackend } from '@aws-amplify/backend';

export const updateComputeTaskFunction = defineFunction({
  entry: './handler.ts',
})