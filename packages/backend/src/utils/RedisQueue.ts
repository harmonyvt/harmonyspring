import { setTimeout } from 'node:timers';
import redis from './RedisClient.js';

export const addToQueue = async (userId: string, itemId: string, status: string) => {
	await redis.set(`queue:${userId}:${itemId}`, status);
};

export const updateStatus = async (userId: string, itemId: string, status: string) => {
	await redis.set(`queue:${userId}:${itemId}`, status);
};

export const getStatus = async (userId: string, itemId: string) => {
	return redis.get(`queue:${userId}:${itemId}`);
};

export const getAllItemsForUser = async (userId: string) => {
	let cursor = '0';
	const items: Record<string, string> = {};

	do {
		const result = await redis.scan(cursor, 'MATCH', `queue:${userId}:*`);
		cursor = result[0];

		for (const key of result[1]) {
			const itemId = key.split(':').pop(); // Extract the itemId from the key
			if (itemId !== undefined) {
				const status = await redis.get(key);
				items[itemId] = status ?? '';
			}
		}
	} while (cursor !== '0');

	return items;
};

// Function to check if a channel exists and create it if not
export async function ensureChannelExists(channel: string) {
	const channels = await redis.pubsub('CHANNELS', '*');
	if (channels.includes(channel)) {
		console.info(`Channel ${channel} already exists.`);
	} else {
		console.info(`Channel ${channel} does not exist. Creating it now.`);
		// Publish a message to the channel to create it
		await redis.publish(channel, 'Initial message');
	}
}

export async function resetChannel(channel: string) {
	console.info(`Resetting channel ${channel}...`);

	// Subscribe to the channel
	await redis.subscribe(channel);

	// Consume all messages without processing them
	redis.on('message', (subscribedChannel, message) => {
		if (subscribedChannel === channel) {
			console.info(`Consumed message: ${message}`);
		}
	});

	// Unsubscribe after a short delay to ensure all messages are consumed
	setTimeout(async () => {
		await redis.unsubscribe(channel);
		console.info(`Unsubscribed from ${channel}. Channel reset.`);
	}, 1000); // Adjust the delay as needed
}
