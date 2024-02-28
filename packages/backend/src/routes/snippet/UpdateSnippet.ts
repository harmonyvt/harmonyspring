import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { http4xxErrorSchema } from '@/structures/schemas/HTTP4xxError.js';
import { http5xxErrorSchema } from '@/structures/schemas/HTTP5xxError.js';
import { responseMessageSchema } from '@/structures/schemas/ResponseMessage.js';

export const schema = {
	summary: 'Update Snippet',
	description: 'Updates a Snippet',
	tags: ['Albums'],
	params: z
		.object({
			uuid: z.string().describe('The uuid of the snippet.')
		})
		.required(),
	body: z.object({
		_private: z.boolean().describe('Whether the snippet is private or not.')
	}),
	response: {
		200: z.object({
			message: responseMessageSchema
		}),
		'4xx': http4xxErrorSchema,
		'5xx': http5xxErrorSchema
	}
};

export const options = {
	url: '/snippet/:uuid/update',
	method: 'post',
	middlewares: ['apiKey', 'auth']
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const { uuid } = req.params as { uuid: string };
	const { _private } = req.body as { _private?: boolean };
	if (_private === undefined) {
		void res.badRequest('No data supplied');
		return;
	}

	// Make sure the album exists and belongs to the user
	const snippet = await prisma.snippets.findFirst({
		where: {
			uuid,
			userId: req.user.id
		}
	});

	if (!snippet) {
		void res.notFound("The album doesn't exist or doesn't belong to the user");
		return;
	}

	const updateObj = {
		private: _private === true ? true : _private === false ? false : snippet.private
	};

	await prisma.snippets.update({
		where: {
			uuid
		},
		data: {
			...updateObj
		}
	});

	return res.send({
		message: 'Successfully edited the snippet to ' + (_private === true ? 'private' : 'public')
	});
};
