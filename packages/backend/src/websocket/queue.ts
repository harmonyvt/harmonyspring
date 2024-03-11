import { Buffer } from 'node:buffer';
import type { SocketStream } from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import { log } from '@/utils/Logger.js';
import { redisSub } from '@/utils/RedisClient.js';
import { getAllItemsForUser } from '@/utils/RedisQueue.js';

export const route = {
	url: '/queue/:uuid',
	middlewares: [
		{
			name: 'apiKey'
		},
		{
			name: 'auth',
			optional: true
		}
	]
};

// queue websocket handles updating the user on the status of their uploads
export const run = async (connection: SocketStream, req: FastifyRequest) => {
	const { uuid } = req.params as { uuid: string };
	log.info(`FOUND UUID: ${uuid}`);

	await redisSub.subscribe('queue-updates', (error, count) => {
		if (error) {
			log.error(`Queue websocket error: ${error.message}`);
		}

		log.info(`Subscribed to queue-updates channel with ${count} subscriptions`);
	});

	redisSub.on('message', async (channel, message) => {
		log.info(`Received redis message from ${channel}: ${message}`);
		// Send the message to the user
		const items = await getAllItemsForUser(uuid);
		for (const item of Object.values(items)) {
			connection.socket.send(
				JSON.stringify({
					type: 'UPDATE',
					fileID: item.fileID,
					jobID: item.jobID,
					outcome: item.outcome,
					status: item.status
				})
			);
		}
	});

	const items = await getAllItemsForUser(uuid);
	/*
	export interface ItemData {
	fileID: string;
	jobID: string;
	outcome: number;
	status: string; // Use 'number' type for integers in TypeScript
}
	*/
	// Send a message immediately upon connection of all items in the queue
	for (const item of Object.values(items)) {
		connection.socket.send(
			JSON.stringify({
				type: 'INIT',
				fileID: item.fileID,
				jobID: item.jobID,
				outcome: item.outcome,
				status: item.status
			})
		);
	}

	// Setup event listener for incoming messages
	connection.socket.on('message', (data, isBinary) => {
		let messageText;
		if (isBinary) {p
			// If the message is binary, you might want to handle it differently
			// For example, converting a Buffer to a string (assuming UTF-8 encoding)
			if (Buffer.isBuffer(data)) {
				messageText = data.toString('utf8'); // Use 'utf8' as per ESLint suggestion
			} else {
				log.error('Expected data to be a Buffer, but it was not.');
			}
		} else {
			// If the message is not binary, it's safe to assume it's already a string
			messageText = data;
		}

		log.info(`User ${uuid} sent message: ${messageText}`);
	});

	connection.socket.on('error', error => {
		log.error(`Queue websocket error: ${error.message}`);
		connection.socket.send(JSON.stringify({ type: 'ERROR', message: error.message }));
	});
};
