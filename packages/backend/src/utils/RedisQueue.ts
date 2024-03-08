import { log } from './Logger.js';
import { redisClient } from './RedisClient.js';

export const addToQueue = async (userUUID: string, itemId: string, status: string) => {
	log.info(`Adding item ${itemId} to queue for user ${userUUID}`);
	await redisClient.set(`queue:${userUUID}:${itemId}`, status);
	// Publish a message indicating an item has been added to the queue
	await redisClient.publish('queue-updates', JSON.stringify({ action: 'add', userUUID, itemId, status }));
};

export const updateStatus = async (userUUID: string, itemId: string, status: string) => {
	log.info(`Updating status of item ${itemId} for user ${userUUID} to ${status}`);
	await redisClient.set(`queue:${userUUID}:${itemId}`, status);
	// Publish a message indicating an item's status has been updated
	await redisClient.publish('queue-updates', JSON.stringify({ action: 'update', userUUID, itemId, status }));
};

export const removeStatus = async (userUUID: string, itemId: string) => {
	log.info(`Removing item ${itemId} from queue for user ${userUUID}`);
	await redisClient.del(`queue:${userUUID}:${itemId}`);
	// Publish a message indicating an item has been removed from the queue
	await redisClient.publish('queue-updates', JSON.stringify({ action: 'remove', userUUID, itemId }));
};

export const getStatus = async (userUUID: string, itemId: string) => {
	log.info(`Getting status of item ${itemId} for user ${userUUID}`);
	return redisClient.get(`queue:${userUUID}:${itemId}`);
};

export const getAllItemsForUser = async (userUUID: string) => {
	log.info(`Getting all items for user ${userUUID}`);
	let cursor = '0';
	const items: Record<string, string> = {};

	do {
		const result = await redisClient.scan(cursor, 'MATCH', `queue:${userUUID}:*`);
		cursor = result[0];

		for (const key of result[1]) {
			const itemId = key.split(':').pop(); // Extract the itemId from the key
			if (itemId !== undefined) {
				const status = await redisClient.get(key);
				items[itemId] = status ?? '';
			}
		}
	} while (cursor !== '0');

	log.info(`Found ${Object.keys(items).length} items for user ${userUUID}`);

	return items;
};

// reset whole queue
export const resetQueue = async () => {
	log.info('Resetting queue');
	let cursor = '0';
	do {
		const result = await redisClient.scan(cursor, 'MATCH', 'queue:*');
		cursor = result[0];

		for (const key of result[1]) {
			await redisClient.del(key);
		}
	} while (cursor !== '0');
};
