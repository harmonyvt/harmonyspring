import type { Job } from 'bullmq';

export interface GenerateThumbnailJobData {
	// Define the structure of your job data here
	url: string;
}

export async function processGenerateThumbnail(job: Job<GenerateThumbnailJobData>) {
	console.log(`Processing GenerateThumbnail job with ID: ${job.id}`);
	// Job processing logic here
}
