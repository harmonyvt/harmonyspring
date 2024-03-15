import { setInterval, clearInterval } from 'node:timers';
import type { SocketStream } from '@fastify/websocket';
import type { FastifyRequest } from 'fastify';
import { fetchLogsSince } from '@/utils/RedisLogs.js';

export const route = {
	url: '/logs',
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

export const run = async (connection: SocketStream, req: FastifyRequest) => {
	let lastTimestamp = Date.now();

	const fetchAndSendLogs = async () => {
		const logs = await fetchLogsSince(lastTimestamp);
		if (logs.length > 0) {
			const newLastTimestamp = new Date(logs[logs.length - 1].timestamp).getTime();
			lastTimestamp = newLastTimestamp;
			connection.socket.send(JSON.stringify({ logs }));
		}
	};

	// Initial fetch and send
	await fetchAndSendLogs();

	// Set up polling every second
	const intervalId = setInterval(fetchAndSendLogs, 1000);

	connection.socket.on('close', () => {
		clearInterval(intervalId);
	});
};
