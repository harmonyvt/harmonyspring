import { Worker, type Job } from 'bullmq';
import type { RequestUser, User } from '@/structures/interfaces.js';
import { YTDLPFilefromURL } from '../File.js';
import { log } from '../Logger.js';
import { validateAlbum } from '../UploadHelpers.js';
export interface FetchVideoJobData {
	albumUuid?: string | null | undefined;
	ip: string;
	url: string;
	user?: RequestUser | User | undefined;
}

export async function processFetchVideo(job: Job<FetchVideoJobData>) {
	log.info(`Processing FetchVideo job with ID: ${job.id}`);
	const album = await validateAlbum(job.data.albumUuid, job.data.user);
	await YTDLPFilefromURL({
		albumId: album ? album : undefined,
		ip: job.data.ip,
		url: job.data.url,
		user: job.data.user,
		job
	});
}
