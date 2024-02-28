import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { TracklistSchema } from '@/structures/schemas/TracksSchema.js';

export const schema = {
	summary: 'Get all tracklist with a userId',
	description: 'Get all tracklist with a userId',
	tags: ['Tracklists'],
	response: {
		200: z.object({
			message: z.string(),
			tracklists: z.array(TracklistSchema)
		})
	}
};
export const options = {
	url: '/trackslist',
	method: 'get',
	middlewares: ['apiKey', 'auth']
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const userId = req.user.id;

	const tracklists = await prisma.tracklists.findMany({
		where: {
			userId
		}
	});
	void res.send({
		message: 'Tracklist fetched successfully',
		tracklists
	});
};
