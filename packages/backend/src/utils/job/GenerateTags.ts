import type { Job } from 'bullmq';

export interface GenerateTagsJobData {
	// Define the structure of your job data here
	url: string;
}

export async function processGenerateTags(job: Job<GenerateTagsJobData>) {
	console.log(`Processing GenerateTags job with ID: ${job.id}`);
	// Job processing logic here
}
