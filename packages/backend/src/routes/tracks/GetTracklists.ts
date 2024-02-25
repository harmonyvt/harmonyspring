import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { TracklistResponseSchema } from '@/structures/schemas/TracksSchema.js';

export const schema = {
	summary: 'Get all tracklist with a userId',
	description: 'Get all tracklist with a userId',
	tags: ['Tracklists'],
	params: z
		.object({
			userId: z.number().describe('The id of the user.')
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
	url: '/trackslist',
	method: 'get'
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const userId = req.user.id;

	const tratracklistsks = await prisma.tracklists.findMany({
		where: {
			userId
		}
	});

	void res.send({
		message: 'Tracklist fetched successfully',
		tratracklistsks
	});
};
