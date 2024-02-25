import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { TracklistSchema, TracklistResponseSchema } from '@/structures/schemas/TracksSchema.js';

export const schema = {
	summary: 'Add a tracklist',
	description: 'Add a tracklist',
	tags: ['Tracks'],
	body: TracklistSchema,
	response: {
		200: z.object({
			message: z.string(),
			tracklist: TracklistResponseSchema
		})
	}
};

export const options = {
	url: '/trackslist',
	method: 'post'
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const tracklist = req.body as z.infer<typeof TracklistSchema>;
	const response = await prisma.tracklists.create({
		data: tracklist
	});
	void res.send({
		message: 'Track added successfully',
		response
	});
};
