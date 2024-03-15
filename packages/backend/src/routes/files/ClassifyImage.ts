import { URL, fileURLToPath } from 'node:url';
import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '@/structures/database.js';
import type { RequestWithUser } from '@/structures/interfaces.js';
import { imageClassificationResultsSchema } from '@/structures/schemas/ClassifyResponseMessage.js';
import { http4xxErrorSchema } from '@/structures/schemas/HTTP4xxError.js';
import { http5xxErrorSchema } from '@/structures/schemas/HTTP5xxError.js';
import { log } from '@/utils/Logger.js';
export const schema = {
	summary: 'Classify an image or video',
	description: 'Classify an image or video using the Transformer library.',
	tags: ['Files'],
	params: z
		.object({
			uuid: z.string().describe('The uuid of the file.')
		})
		.required(),
	response: {
		200: z.object({
			result: imageClassificationResultsSchema
		}),
		'4xx': http4xxErrorSchema,
		'5xx': http5xxErrorSchema
	}
};

export const options = {
	url: '/file/:uuid/classify',
	method: 'post',
	middlewares: ['apiKey', 'auth']
};

export const run = async (req: RequestWithUser, res: FastifyReply) => {
	const { uuid } = req.params as { uuid: string };
	const file = await prisma.files.findFirst({
		where: {
			uuid,
			userId: req.user.id
		}
	});

	if (!file) {
		void res.notFound("The file doesn't exist or doesn't belong to the user");
		return;
	}

	const { classifyImage } = await import('@/utils/ImageClassifier.js');

	// get the path of the file
	const filePath = fileURLToPath(new URL(`../../../../../uploads/${file.name}`, import.meta.url));

	const results = await classifyImage(filePath);

	// will return
	// [
	//   { label: 'tiger, Panthera tigris', score: 0.632695734500885 },
	//   { label: 'tiger cat', score: 0.3634825646877289 },
	//   { label: 'lion, king of beasts, Panthera leo', score: 0.00045060308184474707 },
	//   { label: 'jaguar, panther, Panthera onca, Felis onca', score: 0.00035465499968267977 },
	//   ...
	// ]

	log.debug(results);
	void res.send({ result: results });
};
