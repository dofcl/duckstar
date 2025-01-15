const serverless = require("serverless-http");
const express = require("express");
const axios = require('axios');
const MusicTempo = require('@superiortech/music-tempo');

const app = express();
app.use(express.json());

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.get("/detect-bpm", async (req, res, next) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                error: "URL parameter is required"
            });
        }

        console.log('Processing URL:', url);

        // Download file
        const response = await axios({
            method: 'GET',
            url,
            responseType: 'arraybuffer'
        });

        console.log('File downloaded, size:', response.data.length);

        // Convert ArrayBuffer to Float32Array
        const buffer = Buffer.from(response.data);
        
        // Create a Float32Array to store audio samples
        // We'll read 16-bit samples, so the length is half the buffer size
        const audioData = new Float32Array(Math.floor(buffer.length / 2));
        
        // Process the buffer in chunks to avoid overflow
        for (let i = 0; i < buffer.length - 1; i += 2) {
            try {
                if (i + 1 < buffer.length) {
                    // Read 16-bit samples and normalize to [-1, 1]
                    const sample = buffer.readInt16LE(i) / 32768.0;
                    audioData[i/2] = sample;
                }
            } catch (e) {
                console.warn('Buffer read error at position', i, e.message);
                break;
            }
        }

        console.log('Audio data processed, samples:', audioData.length);

        // Print first few samples to verify data
        console.log('First 10 samples:', audioData.slice(0, 10));

        // Detect tempo using the default export
        const mt = new MusicTempo.default(audioData);

        const result = {
            bpm: Math.round(mt.tempo),
            tempo_confidence: mt.confidence,
            beats: mt.beats.length,
            peaks: mt.peaks.length,
            samples_processed: audioData.length
        };

        console.log('Analysis complete:', result);

        return res.status(200).json(result);

    } catch (error) {
        console.error('Error detecting BPM:', error);
        return res.status(500).json({
            error: "Failed to detect BPM",
            details: error.message,
            stack: error.stack
        });
    }
});

app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});

module.exports.handler = serverless(app);