import process from 'node:process';
import { URL } from 'node:url';
import { Worker, type Job } from 'bullmq';
import puppeteer from 'puppeteer-core';
import type { RequestUser, User } from '@/structures/interfaces.js';
import { uploadFilefromURL } from '../File.js';
import { log } from '../Logger.js';
import { validateAlbum } from '../UploadHelpers.js';

export interface FetchFileJobData {
	// Define the structure of your job data here
	albumUuid?: string;
	ip: string;
	itemId: string;
	url: string;
	user: RequestUser | User | undefined;
}

export async function processFetchFile(job: Job<FetchFileJobData>) {
	// if twitter url, get image
	let url = job.data.url;
	if (url.includes('twitter.com') || url.includes('x.com')) {
		let browser;
		if (process.env.NODE_ENV === 'production') {
			browser = await puppeteer.connect({ browserWSEndpoint: 'ws://browserless:3000' });
		} else {
			browser = await puppeteer.connect({ browserWSEndpoint: 'ws://localhost:3000' });
		}

		const page = await browser.newPage();
		await page.goto(url, { waitUntil: 'networkidle2' }); // Wait for the page to load completely

		// Extract the image URL
		const imageUrl = await page.evaluate(async () => {
			const images = document.querySelectorAll('img');
			for (const img of Array.from(images)) {
				if (img.src.includes('pbs.twimg.com/media')) {
					// await updateStatus(req.user.uuid, createItemData(itemId, createStatus('upload', 'processing - image found')));
					return img.src;
				}
			}

			return null;
		});

		if (imageUrl) {
			const urlObj = new URL(imageUrl);
			// Replace 'medium' with 'large' in the pathname if it exists
			if (urlObj.pathname.includes('medium')) {
				urlObj.pathname = urlObj.pathname.replace('medium', 'large');
			}

			// Remove the 'name' query parameter
			urlObj.searchParams.delete('name');

			// Convert the URL object back to a string
			url = urlObj.toString();
			// Here you can proceed to download the image or use the URL as needed
		} else {
			console.log('No image found in the tweet.');
		}
	}

	log.info(`Processing FetchFile job with ID: ${job.id}`);
	const album = await validateAlbum(job.data.albumUuid, job.data.user);
	// Job processing logic here
	await uploadFilefromURL({
		albumId: album ? album : undefined,
		ip: job.data.ip,
		itemId: job.data.itemId,
		url,
		user: job.data.user
	});
}
