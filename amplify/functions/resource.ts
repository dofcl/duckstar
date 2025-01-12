import { defineFunction } from "@aws-amplify/backend";
    
export const musicGenWebhookFunction = defineFunction({
  name: "music-gen-webhook--function",
  entry: "./handler.ts"
});