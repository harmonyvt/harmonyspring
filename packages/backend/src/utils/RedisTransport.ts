import { once } from 'node:events';
import type { Stream } from 'node:stream';
import build from 'pino-abstract-transport';
import type { SonicBoomOpts } from 'sonic-boom';
import { SonicBoom } from 'sonic-boom';
import { redisClient } from './RedisClient.js';

export async function RedisTransport(opts: SonicBoomOpts): Promise<Stream> {
	// SonicBoom is necessary to avoid loops with the main thread.
	// It is the same of pino.destination().
	const destination = new SonicBoom({ dest: opts.dest ?? 1, sync: false });
	await once(destination, 'ready');

	return build(
		async source => {
			for await (const obj of source) {
				const toDrain = !destination.write(obj.msg.toUpperCase() + '\n');

				await redisClient.xadd('logs', '*', 'message', obj.msg);
				// This block will handle backpressure
				if (toDrain) {
					await once(destination, 'drain');
				}
			}
		},
		{
			async close(err) {
				if (err) {
					console.error('Error on transport', err);
				}

				destination.end();
				await once(destination, 'close');
			}
		}
	);
}
