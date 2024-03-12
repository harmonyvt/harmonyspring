import { Buffer } from 'node:buffer';
import type { SocketStream } from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import { log } from '@/utils/Logger.js';
import { redisSub } from '@/utils/RedisClient.js';
import { getAllItemsForUser, removeStatus } from '@/utils/RedisQueue.js';

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
	log.debug(`FOUND UUID: ${uuid}`);

	await redisSub.subscribe('job:' + uuid, (error, count) => {
		if (error) {
			log.error(`Queue websocket error: ${error.message}`);
		}

		log.debug(`Subscribed to job channel with ${count} subscriptions`);
	});

	redisSub.on('message', async (channel, message) => {
		log.debug(`Received redis message from ${channel}: ${message}`);
		// Send the message to the user
		const items = await getAllItemsForUser(uuid);
		if (!items) {
			log.debug(`No items found for user ${uuid}`);
		}

		connection.socket.send(JSON.stringify({ items }));
	});

	const items = await getAllItemsForUser(uuid);

	// Send a message immediately upon connection of all items in the queue
	connection.socket.send(JSON.stringify({ items }));

	// message to remove
	connection.socket.on('message', async message => {
		let messageString;
		if (Buffer.isBuffer(message)) {
			messageString = message.toString();
		} else {
			messageString = message;
		}

		const remove = JSON.parse(messageString as string) as RemoveMessage;
		log.debug(`Queue websocket message: ${remove.action} ${remove.itemID}`);
		await removeStatus(uuid, remove.itemID);
		const items = await getAllItemsForUser(uuid);
		connection.socket.send(JSON.stringify({ items }));
	});
	connection.socket.on('error', error => {
		log.error(`Queue websocket error: ${error.message}`);
		connection.socket.send(JSON.stringify({ type: 'ERROR', message: error.message }));
	});
};

interface RemoveMessage {
	action: string;
	itemID: string;
}
