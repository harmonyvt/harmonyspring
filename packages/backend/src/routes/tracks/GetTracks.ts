import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { TracksResponseSchema } from '@/structures/schemas/TracksSchema.js';

export const schema = {
	summary: 'Get all tracks from a tracklist',
	description: 'Get all tracks from a tracklist',
	tags: ['Tracks'],
	params: z
		.object({
			tracklistId: z.number().describe('The id of the tracklist.')
		})
		.required(),
	response: {
		200: z.object({
			message: z.string(),
			tracks: TracksResponseSchema
		})
	}
};

export const options = {
	url: '/tracks/:tracklistId',
	method: 'get'
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const { tracklistId } = req.params as { tracklistId: number };

	const tracks = await prisma.tracks.findMany({
		where: {
			id: tracklistId
		}
	});

	void res.send({
		message: 'Tracks fetched successfully',
		tracks
	});
};
