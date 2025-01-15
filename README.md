# Hackathon branch code freeze is: [hackathon-code-freeze](https://github.com/FastCloud-Labs/duckstar/tree/hackathon-code-freeze)

## DuckStar Vue.js Application with AWS Amplify

This repository provides the DuckStar FrontEnd applications using Vue.js and AWS Amplify.



## Overview

This template equips you with a foundational Vue application integrated with AWS Amplify, streamlined for scalability and performance. It is ideal for developers looking to jumpstart their project with pre-configured AWS services like Cognito, AppSync, and DynamoDB.

## Features

- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Ready-to-use GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.
- **Audio Control**: Mute and unmute background audio.
- **Responsive Design**: Mobile and desktop menus.


You'll need to setp te backend and define a "".env" file to the backend endpoints. refer to DuckStar-Backend

## Environment Variables

To configure the application, set the following environment variables:

- `VITE_APP_PUBLIC_STATIC`: CloudFront or S3 bucket for uploaded media
- `VITE_APP_MUSIC_GEN_ENDPOINT`: Endpoint for music generation
- `VITE_APP_MUSIC_GEN_CALLBACK`: Callback URL for music generation


## Deploying to AWS

For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/vue/start/quickstart/#deploy-a-fullstack-app-to-aws) of our documentation.

## Local Development

To set up your local development environment, follow these steps:

1. Use Node.js version 22:
    ```sh
    nvm use 22
    ```

2. Start the sandbox environment:
    ```sh
    npx ampx sandbox --profile fastcloud
    ```

3. Install dependencies:
    ```sh
    npm install
    ```

4. Start the development server:
    ```sh
    npm run dev
    ```

## Security

See CONTRIBUTING for more information.


## License

This project is licensed under the Business Source License 1.1 (BSL 1.1). 
