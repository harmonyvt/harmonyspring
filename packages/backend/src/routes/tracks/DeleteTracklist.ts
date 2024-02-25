import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { TracklistSchema, TracklistResponseSchema } from '@/structures/schemas/TracksSchema.js';

// remove Tracklist from Tracklist

export const schema = {
	summary: 'Remove a tracklist',
	description: 'Remove a tracklist',
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
	method: 'delete'
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const tracklist = req.body as z.infer<typeof TracklistSchema>;
	const response = await prisma.tracklists.delete({
		where: {
			id: tracklist.id
		}
	});
	void res.send({
		message: 'Tracklist removed successfully',
		response
	});
};
