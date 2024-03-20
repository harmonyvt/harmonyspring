import process from 'node:process';
import type { JobItem } from '@harmonyspring/helpers';
import { Queue, QueueEvents, Worker } from 'bullmq';
import { log } from './Logger.js';
import { redisClient } from './RedisClient.js';
import { processFetchFile, type FetchFileJobData } from './job/FetchFile.js';
import { processFetchVideo, type FetchVideoJobData } from './job/FetchVideo.js';
import type { GenerateGIFJobData } from './job/GenerateGIF.js';
import type { GenerateTagsJobData } from './job/GenerateTags.js';
import type { GenerateThumbnailJobData } from './job/GenerateThumbnail.js';

// Define queues for each job type
type JobDataMap = {
	FetchFile: FetchFileJobData;
	FetchVideoYTDLP: FetchVideoJobData;
	GenerateGIF: GenerateGIFJobData;
	GenerateTags: GenerateTagsJobData;
	ProcessThumbnail: GenerateThumbnailJobData;
};
// Generic function to add jobs
export async function addJob<T extends keyof JobDataMap>(jobType: T, jobData: JobDataMap[T], uuid: string) {
	const queue = new Queue(jobType, { connection: redisClient });
	try {
		const job = await queue.add(jobType, { ...jobData, uuid });
		log.info(`[${job.id}] Added job to ${jobType} queue with ID: ${job.id} at ${job.timestamp}`);
	} catch (error) {
		console.error(`Error adding job to ${jobType} queue at`, error);
	}
}

export async function setupQueue(jobType: string) {
	new Queue(jobType, { connection: redisClient });
	log.info(`Queue for ${jobType} has been set up`);
}

export async function setupWorkers() {
	let host;
	if (process.env.NODE_ENV === 'production') {
		host = 'dragonfly';
	} else {
		host = 'localhost';
	}

	const fetchVideoWorker = new Worker('FetchVideoYTDLP', processFetchVideo, {
		connection: {
			host,
			port: 6379
		}
	});

	// FetchFile, GenerateGIF, GenerateTags, and GenerateThumbnail workers can be set up similarly
	const fetchFileWorker = new Worker('FetchFile', processFetchFile, {
		connection: {
			host,
			port: 6379
		}
	});
}

// Function to retrieve the status and, if applicable, the progress of a job
export async function getJobStatusAndProgress(queueName: string, jobId: string): Promise<JobStatusResult> {
  const queue = new Queue(queueName, { connection: redisClient });
  const job = await queue.getJob(jobId);

  if (!job) {
    throw new Error(`Job with ID ${jobId} not found in queue ${queueName}`);
  }

  const state = await job.getState();
  const progress = await job.progress();

  // Assuming 'active' state indicates a job in progress
  if (state === 'active') {
    return { status: state, progress };
  } else {
    return { status: state };
  }
}
