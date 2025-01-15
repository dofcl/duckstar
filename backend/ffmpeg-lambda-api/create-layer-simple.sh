#!/bin/bash

# Create directories
mkdir -p layer/ffmpeg layer/bin

# Download FFmpeg
curl -O https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz

# Extract FFmpeg
tar xf ffmpeg-release-amd64-static.tar.xz

# Get the extracted directory name
FFMPEG_DIR=$(find . -maxdepth 1 -type d -name "ffmpeg-*-amd64-static")

# Copy FFmpeg binary to both possible locations
cp "$FFMPEG_DIR/ffmpeg" layer/ffmpeg
cp "$FFMPEG_DIR/ffmpeg" layer/bin/

# Make them executable
chmod +x layer/ffmpeg
chmod +x layer/bin/ffmpeg

# Create ZIP file
cd layer
zip -r ../ffmpeg-layer.zip .
cd ..

echo "Created ffmpeg-layer.zip with FFmpeg in both /ffmpeg and /bin/ffmpeg locations"