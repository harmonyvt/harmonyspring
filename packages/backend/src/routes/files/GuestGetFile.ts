import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { GuestParsedFile, RequestWithUser } from '@/structures/interfaces.js';
import { parsedGuestFileSchema } from '@/structures/schemas/GuestFileSchema.js';
import { http4xxErrorSchema } from '@/structures/schemas/HTTP4xxError.js';
import { http5xxErrorSchema } from '@/structures/schemas/HTTP5xxError.js';
import { responseMessageSchema } from '@/structures/schemas/ResponseMessage.js';
import { constructFilePublicLink } from '@/utils/File.js';

export const schema = {
	summary: 'Guest Get file',
	description: 'Get a specific file without authorization. This is used for public links',
	tags: ['Files'],
	params: z
		.object({
			search: z.string().describe('The uuid or name of the file.')
		})
		.required(),
	response: {
		200: z.object({
			message: responseMessageSchema,
			file: parsedGuestFileSchema
		}),
		'4xx': http4xxErrorSchema,
		'5xx': http5xxErrorSchema
	}
};

export const options = {
	url: '/guest/file/:search',
	method: 'get'
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const { search } = req.params as { search: string };
	console.log('uuid', search);
	// Make sure the file exists and belongs to the user
	let file = (await prisma.files.findFirst({
		where: {
			uuid: search,
			userId: req.user.id
		},
		select: {
			name: true,
			source: true,
			type: true,
			isS3: true,
			isWatched: true
		}
	})) as GuestParsedFile | null;

	if (!file) {
		// retry but search with uuid as file name
		file = (await prisma.files.findFirst({
			where: {
				name: search,
				userId: req.user.id
			},
			select: {
				name: true,
				source: true,
				type: true,
				isS3: true,
				isWatched: true
			}
		})) as GuestParsedFile | null;
	}

	if (!file) {
		void res.notFound("The file doesn't exist or doesn't belong to the user");
		return;
	}

	// Build the public links
	const parsedFile = {
		...file,
		...constructFilePublicLink({ req, fileName: file.name, isS3: file.isS3, isWatched: file.isWatched })
	};

	return res.send({
		message: 'Successfully retrieved file',
		file: parsedFile
	});
};
