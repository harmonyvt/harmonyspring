import { z } from 'zod';
export const parsedGuestFileSchema = z.object({
	url: z.string(),
	thumb: z.string(),
	thumbSquare: z.string(),
	preview: z.string(),
	type: z.string(),
	name: z.string(),
	source: z.string(),
	isS3: z.boolean(),
	isWatched: z.boolean()
});
