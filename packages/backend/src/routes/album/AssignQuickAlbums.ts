import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { http4xxErrorSchema } from '@/structures/schemas/HTTP4xxError.js';
import { http5xxErrorSchema } from '@/structures/schemas/HTTP5xxError.js';
import { responseMessageSchema } from '@/structures/schemas/ResponseMessage.js';
import { log } from '@/utils/Logger.js';

export const schema = {
	summary: 'Assign quick albums',
	description: 'Assigns quick albums to a file',
	tags: ['Albums'],
	body: z.object({
		albums: z.array(z.string().uuid()).describe('The quick albums to assign the file to.')
	}),
	response: {
		200: z.object({
			message: z.string()
		}),
		'4xx': http4xxErrorSchema,
		'5xx': http5xxErrorSchema
	}
};

export const options = {
	url: '/album/quick',
	method: 'post',
	middlewares: ['apiKey', 'auth']
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const { albums } = req.body as { albums: string[]; file: string };
	const uuid = req.user.uuid;

	log.debug(`Assigning quick albums to file ${uuid}: Albums: ${albums.join(', ')}`);
	// if empty, remove all quick albums
	if (albums.length === 0 || !albums) {
		await prisma.users.update({
			where: {
				uuid
			},
			data: {
				quickAlbums: {
					deleteMany: {}
				}
			}
		});
		return res.send({ message: 'Quick albums assigned successfully' });
	}

	// Make sure the albums exist and they belong to the user
	const albumData = await prisma.albums.findMany({
		where: {
			userId: req.user.id,
			uuid: {
				in: albums
			}
		}
	});
	if (albumData.length !== albums.length) {
		return res.status(404).send({ message: 'Album not found' });
	}

	// Assign the quick albums to the file
	await prisma.users.update({
		where: {
			uuid
		},
		data: {
			quickAlbums: {
				connect: albumData.map(album => ({
					id: album.id
				}))
			}
		}
	});

	return res.send({ message: 'Quick albums assigned successfully' });
};
