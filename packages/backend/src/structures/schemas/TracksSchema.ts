import { z } from 'zod';

export const TrackSchema = z.object({
	id: z.number(),
	userId: z.number(),
	fileId: z.number(),
	startTime: z.number(),
	endTime: z.number(),
	title: z.string(),
	artist: z.string(),
	source: z.string(),
	tracklistId: z.number()
});

export const TracksResponseSchema = z.object({
	tracks: z.array(TrackSchema)
});

export const TracklistSchema = z.object({
	id: z.number(),
	userId: z.number(),
	name: z.string(),
	createdAt: z.date(),
	editedAt: z.date()
});

export const TracklistResponseSchema = z.object({
	tracklist: z.array(TracklistSchema)
});
