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

export async function setupQueueEvents(jobType: string) {
	log.info(`Setting up queue events for ${jobType} queue`);
	const queue = new QueueEvents(jobType, { connection: redisClient });
	queue.on('waiting', job => {
		log.info(`Job with ID: ${job.jobId} is waiting`);
	});
	queue.on('active', job => {
		log.info(`Job with ID: ${job.jobId} is active`);
	});
	queue.on('progress', job => {
		const progressData = job.data as JobItem;
		log.info(
			`Job with ID: ${job.jobId} has progress: ${progressData.jobType} - ${progressData.lastUpdate} - ${progressData.owner} - ${progressData.progress} - ${progressData.status} - ${progressData.title}`
		);
	});
	queue.on('completed', job => {
		log.info(`Job with ID: ${job.jobId} has been completed`);
	});
	queue.on('failed', (job, error) => {
		log.error(`Job with ID: ${job.jobId} has failed with error: ${error}`);
	});
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

// Correct usage
// addJob('FetchFile', { url: 'http://example.com/file.pdf' });

// Incorrect usage, TypeScript will show an error
// addJob('FetchFile', { videoUrl: 'http://example.com/video.mp4' });
