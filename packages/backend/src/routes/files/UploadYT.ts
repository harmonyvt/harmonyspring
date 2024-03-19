import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { http4xxErrorSchema } from '@/structures/schemas/HTTP4xxError.js';
import { http5xxErrorSchema } from '@/structures/schemas/HTTP5xxError.js';
import { YTDLPFilefromURL, constructFilePublicLink } from '@/utils/File.js';
import { log } from '@/utils/Logger.js';
import { addJob } from '@/utils/RedisQueue.js';
import { validateAlbum } from '@/utils/UploadHelpers.js';
import { processFetchVideo } from '@/utils/job/FetchVideo.js';
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
			response: z.string().describe('The response from the server.')
		}),
		204: z.null(),
		'4xx': http4xxErrorSchema,
		'5xx': http5xxErrorSchema
	}
};

export const options = {
	url: '/upload/ytdlp/url',
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
	try {
		const { url } = req.body as { url: string };
		await addJob(
			'FetchVideoYTDLP',
			{
				albumUuid: req.headers.albumuuid as string,
				ip: req.ip,
				itemId: req.user.uuid,
				url,
				user: req.user
			},
			req.user.uuid
		);
		await res.status(200).send({
			response: 'File is being uploaded'
		});
	} catch (error) {
		log.error(`Failed to upload file: ${error}`);
		void res.internalServerError('Failed to upload file');
	}
};
