# FFmpeg Lambda API

This project creates an API for video processing using FFmpeg on AWS Lambda.

## Setup Instructions

1. Create an FFmpeg layer:
   ```bash
   mkdir -p layer/nodejs
   cd layer
   # Download FFmpeg binary for Lambda
   wget https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-amd64-static.tar.xz
   tar xf ffmpeg-git-amd64-static.tar.xz
   mv ffmpeg-git-*/ffmpeg .
   rm -rf ffmpeg-git-*
   zip -r ffmpeg-layer.zip ffmpeg
   ```

2. Deploy the service:
   ```bash
   serverless deploy
   ```

## Usage

Send a POST request to the API endpoint:

```json
{
  "inputKey": "input/video.mp4",
  "outputKey": "output/processed.mp4",
  "ffmpegCommand": "-vf scale=720:-1 -c:v libx264 -preset medium"
}
```

The API will:
1. Download the video from S3
2. Process it using FFmpeg
3. Upload the result back to S3
4. Return the output file location
