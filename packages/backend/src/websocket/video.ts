import { setInterval } from 'node:timers';
import type { SocketStream } from '@fastify/websocket';
import { Queue } from 'bullmq';
import type { FastifyRequest } from 'fastify';
import { log } from '@/utils/Logger.js';
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

	const queue = new Queue(queueName);
	log.info(`Queue events for ${queueName} running`);

	// fetch all jobs in the queue
	const jobs = await queue.getJobs(['waiting', 'active', 'completed', 'failed']);
	const items = jobs.map(job => job.data);
	connection.socket.send(JSON.stringify({ items }));

	// every second submit the status of all jobs in the queue
	setInterval(async () => {
		if (uuid === undefined) {
			return;
		}

		const jobs = await queue.getJobs(['waiting', 'active', 'completed', 'failed']);
		const items = jobs.map(job => job.data);
		connection.socket.send(JSON.stringify({ items }));
	}, 1000);
	// Send a message immediately upon connection of all items in the queue
	/*
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
	*/

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
