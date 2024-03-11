import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import jetpack from 'fs-jetpack';
import { lookpath } from 'lookpath';
import puppeteer from 'puppeteer-core';
import YTDlpWrap from 'yt-dlp-wrap';
// import { ResetJobs } from './RedisQueue.js';
export default async (log: any) => {
	// await ResetJobs(log);
	const nodeMajorVersion = process.versions.node.split('.')[0];
	if (Number(nodeMajorVersion) < 18) {
		log.error('harmonyspring needs node v18 or newer to run properly, please upgrade.');
		process.exit(1);
	}

	log.info('Node version: OK');

	if (process.env.NODE_ENV === 'production') {
		await puppeteer
			.connect({ browserWSEndpoint: 'ws://browserless:3000' })
			.then(() => {
				log.info('puppeteer: OK');
			})
			.catch((error: any) => {
				log.error('puppeteer: ' + error);
				process.exit(1);
			});
	} else {
		await puppeteer
			.connect({ browserWSEndpoint: 'ws://localhost:3000' })
			.then(() => {
				log.info('puppeteer: OK');
			})
			.catch((error: any) => {
				log.error('puppeteer: ' + error);
				process.exit(1);
			});
	}

	const ffmpegExists = await lookpath('ffmpeg');
	if (!ffmpegExists) {
		log.error(
			"harmonyspring couldn't find ffmpeg in your path. ffmpeg is needed to process thumbnails for uploads, please install it."
		);
		process.exit(1);
	}

	log.info('ffmpeg: OK');

	const YTDLP = YTDlpWrap.default;

	// check if yt-dlp file exists
	const ytDlpExists = jetpack.exists(fileURLToPath(new URL(`../../../../helper/yt-dlp`, import.meta.url)));
	if (ytDlpExists) {
		log.info('yt-dlp: OK');
		return;
	}

	log.info('yt-dlp: Fetching latest release from GitHub');
	const githubReleasesData = await YTDLP.getGithubReleases(1, 5);

	if (!githubReleasesData) {
		log.error(
			"harmonyspring couldn't fetch yt-dlp releases from GitHub. Please check your internet connection or try again later."
		);
		process.exit(1);
	}

	log.info('yt-dlp: Finding Helper Folder');
	const HelperFolder = fileURLToPath(new URL(`../../../../helper`, import.meta.url));

	jetpack.dir(HelperFolder);

	log.info('yt-dlp: Downloading yt-dlp from GitHub');
	await YTDLP.downloadFromGithub(HelperFolder + '/yt-dlp').catch(error => {
		log.error(
			"harmonyspring couldn't download yt-dlp. Please check your internet connection or try again later" + error
		);
		process.exit(1);
	});

	log.info('yt-dlp: OK');
};
