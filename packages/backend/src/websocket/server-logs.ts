import { Buffer } from 'node:buffer';
import type { SocketStream } from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import { log } from '@/utils/Logger.js';
import { redisSub } from '@/utils/RedisClient.js';

export const route = {
	url: '/logs/:uuid',
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
interface UpdateStatus {
	action: string;
	itemId: string;
	status: string;
	userUUID: string;
}
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

	redisSub.on('message', (channel, message) => {
		log.info(`Received message from ${channel}: ${message}`);
		const updateMessage = JSON.parse(message) as UpdateStatus;
		const formattedMessage = `${updateMessage.itemId} [${updateMessage.userUUID}] - ${updateMessage.status}`;
		// Send the message to the user
		connection.socket.send(JSON.stringify({ event: 'ACTIVE', formattedMessage }));
	});

	redisSub.on('error', error => {
		log.error(`Queue websocket error: ${error.message}`);
		connection.socket.send(JSON.stringify({ event: 'ERROR', message: error.message }));
	});

	// Send a message immediately of success upon connection
	connection.socket.send(
		JSON.stringify({
			event: 'INFO',
			formattedMessage: `${uuid} - Connected successfully!`
		})
	);

	// Setup event listener for incoming messages
	connection.socket.on('message', (data, isBinary) => {
		let messageText;
		if (isBinary) {
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
		connection.socket.send(JSON.stringify({ event: 'ERROR', message: error.message }));
	});
};
