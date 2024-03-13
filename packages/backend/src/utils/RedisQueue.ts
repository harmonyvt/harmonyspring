import { log } from './Logger.js';
import { redisClient } from './RedisClient.js';
export type Status = {
	date: string;
	event: string;
	fileID: string;
	fileURL: string;
	jobID: string;
	message: string;
};

export type ItemData = {
	itemId: string;
	status: Status;
};

// Add a new item to the user's queue
export const addItem = async (userUUID: string, itemData: ItemData) => {
	try {
		const jobKey = `job:${userUUID}:${itemData.itemId}`;
		// Store item data in a hash
		await redisClient.hset(jobKey, 'status', JSON.stringify(itemData.status));

		// publish to the job channel
		await redisClient.publish('job:' + userUUID, JSON.stringify({ userUUID, itemData }));

		log.debug(`Added item to queue for user ${userUUID}`);
	} catch (error) {
		log.error('Error adding item to queue', error);
	}
};

// Update an item's status
export const updateStatus = async (userUUID: string, itemData: ItemData) => {
	try {
		const jobKey = `job:${userUUID}:${itemData.itemId}`;
		// Update item's status in its hash
		await redisClient.hset(jobKey, 'status', JSON.stringify(itemData.status));
		log.debug(`Updated status for item ${itemData.itemId} to ${itemData.status.message}`);

		// publish to the job channel
		await redisClient.publish('job:' + userUUID, JSON.stringify({ userUUID, itemData }));

		log.debug(`Updated item status for user ${userUUID}`);
	} catch (error) {
		log.error('Error updating item to queue', error);
	}
};

// Remove an item's status
export const removeStatus = async (userUUID: string, itemId: string) => {
	try {
		const jobKey = `job:${userUUID}:${itemId}`;

		// Remove item's hash
		await redisClient.del(jobKey);

		// publish to the job channel
		await redisClient.publish('job' + userUUID, JSON.stringify({ userUUID, itemId }));

		log.debug(`Removed item status for user ${userUUID}`);
	} catch (error) {
		log.error('Error adding item to queue', error);
	}
};

// Get an item's status
export const getStatus = async (userUUID: string, itemId: string) => {
	try {
		const jobKey = `job:${userUUID}:${itemId}`;

		// Retrieve item's status from its hash
		const statusJson = await redisClient.hget(jobKey, 'status');
		log.debug(`Retrieved status for item ${itemId}`);
		return statusJson ? JSON.parse(statusJson) : null;
	} catch (error) {
		log.error('Error getting item status', error);
	}
};

// Get all items' status for a specific user
/*
return export interface Item {
	jobID: string;
	event: string;
	message: string;
	date: string;
}
*/
export const getAllItemsForUser = async (userUUID: string) => {
	try {
		// Use a pattern to match all keys related to the user's queue
		const pattern = `job:${userUUID}:*`;

		// Get all keys matching the pattern
		const keys = await redisClient.keys(pattern);

		// Get all items' status from their hashes
		const items = await Promise.all(
			keys.map(async key => {
				const statusJson = await redisClient.hget(key, 'status');
				return statusJson ? JSON.parse(statusJson) : null;
			})
		);

		log.debug(`Retrieved ${items.length} items for user ${userUUID}`);

		// put most recent date at top of list
		items.sort((a, b) => {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		});

		// reduce items to only the most recent 10
		if (items.length > 10) {
			items.length = 10;
		}

		return items;
	} catch (error) {
		log.error('Error getting all items for user', error);
		return null;
	}
};

// reset whole queue
export const ResetJobs = async (log: any) => {
	try {
		const keys = await redisClient.keys('job:*');
		if (keys.length > 0) {
			await redisClient.del(keys);
			log.debug('Reset all jobs');
		}
	} catch (error) {
		log.error('Error resetting jobs', error);
	}
};

export function createStatus(event: string, message: string, jobID: string, fileID?: string, fileURL?: string): Status {
	return {
		date: new Date().toISOString(),
		event,
		jobID,
		message,
		fileID: fileID ?? '',
		fileURL: fileURL ?? ''
	};
}

export function createItemData(itemId: string, status: Status): ItemData {
	return {
		itemId,
		status
	};
}
