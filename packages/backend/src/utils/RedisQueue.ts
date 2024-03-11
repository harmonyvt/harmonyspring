import { log } from './Logger.js';
import { redisClient } from './RedisClient.js';

export interface ItemData {
	fileID: string;
	jobID: string;
	outcome: number;
	status: string; // Use 'number' type for integers in TypeScript
}

export const addItem = async (userUUID: string, itemId: string, itemData: ItemData) => {
	const sortedKey = `queue:${userUUID}`;
	log.info(`Adding item ${itemData.jobID} to queue for user ${userUUID}`);
	await redisClient.set(`queue:${userUUID}:${itemData.jobID}`, JSON.stringify(itemData));
	// Publish a message indicating an item has been added to the queue
	await redisClient.publish('queue-updates', JSON.stringify({ action: 'add', userUUID, itemData }));
};

export const updateStatus = async (userUUID: string, itemData: ItemData) => {
	log.info(`Updating status of item ${itemData.jobID} for user ${userUUID}`);
	await redisClient.set(`queue:${userUUID}:${itemData.jobID}`, JSON.stringify(itemData));
	// Publish a message indicating an item's status has been updated
	await redisClient.publish('queue-updates', JSON.stringify({ action: 'update', userUUID, itemData }));
};

export const removeStatus = async (userUUID: string, itemData: ItemData) => {
	log.info(`Removing item ${itemData.jobID} from queue for user ${userUUID}`);
	await redisClient.del(`queue:${userUUID}:${itemData.jobID}`);
	// Publish a message indicating an item has been removed from the queue
	await redisClient.publish('queue-updates', JSON.stringify({ action: 'remove', userUUID, itemData }));
};

export const getStatus = async (userUUID: string, itemId: string) => {
	log.info(`Getting status of item ${itemId} for user ${userUUID}`);
	return redisClient.get(`queue:${userUUID}:${itemId}`);
};

// get all items for a user, items = {{jobID, status}[]}
export const getAllItemsForUser = async (userUUID: string): Promise<Record<string, ItemData>> => {
	log.info(`Getting all items for user ${userUUID}`);
	let cursor = '0';
	const items: Record<string, ItemData> = {};

	do {
		const result = await redisClient.scan(cursor, 'MATCH', `queue:${userUUID}:*`);
		cursor = result[0];

		for (const key of result[1]) {
			const jobID = key.split(':').pop(); // Extract the itemId from the key
			if (jobID !== undefined) {
				const jsonString = await redisClient.get(key);
				if (jsonString) {
					try {
						const itemData: ItemData = JSON.parse(jsonString);
						items[jobID] = itemData;
					} catch (error) {
						log.error(`Error parsing JSON for key: ${key}`, error);
						// Optionally handle the error, e.g., by continuing to the next key
					}
				} else {
					log.info(`No data found for key: ${key}`);
				}
			}
		}
	} while (cursor !== '0');

	log.info(`Found ${Object.keys(items).length} items for user ${userUUID}`);

	return items;
};

// reset whole queue
export const resetQueue = async (log: any) => {
	log.info('Resetting queue');
	let cursor = '0';

	do {
		// Use SCAN to find keys related to the queue, with a pattern of 'queue:*'
		const result = await redisClient.scan(cursor, 'MATCH', 'queue:*');
		cursor = result[0]; // Update cursor for the next SCAN iteration

		// result[1] contains the list of keys that match the pattern 'queue:*'
		for (const key of result[1]) {
			// Delete each key found
			await redisClient.del(key);
		}
	} while (cursor !== '0'); // Continue until SCAN returns a cursor of '0', indicating completion

	log.info('Queue has been reset');
};
