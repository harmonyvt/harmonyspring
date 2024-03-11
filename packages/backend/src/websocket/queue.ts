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
		if (!items) {
			log.info(`No items found for user ${uuid}`);
		}

		connection.socket.send(JSON.stringify({ items }));
	});

	const items = await getAllItemsForUser(uuid);

	// Send a message immediately upon connection of all items in the queue
	connection.socket.send(JSON.stringify({ items }));

	connection.socket.on('error', error => {
		log.error(`Queue websocket error: ${error.message}`);
		connection.socket.send(JSON.stringify({ type: 'ERROR', message: error.message }));
	});
};
