import { Buffer } from 'node:buffer';
import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fstatic from '@fastify/static';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import dotenv from 'dotenv';
import fastify from 'fastify';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import jetpack from 'fs-jetpack';
import LiveDirectory from 'live-directory';
import { cleanup } from 'unzipit';
import Routes from './structures/routes.js';
import { SETTINGS, loadSettings } from './structures/settings.js';
import Docs from './utils/Docs.js';
import { log } from './utils/Logger.js';
import Requirements from './utils/Requirements.js';
import { jumpstartStatistics } from './utils/StatsGenerator.js';
import { startUpdateCheckSchedule } from './utils/UpdateCheck.js';
import { createAdminUserIfNotExists, VERSION } from './utils/Util.js';
import { fileWatcher, getFileWatcher } from './utils/Watcher.js';
dotenv.config();

if (!process.env.SENTRY_DSN) {
	console.error('No Sentry DSN provided, exiting...');
	process.exit(1);
}

// Create the Fastify server
const server = fastify({
	trustProxy: true,
	connectionTimeout: 600000,
	// @ts-ignore-error can't use process.env as its undefined
	logger: log,
	disableRequestLogging: true
});

Sentry.init({
	dsn: process.env.SENTRY_DSN as string,

	// We recommend adjusting this value in production, or using tracesSampler
	// for finer control
	tracesSampleRate: 1,
	profilesSampleRate: 1, // Profiling sample rate is relative to tracesSampleRate
	integrations: [
		// Add profiling integration to list of integrations
		new ProfilingIntegration()
	]
});

Sentry.startSpan(
	{
		op: 'rootSpan',
		name: 'Harmonyspring'
	},
	() => {}
);
const watcher = getFileWatcher();

let htmlBuffer: Buffer | null = null;

process.on('SIGINT', async () => {
	console.log('SIGINT received...');
	cleanup();
	await watcher.close();
	await server.close();
});

process.on('SIGTERM', async () => {
	console.log('SIGTERM received...');
	cleanup();
	await watcher.close();
	await server.close();
});

// Stray errors and exceptions capturers
process.on('uncaughtException', error => {
	server.log.error('Uncaught Exception:');
	server.log.error(error);
});

process.on('unhandledRejection', error => {
	server.log.error('Unhandled Rejection:');
	server.log.error(error);
});

const start = async () => {
	server.log.info(`Running Harmonyspring v${VERSION}`);
	// Check the environment has all the requirements before running harmonyspring
	await Requirements(server.log);

	// Create the settings in the database
	await loadSettings();

	// Create the admin user if it doesn't exist
	await createAdminUserIfNotExists();
	await server.register(import('@fastify/websocket'));
	// Register the fastify-sensible plugin
	await server.register(import('@fastify/sensible'));

	// Create the OpenAPI documentation
	await server.register(import('@fastify/swagger'), { ...Docs, transform: jsonSchemaTransform });
	await server.register(import('@scalar/fastify-api-reference'), {
		routePrefix: '/docs',
		configuration: {
			spec: {
				content: () => server.swagger()
			}
		}
	});

	// Route error handler
	// @ts-ignore
	// eslint-disable-next-line promise/prefer-await-to-callbacks
	server.setErrorHandler((error, _, res) => {
		if (error.statusCode) {
			return res.send(error);
		} else {
			server.log.error(error);
			return res.internalServerError('Something went wrong');
		}
	});

	server.addHook('onResponse', (request, reply, done) => {
		if (
			!['/thumbs/', '/assets/'].some(path => request.url.startsWith(path)) ||
			process.env.NODE_ENV !== 'production'
		) {
			server.log.info({
				method: request.method,
				url: request.url,
				statusCode: reply.statusCode,
				responseTime: Math.ceil(reply.elapsedTime),
				ip: request.ip
			});
		}

		done();
	});

	// Enable form-data parsing
	server.addContentTypeParser('multipart/form-data', (_, __, done) => done(null));

	// Add decorator for the user object to use with FastifyRequest
	server.decorateRequest('user', '');

	await server.register(helmet, {
		crossOriginResourcePolicy: false,
		contentSecurityPolicy: false,
		crossOriginEmbedderPolicy: false
	});

	await server.register(cors, {
		preflightContinue: true,
		allowedHeaders: [
			'Accept',
			'Authorization',
			'Connection',
			'Cache-Control',
			'X-Requested-With',
			'Content-Type',
			'albumUuid',
			'X-API-KEY',
			'application/vnd.chibisafe.json', // I'm deprecating this header but will remain here for compatibility reasons
			// @chibisafe/uploarder headers
			'chibi-chunk-number',
			'chibi-chunks-total',
			'chibi-uuid'
		]
	});

	// Create the neccessary folders

	jetpack.dir(fileURLToPath(new URL('../../../uploads/live', import.meta.url)));
	jetpack.dir(fileURLToPath(new URL('../../../uploads/tmp', import.meta.url)));
	jetpack.dir(fileURLToPath(new URL('../../../uploads/zips', import.meta.url)));
	jetpack.dir(fileURLToPath(new URL('../../../uploads/thumbs/square', import.meta.url)));
	jetpack.dir(fileURLToPath(new URL('../../../uploads/thumbs/preview', import.meta.url)));

	// Chokidar implementation
	fileWatcher();

	server.log.debug('Harmonyspring is starting with the following configuration:');
	server.log.debug('');

	const defaults = SETTINGS;
	for (const [key, value] of Object.entries(defaults)) {
		server.log.debug(`${key}: ${JSON.stringify(value)}`);
	}

	server.log.debug('');
	server.log.debug('Loading routes...');
	server.log.debug('');

	// Creating an scoped server instance to pass to the routes in
	// order to limit the rate-limit plugin to only the routes.
	await server.register(async instance => {
		// Scan and load routes into fastify
		await Routes.load(instance);
	});

	if (process.env.NODE_ENV === 'production') {
		if (!jetpack.exists(fileURLToPath(new URL('../dist/site/index.html', import.meta.url)))) {
			server.log.error('Frontend build not found, please run `npm run build` in the frontend directory first');
			process.exit(1);
		}

		// @ts-ignore
		const LiveAssets = new LiveDirectory(fileURLToPath(new URL('../dist/site', import.meta.url)), {
			static: true,
			cache: {
				max_file_count: 50,
				max_file_size: 1024 * 1024 * 2.5
			}
		});

		// Wait for the html buffer with replaced values to be ready
		await getHtmlBuffer();

		server.addHook('onRequest', (req, reply, next) => {
			req.log.debug(req);

			if (req.method !== 'GET' && req.method !== 'HEAD') {
				next();
				return;
			}

			const routes = [
				'/dashboard',
				'/invite',
				'/login',
				'/register',
				'/faq',
				'/features',
				'/about',
				'/privacy',
				'/tos',
				'/a/',
				'/s/',
				'/viewer/'
			];

			const route = routes.some(r => req.url.startsWith(r));

			if (req.url === '/' || route) return reply.type('text/html').send(htmlBuffer);

			const file = LiveAssets.get(req.url.slice(1));
			if (!file) {
				next();
				return;
			}

			// @ts-ignore
			const extension = req.url.slice(1).split('.').pop() as string;

			// Map extension to content type
			const contentType = {
				js: 'text/javascript',
				css: 'text/css',
				html: 'text/html',
				ico: 'image/x-icon',
				png: 'image/png',
				jpg: 'image/jpeg',
				svg: 'image/svg+xml'
			};

			return (
				reply
					.header('etag', file.etag)
					.header('Cache-Control', 'max-age=604800, stale-while-revalidate=86400')
					// @ts-expect-error contentType[extension]
					.type(contentType[extension])
					.send(file.cached ? file.content : file.stream())
			);
		});
	}

	// Serve uploads only if the user didn't change the default value
	if (!SETTINGS.serveUploadsFrom) {
		await server.register(fstatic, {
			root: fileURLToPath(new URL('../../../uploads', import.meta.url))
		});
	}

	// Start the server
	await server.listen({ port: Number(SETTINGS.port), host: SETTINGS.host as string });

	// Uncomment this to generate a swagger.yml file with the OpenAPI documentation
	// const yaml = server.swagger({ yaml: true });
	// await jetpack.writeAsync('./swagger.yml', yaml);

	// Jumpstart statistics scheduler
	await jumpstartStatistics();

	if (!SETTINGS.disableUpdateCheck) {
		await startUpdateCheckSchedule();
	}
};

export const getHtmlBuffer = async () => {
	let indexHTML = jetpack.read(fileURLToPath(new URL('../dist/site/index.html', import.meta.url)), 'utf8');
	if (!indexHTML) {
		server.log.error('There was a problem parsing the frontend');
		process.exit(1);
	}

	indexHTML = indexHTML.replaceAll('{{title}}', SETTINGS.serviceName);
	indexHTML = indexHTML.replaceAll('{{description}}', SETTINGS.metaDescription);
	indexHTML = indexHTML.replaceAll('{{keywords}}', SETTINGS.metaKeywords);
	indexHTML = indexHTML.replaceAll('{{twitter}}', SETTINGS.metaTwitterHandle);
	indexHTML = indexHTML.replaceAll('{{domain}}', SETTINGS.metaDomain);

	const settings = {
		backgroundImageURL: SETTINGS.backgroundImageURL,
		chunkSize: SETTINGS.chunkSize,
		logoURL: SETTINGS.logoURL,
		maxSize: SETTINGS.maxSize,
		serviceName: SETTINGS.serviceName,
		publicMode: SETTINGS.publicMode,
		userAccounts: SETTINGS.userAccounts,
		blockedExtensions: SETTINGS.blockedExtensions,
		useNetworkStorage: SETTINGS.useNetworkStorage
	};

	indexHTML = indexHTML.replaceAll(
		'</body>',
		`<script>window.__CHIBISAFE__ = ${JSON.stringify(settings)};</script></body>`
	);

	htmlBuffer = Buffer.from(indexHTML);
};

void start();
