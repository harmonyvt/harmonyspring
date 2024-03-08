import process from 'node:process';
import { URL } from 'node:url';
import type { FastifyReply } from 'fastify';
import puppeteer from 'puppeteer-core';
import { z } from 'zod';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { http4xxErrorSchema } from '@/structures/schemas/HTTP4xxError.js';
import { http5xxErrorSchema } from '@/structures/schemas/HTTP5xxError.js';
import { constructFilePublicLink, uploadFilefromURL } from '@/utils/File.js';
import { log } from '@/utils/Logger.js';
import { addToQueue, updateStatus } from '@/utils/RedisQueue.js';
import { validateAlbum } from '@/utils/UploadHelpers.js';
export const schema = {
	summary: 'Upload file from a URL',
	description: 'Uploads a file from a URL',
	tags: ['Files'],
	headers: z.object({
		albumuuid: z.string().optional().describe('The uuid of the album.')
	}),
	body: z
		.object({
			url: z.string().describe('The URL of the file.')
		})
		.required(),
	response: {
		200: z.object({
			name: z.string().describe('The name of the file.'),
			uuid: z.string().describe('The uuid of the file.'),
			url: z.string().describe('The URL of the file.'),
			publicUrl: z.string().optional().describe('The public URL of the file.')
		}),
		204: z.null(),
		'4xx': http4xxErrorSchema,
		'5xx': http5xxErrorSchema
	}
};

export const options = {
	url: '/upload/url',
	method: 'post',
	middlewares: [
		{
			name: 'apiKey'
		},
		{
			name: 'auth',
			optional: true
		}
	]
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	// random item id
	const itemId = Math.random().toString(36).slice(7).toString();
	await addToQueue(req.user.uuid, itemId, 'pending');
	if (!req.user) {
		log.error('Missing user information');
		void res.internalServerError('Missing user information');
		return;
	}

	let { url } = req.body as { url: string };
	await updateStatus(req.user.uuid, itemId, 'downloading - ' + url);
	// if twitter url, get image
	if (url.includes('twitter.com') || url.includes('x.com')) {
		await updateStatus(req.user.uuid, itemId, 'running twitter script');
		let browser;
		if (process.env.NODE_ENV === 'production') {
			browser = await puppeteer.connect({ browserWSEndpoint: 'ws://browserless:3000' });
		} else {
			browser = await puppeteer.connect({ browserWSEndpoint: 'ws://localhost:3000' });
		}

		const page = await browser.newPage();
		await page.goto(url, { waitUntil: 'networkidle2' }); // Wait for the page to load completely
		await updateStatus(req.user.uuid, itemId, 'opening - ' + url);
		// Extract the image URL
		const imageUrl = await page.evaluate(() => {
			const images = document.querySelectorAll('img');
			for (const img of Array.from(images)) {
				if (img.src.includes('pbs.twimg.com/media')) {
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
			await updateStatus(req.user.uuid, itemId, 'image found - ' + url);
		} else {
			console.log('No image found in the tweet.');
			await updateStatus(req.user.uuid, itemId, 'no image found treating as normal url');
		}
	}

	const album = await validateAlbum(req.headers.albumuuid as string, req.user ? req.user : undefined);
	if (!url) {
		log.error('Missing file information');
		void res.badRequest('Missing file information');
		return;
	}

	log.info(`Uploading file from URL: ${url}`);
	const file = await uploadFilefromURL({
		url,
		ip: req.ip,
		user: req.user,
		albumId: album ? album : null,
		jobId: itemId
	});
	if (!file) {
		void res.internalServerError('Failed to upload file');
	}

	log.info(`File created: ${file.name} (${file.uuid})`);
	const linkData = constructFilePublicLink({ req, fileName: file.name });
	log.info(`File public link: ${linkData.url}`);

	log.info('File updated on database');

	await res.status(200).send({
		name: file.name,
		uuid: file.uuid,
		url,
		publicUrl: linkData.url
	});
};
