import { defineFunction } from '@aws-amplify/backend';

export const updateComputeTaskFunction = defineFunction({
  name: 'updateComputeTaskFunction',
  entry: './handler.ts',
})