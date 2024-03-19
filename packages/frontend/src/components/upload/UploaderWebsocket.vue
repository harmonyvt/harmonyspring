<template>
	<div class="flex w-full mt-16 flex-col rounded-md items-center justify-center p-4 py-8 max-w-4xl mobile:mt-8">
		<div class="container px-1 md:px-6 max-w-3xl mobile:px-4">
			<div class="grid gap-4">
				<template v-if="items.length > 0">
					<div
						v-for="item in items"
						:key="item.jobID"
						class="border border-gray-600 rounded-lg p-4 dark:bg-gray-800"
					>
						<div class="flex justify-between">
							<a
								:href="item.fileURL"
								class="link cursor-pointer"
								rel="noopener noreferrer"
								target="_blank"
							>
								<div class="flex gap-4">
									<template v-if="item.event === 'InProgress'">
										<ActivityIcon class="w-6 h-6 text-blue-400" />
									</template>
									<template v-else-if="item.event === 'Error'">
										<BugIcon class="w-6 h-6 text-red-500" />
									</template>
									<template v-else-if="item.event === 'Finish'">
										<GoalIcon class="w-12 h-12 text-green-400" />
										<img :src="retrieveThumb(item.fileURL)" class="w-12 h-12" />
									</template>
									<div class="grid gap-1">
										<h3 class="text-lg font-semibold text-white">
											{{ item.message }}
										</h3>
										<p class="text-sm text-gray-400">
											Job ID: {{ item.jobID }} | Event: {{ item.event }} | File:
											{{ item.fileID ?? 'N/A' }}
										</p>
									</div>
								</div>
							</a>
							<Button
								className="text-white border-gray-600 hover:border-red-500 hover:text-red-500"
								variant="outline"
								@click="removeJob(item.jobID)"
							>
								Remove
							</Button>
						</div>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';
import { ActivityIcon, GoalIcon, BugIcon } from 'lucide-vue-next';
import { computed, onUnmounted, ref, watchEffect } from 'vue';
import { useUserStore } from '@/store';
export interface ItemData {
	fileID: string;
	jobID: string;
	outcome: number;
	status: string; // Use 'number' type for integers in TypeScript
}
const userStore = useUserStore();
const ownUser = computed(() => userStore.user);
// Dynamically determine the WebSocket host based on the environment
const wsHost = computed(() => {
	if (import.meta.env.NODE_ENV === 'production') {
		// eslint-disable-next-line n/prefer-global/url
		const reference = new URL(import.meta.url);
		if (reference.protocol === 'https:') {
			// eslint-disable-next-line n/prefer-global/url
			return new URL(import.meta.url).hostname;
		} else {
			// eslint-disable-next-line n/prefer-global/url
			return `${new URL(import.meta.url).hostname}:${new URL(import.meta.url).port}`;
		}
	} else {
		return 'localhost:8000';
	}
});
const secure = computed(() => {
	// if import.meta.url.protocol is 'https:', then return secure websocket else return insecure
	// eslint-disable-next-line n/prefer-global/url
	const reference = new URL(import.meta.url);
	if (reference.protocol === 'https:') {
		return 'wss';
	} else {
		return 'ws';
	}
});
const {
	data: jobData,
	send: jobSend,
	close: jobClose
} = useWebSocket(`${secure.value}://${wsHost.value}/event/video/${ownUser.value.uuid}`, {
	autoReconnect: true
});

const items = ref<Item[]>([]);

export interface Message {
	items: Item[];
}

export interface Item {
	jobID: string;
	event: string;
	message: string;
	date: Date;
	fileID: string;
	fileURL: string;
}

onUnmounted(() => {
	jobClose();
});

watchEffect(() => {
	if (jobData.value) {
		try {
			const message = JSON.parse(jobData.value) as Message;
			console.log(message);
			items.value = message.items;
			console.log(items);
		} catch (error) {
			console.error(error);
		}
	}
});

const removeJob = async (itemID: string) => {
	console.log('Removing job:', itemID);
	jobSend(JSON.stringify({ action: 'remove', itemID }));
};

const retrieveThumb = (fileUrl: string) => {
	try {
		console.log('Retrieving thumb:', fileUrl);
		// eslint-disable-next-line n/prefer-global/url
		const url = new URL(fileUrl);
		// extract fileID from url
		const fileID = url.pathname.split('/').pop();

		// if file id has .mp3, .wav or .ogg extension, return default audioUrl
		if (fileID?.includes('.mp3') || fileID?.includes('.wav') || fileID?.includes('.ogg')) {
			return 'https://cdn.7tv.app/emote/60b00d1f0d3a78a196f803e3/1x.webp';
		}

		// if fileid has no extension, return default fileUrl
		if (!fileID?.includes('.')) {
			return 'https://cdn.7tv.app/emote/645c29a0a93fbaf6fa2b5647/1x.webp';
		}

		const thumbUrl = `${url.origin}/thumbs/${fileID?.split('.')[0]}.webp`;
		return thumbUrl;
	} catch (error) {
		console.error(error);
		return fileUrl;
	}
};
</script>
