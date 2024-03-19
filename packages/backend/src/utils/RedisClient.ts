// packages/backend/src/utils/RedisClient.ts
import process from 'node:process';
import { Redis } from 'ioredis';

let host;
if (process.env.NODE_ENV === 'production') {
	host = 'dragonfly';
} else {
	host = 'localhost';
}

export const redisClient = new Redis({
	host,
	port: 6379, // or your Redis server port
	maxRetriesPerRequest: null
});
