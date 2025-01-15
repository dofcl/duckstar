import { S3 } from '@aws-sdk/client-s3';
import { Lambda } from '@aws-sdk/client-lambda';
import crypto from 'crypto';
import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import https from 'https';
import http from 'http';
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


// Initialize S3 client for S3 Express
const s3Config = {
  region: 'us-west-2',
};

console.log('Initializing S3 client with config:', s3Config);
const s3 = new S3(s3Config);
const lambda = new Lambda();
const TEMP_DIR = '/tmp';
const FFMPEG_PATH = process.env.AWS_LAMBDA_FUNCTION_NAME ? '/opt/bin/ffmpeg' : 'ffmpeg';


async function getPresignedUrl(key) {
  console.log('Generating presigned URL for key:', key);
  const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ServerSideEncryption: 'AES256'
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

async function getJobStatus(jobId) {
    try {
        console.log('Getting job status for:', jobId);
        console.log('From bucket:', process.env.S3_BUCKET);
        
        const response = await s3.getObject({
            Bucket: process.env.S3_BUCKET,
            Key: `jobs/${jobId}.json`
        });
        
        const jobData = await response.Body.transformToString();
        return JSON.parse(jobData);
    } catch (error) {
        console.error('getJobStatus Error:', error);
        if (error.name === 'NoSuchKey') {
            return null;
        }
        throw error;
    }
}

async function updateJobStatus(jobId, status, result = null) {
  try {
      const currentJob = await getJobStatus(jobId);
      if (!currentJob) {
          throw new Error('Job not found');
      }

      const updatedJob = {
          ...currentJob,
          status,
          updatedAt: new Date().toISOString()
      };

      if (status === 'COMPLETED') {
          const outputKey = `processed/${jobId}.mp4`;
          const url = await getPresignedUrl(outputKey);
          updatedJob.result = {
              outputKey,
              url,
              completedAt: new Date().toISOString()
          };
      } else if (result) {
          updatedJob.result = result;
      }

      await s3.putObject({
          Bucket: process.env.S3_BUCKET,
          Key: `jobs/${jobId}.json`,
          Body: JSON.stringify(updatedJob),
          ContentType: 'application/json'
      });
  } catch (error) {
      console.error('updateJobStatus Error:', error);
      throw error;
  }
}

async function createJob(jobDetails, providedJobId = null) {
    try {
        const jobId = providedJobId || crypto.randomUUID();
        const timestamp = new Date().toISOString();

        const jobStatus = {
            jobId,
            status: 'PENDING',
            createdAt: timestamp,
            updatedAt: timestamp,
            ...jobDetails
        };

        if (providedJobId) {
            const existingJob = await getJobStatus(jobId);
            if (existingJob) {
                return { error: 'Job ID already exists', jobId };
            }
        }

        await s3.putObject({
            Bucket: process.env.S3_BUCKET,
            Key: `jobs/${jobId}.json`,
            Body: JSON.stringify(jobStatus),
            ContentType: 'application/json'
        });

        return { jobId };
    } catch (error) {
        console.error('createJob Error:', error);
        throw error;
    }
}

async function downloadFromUrl(url, localPath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(localPath);
        
        console.log('Downloading from URL:', url);
        
        protocol.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(localPath, () => {});
            reject(err);
        });
    });
}

async function processVideoWithFfmpeg(inputPath, outputPath, ffmpegCommand) {
  return new Promise((resolve, reject) => {
      console.log('Using FFmpeg path:', FFMPEG_PATH);
      console.log('Processing video with command:', ffmpegCommand);

      // Ensure that output path is added at the end of the command
      const args = ffmpegCommand.split(' ');

      // Add input file and output file to the FFmpeg command
      args.unshift('-i', inputPath);  // Add input file first
      args.push(outputPath);          // Add output file at the end

      console.log('Full FFmpeg command:', [FFMPEG_PATH, ...args].join(' '));

      const ffmpeg = spawn(FFMPEG_PATH, args);

      ffmpeg.stderr.on('data', (data) => {
          console.log(`FFmpeg stderr: ${data}`);
      });

      ffmpeg.stdout.on('data', (data) => {
          console.log(`FFmpeg stdout: ${data}`);
      });

      ffmpeg.on('close', (code) => {
          if (code === 0) {
              resolve();
          } else {
              reject(new Error(`FFmpeg process exited with code ${code}`));
          }
      });

      ffmpeg.on('error', (err) => {
          console.error('FFmpeg spawn error:', err);
          reject(err);
      });
  });
}


async function processVideo(jobId, input, ffmpegCommand) {
    const inputExt = path.extname(input.split('?')[0]);
    const outputExt = path.extname(`processed/${jobId}.mp4`);
    const inputPath = path.join(TEMP_DIR, `input_${Date.now()}${inputExt}`);
    const outputPath = path.join(TEMP_DIR, `output_${Date.now()}${outputExt}`);
    const outputKey = `processed/${jobId}.mp4`;

    try {
        await downloadFromUrl(input, inputPath);
        await processVideoWithFfmpeg(inputPath, outputPath, ffmpegCommand);
        
        const fileContent = fs.readFileSync(outputPath);
        await s3.putObject({
            Bucket: process.env.S3_BUCKET,
            Key: outputKey,
            Body: fileContent
        });

        // Cleanup
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
    } catch (error) {
        console.error('Processing error:', error);
        throw error;
    }
}

export const handler = async (event) => {
    try {
        //console.log('Event:', event);

        // Handle GET request for job status
        if (event.httpMethod === 'GET' && event.pathParameters?.jobId) {
            const { jobId } = event.pathParameters;
            console.log('check job status for:', jobId);
            const job = await getJobStatus(jobId);

            if (!job) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'Job not found', status: 'NOT_FOUND' }) 
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(job)
            };
        }

        // Handle POST request for video processing
        if (event.httpMethod === 'POST') {
            const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
            
            // Check if this is an async processing request
            if (event.isAsync === true) {
                const { jobId, input, ffmpegCommand } = body;
                try {
                    await updateJobStatus(jobId, 'PROCESSING');
                    await processVideo(jobId, input,  ffmpegCommand);
                    await updateJobStatus(jobId, 'COMPLETED', {
                        completedAt: new Date().toISOString()
                    });
                } catch (error) {
                    await updateJobStatus(jobId, 'FAILED', {
                        error: error.message,
                        failedAt: new Date().toISOString()
                    });
                    throw error;
                }
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Processing completed', jobId })
                };
            }

            // Create new job with optional provided jobId
            const jobResult = await createJob({
                input: body.input,
                ffmpegCommand: body.ffmpegCommand || '-vf scale=720:-1'
            }, body.jobId);

            if (jobResult.error) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: jobResult.error,
                        jobId: jobResult.jobId
                    })
                };
            }

            // Invoke async processing
            await lambda.invoke({
                FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
                InvocationType: 'Event',
                Payload: JSON.stringify({
                    ...event,
                    isAsync: true,
                    body: {
                        jobId: jobResult.jobId,
                        input: body.input,
                        outputKey: `processed/${jobResult.jobId}.mp4`,
                        ffmpegCommand: body.ffmpegCommand || '-vf scale=720:-1'
                    },
                    httpMethod: 'POST'
                })
            });

            return {
                statusCode: 202,
                body: JSON.stringify({
                    message: 'Video processing started',
                    jobId: jobResult.jobId,
                    status: 'PENDING'
                })
            };
        }
        if (event.httpMethod === 'GET' && event.pathParameters?.key) {
          try {
              const key = event.pathParameters.key;
              console.log('Generating presigned URL for:', key);
              
              // Check if file exists first
              await s3.headObject({
                  Bucket: process.env.S3_BUCKET,
                  Key: key
              });
              
              const url = await getPresignedUrl(key);
              return {
                  statusCode: 200,
                  body: JSON.stringify({ url })
              };
          } catch (error) {
              console.error('Presigned URL error:', error);
              return {
                  statusCode: error.$metadata?.httpStatusCode || 500,
                  body: JSON.stringify({ 
                      error: error.message,
                      code: error.code
                  })
              };
          }
      }

    } catch (error) {
        console.error('Handler Error:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error processing request',
                error: error.message,
                errorDetails: error.code || error.name
            })
        };
    }
};