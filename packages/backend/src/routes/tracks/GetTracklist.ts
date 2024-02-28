import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { TracklistResponseSchema } from '@/structures/schemas/TracksSchema.js';

// fetch tracklist from tracklist id

export const schema = {
	summary: 'Fetch a tracklist from tracklist id',
	description: 'Fetch a tracklist from tracklist id',
	tags: ['Tracks'],
	params: z
		.object({
			id: z.number().describe('The id of the tracklist.')
		})
		.required(),
	response: {
		200: z.object({
			message: z.string(),
			tracklist: TracklistResponseSchema
		})
	}
};

export const options = {
	url: '/trackslist/:id',
	method: 'get'
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const { id } = req.params as { id: number };

	const tracklist = await prisma.tracklists.findFirst({
		where: {
			id
		}
	});

	void res.send({
		message: 'Tracklist fetched successfully',
		tracklist
	});
};
