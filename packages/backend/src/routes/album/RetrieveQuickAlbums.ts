import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { http4xxErrorSchema } from '@/structures/schemas/HTTP4xxError.js';
import { http5xxErrorSchema } from '@/structures/schemas/HTTP5xxError.js';

const quickAlbumSchema = z.object({
	id: z.number(),
	uuid: z.string(),
	userId: z.number(),
	name: z.string(),
	description: z.string().nullable(),
	zippedAt: z.date().nullable(),
	createdAt: z.date(),
	editedAt: z.date().nullable(),
	nsfw: z.boolean()
});

// Define the response schema for an array of quick albums or undefined
const responseQuickAlbumSchema = z.object({
	message: z.string(),
	quickAlbums: z.array(quickAlbumSchema).nullable()
});
export const schema = {
	summary: 'Retrieve quick albums',
	description: 'Retrieves the quick albums assigned to a user',
	tags: ['Albums'],
	response: {
		200: responseQuickAlbumSchema,
		'4xx': http4xxErrorSchema,
		'5xx': http5xxErrorSchema
	}
};

export const options = {
	url: '/album/quick',
	method: 'get',
	middlewares: ['apiKey', 'auth']
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const uuid = req.user.uuid;

	const quick = await prisma.users.findUnique({
		where: {
			uuid
		},
		include: {
			quickAlbums: true
		}
	});

	return res.send({
		message: 'Successfully retrieved quick albums',
		quickAlbums: quick?.quickAlbums
	});
};
