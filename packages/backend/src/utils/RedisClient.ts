// packages/backend/src/utils/RedisClient.ts
import { Redis } from 'ioredis';

const redis = new Redis({
	host: 'localhost', // or your Redis server host
	port: 6379 // or your Redis server port
});

export default redis;
