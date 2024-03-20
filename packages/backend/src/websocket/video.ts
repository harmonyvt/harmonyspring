import { setInterval } from 'node:timers';
import type { SocketStream } from '@fastify/websocket';
import type { JobItem } from '@harmonyspring/helpers';
import { Queue, QueueEvents } from 'bullmq';
import type { FastifyRequest } from 'fastify';
import { log } from '@/utils/Logger.js';
import { redisClient } from '@/utils/RedisClient.js';
const queueName = 'FetchVideoYTDLP';
export const route = {
	url: '/event/video/:uuid',
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

	await setupQueueEvents(queueName, connection);
	log.info(`Queue events for ${queueName} running`);

	connection.on('close', () => {
		log.info('Queue websocket connection closed');
	});
	connection.socket.on('error', error => {
		log.error(`Queue websocket error: ${error.message}`);
		connection.socket.send(JSON.stringify({ type: 'ERROR', message: error.message }));
	});
};

// sends the updated queue to the user
async function sendUpdatedQueue(jobType: string, connection: SocketStream) {
	const queue = new Queue(jobType, { connection: redisClient });
	const jobs = await queue.getJobs(['waiting', 'active', 'completed', 'failed']);
	const items = jobs.map(job => job.returnvalue);
	connection.socket.send(JSON.stringify({ items }));
}

// sets up the queue events
async function setupQueueEvents(jobType: string, connection: SocketStream) {
	log.info(`Setting up queue events for ${jobType} queue`);
	const queue = new QueueEvents(jobType, { connection: redisClient });
	await sendUpdatedQueue(jobType, connection);

	queue.on('waiting', async job => {
		log.info(`Job with ID: ${job.jobId} is waiting`);
		await sendUpdatedQueue(jobType, connection);
});
	queue.on('active', async job => {
		log.info(`Job with ID: ${job.jobId} is active`);
		await sendUpdatedQueue(jobType, connection);
	});
	queue.on('progress', job => {
		const progressData = job.data as JobItem;
		log.info(
			`Job with ID: ${progressData.jobId} has progress: ${progressData.jobType} - ${progressData.lastUpdate} - ${progressData.owner} - ${progressData.progress} - ${progressData.status} - ${progressData.title}`
		);
		connection.socket.send(JSON.stringify({ item: progressData }));
	});
	queue.on('completed', async job => {
		log.info(`Job with ID: ${job.jobId} has been completed`);
		await sendUpdatedQueue(jobType, connection);
	});
	queue.on('failed', async (job, error) => {
		log.error(`Job with ID: ${job.jobId} has failed with error: ${error}`);
		await sendUpdatedQueue(jobType, connection);
	});
}
