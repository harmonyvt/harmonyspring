import { Buffer } from 'node:buffer';
import type { SocketStream } from '@fastify/websocket';
import { Queue, QueueEvents } from 'bullmq';
import type { FastifyRequest } from 'fastify';
import { log } from '@/utils/Logger.js';
import { redisSub } from '@/utils/RedisClient.js';
const queueNames = ['FetchFile', 'FetchVideoYTDLP', 'GenerateGIF', 'GenerateTags', 'ProcessThumbnail'];
export const route = {
	url: '/event/file/:uuid',
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
	// Send a message immediately upon connection of all items in the queue
	for (const queueName of queueNames) {
		const queueEvents = new QueueEvents(queueName);
		log.info(`Queue events for ${queueName} running`);

		queueEvents.on('completed', (job, result) => {
			log.info(`Job completed in queue ${queueName} with job ID: ${job.jobId} and result:`, result);
			connection.socket.send(JSON.stringify({ type: 'COMPLETED', jobId: job.jobId, result }));
		});

		queueEvents.on('waiting', job => {
			log.info(`Job waiting in queue ${queueName} with job ID: ${job.jobId}`);
		});

		queueEvents.on('active', job => {
			log.info(`Job active in queue ${queueName} with job ID: ${job.jobId}`);
		});

		queueEvents.on('progress', job => {
			log.info(
				`Job progress in queue ${queueName} with job ID: ${job.jobId} and progress: ${job.data.status}, ${job.data.progress}`
			);
			connection.socket.send(
				JSON.stringify({
					type: 'PROGRESS',
					jobId: job.jobId,
					status: job.data.status,
					progress: job.data.progress
				})
			);
		});

		// You can also subscribe to other events like 'failed', 'progress', etc.
		queueEvents.on('failed', (job, failedReason) => {
			log.info(`Job failed in queue ${queueName} with job ID: ${job.jobId} and reason:`, failedReason);
		});
	}

	// message to remove
	connection.socket.on('message', async message => {
		let messageString;
		// connection.socket.send(JSON.stringify({ items }));
	});
	connection.socket.on('error', error => {
		log.error(`Queue websocket error: ${error.message}`);
		connection.socket.send(JSON.stringify({ type: 'ERROR', message: error.message }));
	});
};
