import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { TrackSchema, TracksResponseSchema } from '@/structures/schemas/TracksSchema.js';

// remove track from tracks
export const schema = {
	summary: 'Remove a track from a tracklist',
	description: 'Remove a track from a tracklist',
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
	method: 'delete'
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const track = req.body as z.infer<typeof TrackSchema>;
	const response = await prisma.tracks.delete({
		where: {
			id: track.id
		}
	});
	void res.send({
		message: 'Track removed successfully',
		response
	});
};
