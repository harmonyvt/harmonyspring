import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { TracksResponseSchema } from '@/structures/schemas/TracksSchema.js';

export const schema = {
	summary: 'Get a track by id',
	description: 'Get a track by id',
	tags: ['Tracks'],
	params: z
		.object({
			trackId: z.number().describe('The id of the track.')
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
	url: '/tracks/:trackId',
	method: 'get'
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const { trackId } = req.params as { trackId: number };

	const tracks = await prisma.tracks.findFirst({
		where: {
			id: trackId
		}
	});

	void res.send({
		message: 'Track fetched successfully',
		tracks
	});
};
