import { redisClient } from './RedisClient.js';

interface Log {
	// general structur of a log
	// Entry ID
	hostname: string;
	ip: string;
	method: string;
	msg: string;
	reqId: string;
	responseTime: number;
	statusCode: number;
	url: string;
}
// RedisLogs.ts

export async function fetchLogsSince(lastTimestamp: number): Promise<Log[]> {
	// Assuming logs are stored with a timestamp as their score in a sorted set
	const logs = await redisClient.zrangebyscore('logs', lastTimestamp + 1, '+inf');
	// parse datetime from
	return logs.map(log => JSON.parse(log));
}

// Define the expected structure of groups
type RedisGroupInfo = [string, string][];

export async function setupGroups() {
	// check if groups exist and cast the result to the defined type
	const groups = (await redisClient.xinfo('GROUPS', 'logs')) as RedisGroupInfo;

	const systemLogsExists = groups.some(group => group[1] === 'system-logs');
	if (!systemLogsExists) {
		console.log('Creating system-logs group');
		await redisClient.xgroup('CREATE', 'logs', 'system-logs', '$', 'MKSTREAM');
	}

	const systemQueriesExists = groups.some(group => group[1] === 'system-queries');
	if (!systemQueriesExists) {
		console.log('Creating system-queries group');
		await redisClient.xgroup('CREATE', 'logs', 'system-queries', '$', 'MKSTREAM');
	}

	console.log('Groups are ready');
}
