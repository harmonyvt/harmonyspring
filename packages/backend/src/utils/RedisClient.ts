// packages/backend/src/utils/RedisClient.ts
import { Redis } from 'ioredis';

const redisSub = new Redis({
	host: 'localhost', // or your Redis server host
	port: 6379 // or your Redis server port
});

const redisClient = new Redis({
	host: 'localhost', // or your Redis server host
	port: 6379 // or your Redis server port
});

export { redisClient, redisSub };
