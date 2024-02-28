import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { ExtendedFile, RequestWithUser } from '@/structures/interfaces.js';
import { fileAsUserWithAlbumsSchema } from '@/structures/schemas/FileAsUserWithAlbums.js';
import { http4xxErrorSchema } from '@/structures/schemas/HTTP4xxError.js';
import { http5xxErrorSchema } from '@/structures/schemas/HTTP5xxError.js';
import { responseMessageSchema } from '@/structures/schemas/ResponseMessage.js';
import { constructFilePublicLink } from '@/utils/File.js';

export const schema = {
	summary: 'Get file',
	description: 'Get a specific file',
	tags: ['Files'],
	params: z
		.object({
			search: z.string().describe('The uuid or name of the file.')
		})
		.required(),
	response: {
		200: z.object({
			message: responseMessageSchema,
			file: fileAsUserWithAlbumsSchema
		}),
		'4xx': http4xxErrorSchema,
		'5xx': http5xxErrorSchema
	}
};

export const options = {
	url: '/file/:search',
	method: 'get',
	middlewares: ['apiKey', 'auth']
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const { search } = req.params as { search: string };
	// Make sure the file exists and belongs to the user
	let file = (await prisma.files.findFirst({
		where: {
			uuid: search,
			userId: req.user.id
		},
		include: {
			albums: {
				select: {
					uuid: true,
					name: true
				},
				orderBy: {
					id: 'desc'
				}
			},
			tags: {
				select: {
					uuid: true,
					name: true
				},
				orderBy: {
					id: 'desc'
				}
			}
		}
	})) as ExtendedFile | null;

	if (!file) {
		// retry but search with uuid as file name
		file = (await prisma.files.findFirst({
			where: {
				name: search,
				userId: req.user.id
			},
			include: {
				albums: {
					select: {
						uuid: true,
						name: true
					},
					orderBy: {
						id: 'desc'
					}
				},
				tags: {
					select: {
						uuid: true,
						name: true
					},
					orderBy: {
						id: 'desc'
					}
				}
			}
		})) as ExtendedFile | null;
	}

	if (!file) {
		void res.notFound("The file doesn't exist or doesn't belong to the user");
		return;
	}

	// Build the public links
	let parsedFile: ExtendedFile = file;
	parsedFile = {
		...file,
		...constructFilePublicLink({ req, fileName: file.name, isS3: file.isS3, isWatched: file.isWatched })
	};

	return res.send({
		message: 'Successfully retrieved file',
		file: parsedFile
	});
};
