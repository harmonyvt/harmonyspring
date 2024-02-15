import process from 'node:process';
import { URL, fileURLToPath } from 'node:url';
import jetpack from 'fs-jetpack';
import { lookpath } from 'lookpath';
import YTDlpWrap from 'yt-dlp-wrap';
export default async (log: any) => {
	const nodeMajorVersion = process.versions.node.split('.')[0];
	if (Number(nodeMajorVersion) < 18) {
		log.error('harmonyspring needs node v18 or newer to run properly, please upgrade.');
		process.exit(1);
	}

	log.debug('Node version: OK');

	const ffmpegExists = await lookpath('ffmpeg');
	if (!ffmpegExists) {
		log.error(
			"harmonyspring couldn't find ffmpeg in your path. ffmpeg is needed to process thumbnails for uploads, please install it."
		);
		process.exit(1);
	}

	log.debug('ffmpeg: OK');

	const YTDLP = YTDlpWrap.default;

	log.debug('yt-dlp: Fetching latest release from GitHub');
	const githubReleasesData = await YTDLP.getGithubReleases(1, 5);

	if (!githubReleasesData) {
		log.error(
			"harmonyspring couldn't fetch yt-dlp releases from GitHub. Please check your internet connection or try again later."
		);
		process.exit(1);
	}

	log.debug('yt-dlp: Finding Helper Folder');
	const HelperFolder = fileURLToPath(new URL(`../../../../helper`, import.meta.url));

	// check if helper folder exists
	jetpack.dir(HelperFolder);

	log.debug('yt-dlp: Downloading yt-dlp from GitHub');
	await YTDLP.downloadFromGithub(HelperFolder + '/yt-dlp').catch(error => {
		log.error(
			"harmonyspring couldn't download yt-dlp. Please check your internet connection or try again later" + error
		);
		process.exit(1);
	});

	log.debug('yt-dlp: OK');
};
