import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { TrackSchema, TracksResponseSchema } from '@/structures/schemas/TracksSchema.js';

export const schema = {
	summary: 'Add a track to a tracklist',
	description: 'Add a track to a tracklist',
	tags: ['Tracks'],
	body: TrackSchema,
	response: {
		200: z.object({
			message: z.string(),
			tracklist: TracksResponseSchema
		})
	}
};

export const options = {
	url: '/tracks',
	method: 'post'
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const track = req.body as z.infer<typeof TrackSchema>;
	const response = await prisma.tracks.create({
		data: track
	});
	void res.send({
		message: 'Track added successfully',
		response
	});
};
