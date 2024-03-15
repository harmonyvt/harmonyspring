import type { LogDescriptor } from 'pino';
import { log } from './Logger.js';
import { redisClient } from './RedisClient.js';

// Add log to a stream
export const addLog = async (redisLog: LogDescriptor) => {
	try {
		// store log in a stream
		await redisClient.xadd('logs', '*', 'log', JSON.stringify(redisLog));

		log.debug(`Added log to stream`);
	} catch (error) {
		log.error('Error adding log to stream', error);
	}
};

// Function to get logs in groups of 30
export async function getLogsInBatches(startId = '-', endId = '+', batchSize = 30) {
	let lastId = startId;
	const logs = [];

	while (true) {
		// Adjusted line with 'xrange' and parameters
		const batch = await redisClient.xrange('logs', lastId, endId, 'COUNT', batchSize.toString());

		// Process the batch
		logs.push(...batch);

		if (batch.length < batchSize) {
			break; // Break if the last batch was smaller than the batchSize, indicating the end
		}

		if (batch.length > 0) {
			const lastEntry = batch[batch.length - 1];
			if (lastEntry !== undefined) {
				lastId = lastEntry[0]; // Update lastId to the last entry's ID in the batch
			}
		}
	}

	return logs;
}

export const ResetLogs = async () => {
	try {
		await redisClient.del('logs');
		log.debug('Reset logs');
	} catch (error) {
		log.error('Error resetting jobs', error);
	}
};
