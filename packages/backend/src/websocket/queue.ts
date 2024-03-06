import type { SocketStream } from '@fastify/websocket';
import redis from '@/utils/RedisClient.js';

export const options = {
	url: '/queue',
	method: 'get',
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
export const run = async (connection: SocketStream) => {
	connection.socket.on('message', message => {
		connection.socket.send(message);
	});
	const channel = 'yourChannelName';
	void redis.subscribe(channel, err => {
		if (err) {
			console.error('Failed to subscribe to Redis channel:', err);
			return;
		}

		console.log(`Subscribed to ${channel}. Now listening for messages...`);
	});

	redis.on('message', message => {
		// Handle incoming messages from Redis
		// For example, you might want to send a message to the user based on the content of the message
		const parsedMessage = JSON.parse(message);
		if (parsedMessage.event === 'fileAdded') {
			// When file added to queue, send message to user
			connection.socket.send(JSON.stringify({ type: 'fileAdded', data: parsedMessage.data }));
		} else if (parsedMessage.event === 'fileProcessed') {
			// When file finished processing, send message to user
			connection.socket.send(JSON.stringify({ type: 'fileProcessed', data: parsedMessage.data }));
		} else if (parsedMessage.event === 'fileFailed') {
			// When file failed processing, send message to user
			connection.socket.send(JSON.stringify({ type: 'fileFailed', data: parsedMessage.data }));
		}
	});
};
