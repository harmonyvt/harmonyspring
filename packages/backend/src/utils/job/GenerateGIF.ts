import type { Job } from 'bullmq';

export interface GenerateGIFJobData {
	// Define the structure of your job data here
	url: string;
}

export async function processGenerateGIF(job: Job<GenerateGIFJobData>) {
	console.log(`Processing GenerateGIF job with ID: ${job.id}`);
	// Job processing logic here
}
